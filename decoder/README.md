# [Maritimo](https://maritimo.digital/) &middot; Decoder

Decoder is a rust application that is used to decode NMEA/AIS sentences. It works by picking up encoded messages from a RabbitMQ worker queue and outputting the decoded messages in json format to a RabbitMQ publish/subscribe exchange.

Since the same AIS message can be spread in multiple sentences and to allow for multiple decoder instances to pick up work from the same station source, some state is also kept in a Redis datastore.

## Requirements

- Rust

## Configuration

Configuration is done via environment variables.

| Name                                             | Description                               |
| ------------------------------------------------ | ----------------------------------------- |
| MARITIMO_REDIS_URI                               | URI for the Redis instance                |
| MARITIMO_RABBITMQ_URI                            | URI for the RabbitMQ broker instance      |
| MARITIMO_RABBITMQ_ENCODED_MESSAGES_QUEUE_NAME    | Broker queue name for encoded messages    |
| MARITIMO_RABBITMQ_DECODED_MESSAGES_EXCHANGE_NAME | Broker exchange name for decoded messages |

## Running

Inside the decoder directory, run:

    $ cargo run --bin decoder

## Tests

To run the tests execute the following command from the root of the decoder application directory:

    $ cargo test -- --test-threads=1

A Redis instance must be running on the URI configured on the MARITIMO_TEST_REDIS_URI environment variable.

## Formating code

To format code execute the following command from the root of the decoder application directory:

    $ cargo fmt
