# [Maritimo](https://maritimo.digital/) &middot; Persister

Persister is a dotnet application that is used to store decoded AIS messages. It works by subscribing to a RabbitMQ exchange where the messages are streamed into and storing them on a relational database as they arrive.

## Database structure

|  Table   |                                   PK                                   | PK type |                    Data                     | Notes                                                                            |
| :------: | :--------------------------------------------------------------------: | :-----: | :-----------------------------------------: | -------------------------------------------------------------------------------- |
| Messages |                                   id                                   |  long   |    [Message](../Database.Lib/Message.cs)    | Unaltered message content                                                        |
| Objects  | [mmsi](https://en.wikipedia.org/wiki/Maritime_Mobile_Service_Identity) |  uint   | [ObjectData](../Database.Lib/ObjectData.cs) | Message data is coalesced into this table to get an up-to-date view of an object |

## Requirements

- Dotnet

## Configuration

Configuration is done via environment variables.

| Name                                             | Description                                                                          |
| ------------------------------------------------ | ------------------------------------------------------------------------------------ |
| MARITIMO_DB_CONNECTION_STRING                    | Database connection string                                                           |
| MARITIMO_RABBITMQ_URI                            | URI for the RabbitMQ broker instance                                                 |
| MARITIMO_RABBITMQ_DECODED_MESSAGES_EXCHANGE_NAME | Broker exchange name for decoded messages                                            |
| MARITIMO_DB_CACHE_MINUTES_EXPIRATION             | Minutes until expiration of a cache entry for a station                              |
| MARITIMO_LOG_LEVEL_MINIMUM                       | Minimum logging level (TRACE/DEBUG/INFORMATION/WARNING/ERROR/NONE)                   |
| MARITIMO_PERSISTER_SAVE_MESSAGES                 | Specifies whether to save AIS messages (might require a lot of disk space over time) |

## Running

Inside the persister directory, run:

    $ dotnet run

## Tests

To run the tests execute the following command from the root of the backend applications directory:

    $ dotnet test Persister.sln

## Formating code

To format code execute the following command from the root of the backend applications directory:

    $ dotnet format -v diag Persister.sln

## Migrations

To start, set the connection string environment variable. For example:

    $ export MARITIMO_DB_CONNECTION_STRING="Host=172.18.0.2;Username=user;Password=mysecretpassword;Database=maritimo"

### Add migration

    $ dotnet ef migrations add <MigrationName>

### Remove a migration not yet applied

    $ dotnet ef migrations remove

### Remove a migration after being applied

Start by selecting a previous migration to rollback to:

    $ dotnet ef database update <PreviousMigrationName>

Remove the migration after:

    $ dotnet ef migrations remove
