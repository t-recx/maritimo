# [Maritimo](https://maritimo.digital/) &middot; Persister

Persister is a dotnet application that is used to store decoded AIS messages. It works by subscribing to a RabbitMQ exchange where the messages are streamed into and storing them on a **Messages** table and keeping coallesced and up to date AIS object information on an **Objects** table, using the [MMSI](https://en.wikipedia.org/wiki/Maritime_Mobile_Service_Identity) as its primary key.

## Database structure

|  Table   |  PK  | PK type |                    Data                     |
| :------: | :--: | :-----: | :-----------------------------------------: |
| Messages |  id  |  long   |    [Message](../Database.Lib/Message.cs)    |
| Objects  | mmsi |  uint   | [ObjectData](../Database.Lib/ObjectData.cs) |

## Requirements

- Dotnet

## Configuration

Configuration is done via environment variables.

| Name                                             | Description                               |
| ------------------------------------------------ | ----------------------------------------- |
| MARITIMO_DB_CONNECTION_STRING                    | Database connection string                |
| MARITIMO_RABBITMQ_URI                            | URI for the RabbitMQ broker instance      |
| MARITIMO_RABBITMQ_DECODED_MESSAGES_EXCHANGE_NAME | Broker exchange name for decoded messages |

## Running

Inside the persister directory, run:

    $ dotnet run

## Tests

To run the tests execute the following command from the root of the backend applications directory:

    $ dotnet test Persister.sln

## Formating code

To format code execute the following command from the root of the backend applications directory:

    $ dotnet format -v diag Persister.sln
