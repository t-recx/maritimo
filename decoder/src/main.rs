use amiquip::{
    Connection, ConsumerMessage, ConsumerOptions, ExchangeDeclareOptions, ExchangeType, Publish,
    QueueDeclareOptions, Result,
};
use decoder::error::MissingEnvironmentVariableError;
use redis::Client;
use std::env;
use std::error::Error;

fn main() -> Result<(), Box<dyn Error>> {
    env_logger::init();

    let rabbitmq_uri_env_var_name = "MARITIMO_RABBITMQ_URI";
    let redis_uri_env_var_name = "MARITIMO_REDIS_URI";
    let incoming_queue_env_var_name = "MARITIMO_RABBITMQ_ENCODED_MESSAGES_QUEUE_NAME";
    let outgoing_exchange_env_var_name = "MARITIMO_RABBITMQ_DECODED_MESSAGES_EXCHANGE_NAME";

    let rabbitmq_uri;
    let redis_uri;
    let incoming_queue;
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

    match env::var(redis_uri_env_var_name) {
        Ok(value) => redis_uri = value,
        Err(_) => {
            return Err(MissingEnvironmentVariableError {
                message: format!(
                    "No redis URI configured. Set {} environment variable",
                    redis_uri_env_var_name
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
            durable: true,
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

    let redis_client = Client::open(redis_uri)?;
    let mut redis_connection = redis_client.get_connection()?;

    println!("Connected to {}", rabbitmq_uri);

    for (i, message) in consumer.receiver().iter().enumerate() {
        match message {
            ConsumerMessage::Delivery(delivery) => {
                let body_string = String::from_utf8_lossy(&delivery.body);
                let sentences = body_string.split('\n').collect::<Vec<&str>>();

                for (n, sentence) in sentences
                    .iter()
                    .map(|x| x.trim())
                    .filter(|x| x.len() > 0)
                    .enumerate()
                {
                    println!("({:>3}) [{:>3}] {}", i, n, sentence);

                    match decoder::decode(&sentence, &mut redis_connection, &incoming_queue) {
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

                consumer.ack(delivery)?;
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
