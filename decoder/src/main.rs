use amiquip::{
    Connection, ConsumerMessage, ConsumerOptions, ExchangeDeclareOptions, ExchangeType, FieldTable,
    Publish, QueueDeclareOptions, Result,
};
use decoder::error::MissingEnvironmentVariableError;
use std::collections::HashMap;
use std::env;
use std::error::Error;

fn main() -> Result<(), Box<dyn Error>> {
    env_logger::init();

    let rabbitmq_uri_env_var_name = "MARITIMO_RABBITMQ_URI";
    let incoming_exchange_env_var_name = "MARITIMO_RABBITMQ_ENCODED_MESSAGES_EXCHANGE_NAME";
    let outgoing_exchange_env_var_name = "MARITIMO_RABBITMQ_DECODED_MESSAGES_EXCHANGE_NAME";

    let rabbitmq_uri;
    let incoming_exchange;
    let outgoing_exchange;

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

    match env::var(incoming_exchange_env_var_name) {
        Ok(value) => incoming_exchange = value,
        Err(_) => {
            return Err(MissingEnvironmentVariableError {
                message: format!(
                    "No exchange name for encoded messages configured. Set {} environment variable",
                    incoming_exchange_env_var_name
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

    let incoming_exchange = incoming_channel.exchange_declare(
        ExchangeType::Fanout,
        incoming_exchange,
        ExchangeDeclareOptions::default(),
    )?;

    let queue = incoming_channel.queue_declare(
        "",
        QueueDeclareOptions {
            exclusive: true,
            ..QueueDeclareOptions::default()
        },
    )?;

    queue.bind(&incoming_exchange, "", FieldTable::new())?;

    let consumer = queue.consume(ConsumerOptions {
        no_ack: true,
        ..ConsumerOptions::default()
    })?;

    let mut acc = HashMap::new();

    let mut outgoing_connection = Connection::insecure_open(&rabbitmq_uri)?;

    let outgoing_channel = outgoing_connection.open_channel(None)?;

    let outgoing_exchange = outgoing_channel.exchange_declare(
        ExchangeType::Fanout,
        outgoing_exchange,
        ExchangeDeclareOptions::default(),
    )?;

    println!("Connected to {}", rabbitmq_uri);

    for (i, message) in consumer.receiver().iter().enumerate() {
        match message {
            ConsumerMessage::Delivery(delivery) => {
                let ais_sentence = String::from_utf8_lossy(&delivery.body);
                println!("({:>3}) {}", i, ais_sentence);

                match decoder::decode(&ais_sentence, &mut acc) {
                    Ok(opt) => match opt {
                        Some(value) => match serde_json::to_string(&value) {
                            Ok(json) => {
                                outgoing_exchange.publish(Publish::new(json.as_bytes(), ""))?;
                                println!("Sent {:?}", json);
                            }
                            Err(e) => println!("{:?}", e),
                        },
                        _ => (),
                    },
                    Err(e) => println!("{:?}", e),
                }
            }
            other => {
                println!("Consumer ended: {:?}", other);
                break;
            }
        }
    }

    incoming_connection.close()?;
    outgoing_connection.close()?;

    Ok(())
}
