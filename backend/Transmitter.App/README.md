# [Maritimo](https://maritimo.digital/) &middot; Transmitter

Transmitter is a dotnet application that is used to transmit newly decoded AIS messages through a Signal-R hub. It works by subscribing to a RabbitMQ exchange where the decoded messages are streamed into and passing them along to web clients that are connected to the hub.

## Signal-R API

| Endpoint | Method          |                   Data                    | Notes                                                                                 |
| :------: | --------------- | :---------------------------------------: | ------------------------------------------------------------------------------------- |
|   /hub   | ReceiveBuffered | [List\<DTOObjectData\>](DTOObjectData.cs) | Collects messages for a configurable number of seconds before sending the entire list |

## Requirements

- Dotnet

## Configuration

Configuration is done via environment variables.

| Name                                             | Description                                                              |
| ------------------------------------------------ | ------------------------------------------------------------------------ |
| MARITIMO_RABBITMQ_URI                            | URI for the RabbitMQ broker instance                                     |
| MARITIMO_RABBITMQ_DECODED_MESSAGES_EXCHANGE_NAME | Broker exchange name for decoded messages                                |
| MARITIMO_CORS_ORIGIN_WHITELIST                   | CORS origin whitelist                                                    |
| MARITIMO_TRANSMITTER_BUFFER_SECONDS              | Seconds to buffer messages before sending them to ReceiveBuffered method |
| MARITIMO_DB_CONNECTION_STRING                    | Database connection string                                               |
| MARITIMO_DB_CACHE_MINUTES_EXPIRATION             | Minutes until expiration of a cache entry for a station/object           |
| MARITIMO_LOG_LEVEL_MINIMUM                       | Minimum logging level (TRACE/DEBUG/INFORMATION/WARNING/ERROR/NONE)       |

## Running

Inside the transmitter directory, run:

    $ dotnet run

## Tests

To run the tests execute the following command from the root of the backend applications directory:

    $ dotnet test Transmitter.sln

## Formating code

To format code execute the following command from the root of the backend applications directory:

    $ dotnet format -v diag Transmitter.sln
