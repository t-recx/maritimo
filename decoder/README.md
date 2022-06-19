# [Maritimo](https://maritimo.digital/) &middot; Decoder

Decoder is a rust application that is used to decode NMEA/AIS sentences. It works by picking up encoded messages from a RabbitMQ worker queue and outputting the decoded messages in json format to a RabbitMQ publish/subscribe exchange.

Since the same AIS message can be spread in multiple sentences and to allow for multiple decoder instances to pick up work from the same station source, some state is also kept in a Redis datastore.

## Supported message types

| Number  | Type                             | Description                                                                                                                                     |
| :-----: | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 1, 2, 3 | Position Report Class A          | Navigational information (position, status, heading, COG, SOG, etc.)                                                                            |
|    4    | Base Station Report              | Used by fixed-location base stations to report position and time references                                                                     |
|    5    | Static and Voyage                | Used to provide information about the vessel and voyage (like name, ship type, dimensions, destination, etc.)                                   |
|   18    | Position Report Class B          | Used by vessels using Class B transmitters (includes information about position, heading, COG, SOG, etc)                                        |
|   19    | Extended Position Report Class B | Used by vessels using Class B transmitters and it's similar to messages of type 18, with more information (like name, ship type and dimensions) |
|   21    | Aid-to-Navigation Report         | Used by aids to navigation (like buoys and lighthouses) to provide identification and location data                                             |
|   24    | Static Data Report Class B       | Similar to messages of type 5 but for Class B transmitters. Includes information like name, ship type, dimensions, etc.                         |
|   27    | Long Range AIS Broadcast         | Used for long-range detection of AIS Class A vessels. It's similar to Position Report Class A messages but more compressed                      |

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

### Configuration

Test configuration is done via environment variables.

| Name                                             | Description                               |
| ------------------------------------------------ | ----------------------------------------- |
| MARITIMO_TEST_REDIS_URI                          | URI for the Redis instance used in tests  |

### Running

To run the tests execute the following command from the root of the decoder application directory:

    $ cargo test -- --test-threads=1

## Formating code

To format code execute the following command from the root of the decoder application directory:

    $ cargo fmt
