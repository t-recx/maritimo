use amiquip::{
    Connection, ConsumerMessage, ConsumerOptions, ExchangeDeclareOptions, ExchangeType, Publish,
    QueueDeclareOptions, Result,
};
use decoder::error::IncorrectEnvironmentVariableValueError;
use decoder::error::MissingEnvironmentVariableError;
use env_logger::Builder;
use log::{debug, error, info, warn, LevelFilter};
use std::collections::HashMap;
use std::env;
use std::error::Error;

fn main() -> Result<(), Box<dyn Error>> {
    let rabbitmq_uri_env_var_name = "MARITIMO_RABBITMQ_URI";
    let incoming_queue_env_var_name = "MARITIMO_RABBITMQ_ENCODED_MESSAGES_QUEUE_NAME";
    let outgoing_exchange_env_var_name = "MARITIMO_RABBITMQ_DECODED_MESSAGES_EXCHANGE_NAME";
    let loglevel_env_var_name = "MARITIMO_LOG_LEVEL_MINIMUM";

    let rabbitmq_uri;
    let incoming_queue;
    let outgoing_exchange;
    let loglevel;

    match env::var(loglevel_env_var_name) {
        Ok(value) => loglevel = value,
        Err(_) => {
            return Err(MissingEnvironmentVariableError {
                message: format!(
                    "No minimum log level configured. Set {} environment variable",
                    loglevel_env_var_name
                )
                .to_string(),
            }
            .into());
        }
    }

    let level_filter = match loglevel.to_uppercase().as_str() {
        "TRACE" => LevelFilter::Trace,
        "DEBUG" => LevelFilter::Debug,
        "INFORMATION" => LevelFilter::Info,
        "WARNING" => LevelFilter::Warn,
        "ERROR" => LevelFilter::Error,
        "CRITICAL" => LevelFilter::Error,
        "NONE" => LevelFilter::Off,
        _ => {
            return Err(IncorrectEnvironmentVariableValueError {
            message: format!(
                "Minimum log level specified not a valid value (currently set to '{}'). Set {} environment variable to one of the following values: Trace, Debug, Information, Warning, Error, Critical, None.",
                loglevel,
                loglevel_env_var_name
            )
            .to_string(),
        }
        .into());
        }
    };

    Builder::new().filter_level(level_filter).init();

    match env::var(rabbitmq_uri_env_var_name) {
        Ok(value) => rabbitmq_uri = value,
        Err(_) => {
            return Err(MissingEnvironmentVariableError {
                message: format!(
                    "No broker URI configured. Set {} environment variable",
                    rabbitmq_uri_env_var_name
                )
                .to_string(),
            }
            .into());
        }
    }

    match env::var(incoming_queue_env_var_name) {
        Ok(value) => incoming_queue = value,
        Err(_) => {
            return Err(MissingEnvironmentVariableError {
                message: format!(
                    "No queue name for encoded messages configured. Set {} environment variable",
                    incoming_queue_env_var_name
                )
                .to_string(),
            }
            .into());
        }
    }

    match env::var(outgoing_exchange_env_var_name) {
        Ok(value) => outgoing_exchange = value,
        Err(_) => {
            return Err(MissingEnvironmentVariableError {
                message: format!(
                    "No exchange name for decoded messages configured. Set {} environment variable",
                    outgoing_exchange_env_var_name
                )
                .to_string(),
            }
            .into());
        }
    }

    let mut incoming_connection = Connection::insecure_open(&rabbitmq_uri)?;

    let incoming_channel = incoming_connection.open_channel(None)?;

    let queue = incoming_channel.queue_declare(
        &incoming_queue,
        QueueDeclareOptions {
            durable: false,
            ..QueueDeclareOptions::default()
        },
    )?;

    incoming_channel.qos(0, 1, false)?;

    let consumer = queue.consume(ConsumerOptions::default())?;

    let mut outgoing_connection = Connection::insecure_open(&rabbitmq_uri)?;

    let outgoing_channel = outgoing_connection.open_channel(None)?;

    let outgoing_exchange = outgoing_channel.exchange_declare(
        ExchangeType::Fanout,
        outgoing_exchange,
        ExchangeDeclareOptions::default(),
    )?;

    let mut acc = HashMap::new();

    info!("Connected to {}", rabbitmq_uri);

    for (_, message) in consumer.receiver().iter().enumerate() {
        match message {
            ConsumerMessage::Delivery(delivery) => {
                let delivery_body = delivery.body.to_vec();
                let body_string = String::from_utf8_lossy(&delivery_body);
                let sentences = body_string.split('\n').collect::<Vec<&str>>();

                consumer.ack(delivery)?;

                for (_, sentence) in sentences
                    .iter()
                    .map(|x| x.trim())
                    .filter(|x| x.len() > 0)
                    .enumerate()
                {
                    debug!("{}", sentence);

                    match decoder::decode(&sentence, &mut acc, &incoming_queue) {
                        Ok(opt) => match opt {
                            Some(value) => match serde_json::to_string(&value) {
                                Ok(json) => {
                                    outgoing_exchange.publish(Publish::new(json.as_bytes(), ""))?;
                                    debug!("Sent {:?}", json);
                                }
                                Err(e) => error!("{:?}", e),
                            },
                            _ => (),
                        },
                        Err(e) => error!("{:?}", e),
                    }
                }
            }
            other => {
                warn!("Consumer ended: {:?}", other);
                break;
            }
        }
    }

    incoming_connection.close()?;
    outgoing_connection.close()?;

    Ok(())
}
