use amiquip::{
    Connection, ConsumerMessage, ConsumerOptions, ExchangeDeclareOptions, ExchangeType, FieldTable,
    Publish, QueueDeclareOptions, Result,
};
use std::collections::HashMap;

fn main() -> Result<()> {
    env_logger::init();

    let mut incoming_connection = Connection::insecure_open("amqp://guest:guest@localhost:5672")?;

    let incoming_channel = incoming_connection.open_channel(None)?;

    let incoming_exchange = incoming_channel.exchange_declare(
        ExchangeType::Fanout,
        "stations",
        ExchangeDeclareOptions::default(),
    )?;

    let queue = incoming_channel.queue_declare(
        "",
        QueueDeclareOptions {
            exclusive: true,
            ..QueueDeclareOptions::default()
        },
    )?;
    println!("created exclusive queue {}", queue.name());

    queue.bind(&incoming_exchange, "", FieldTable::new())?;

    let consumer = queue.consume(ConsumerOptions {
        no_ack: true,
        ..ConsumerOptions::default()
    })?;
    println!("Waiting for stations. Press Ctrl-C to exit.");

    let mut acc = HashMap::new();

    let mut outgoing_connection = Connection::insecure_open("amqp://guest:guest@localhost:5672")?;

    let outgoing_channel = outgoing_connection.open_channel(None)?;

    let outgoing_exchange = outgoing_channel.exchange_declare(
        ExchangeType::Fanout,
        "messages",
        ExchangeDeclareOptions::default(),
    )?;

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
    outgoing_connection.close()
}
