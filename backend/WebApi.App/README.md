# [Maritimo](https://maritimo.digital/) &middot; WebApi

WebApi is a dotnet application that is used to serve via-REST AIS information that is stored in the relational database serving the system.

## REST API

|   Endpoint   | Method | Parameters        |                  Data returned                   |  Table   |
| :----------: | :----: | ----------------- | :----------------------------------------------: | :------: |
|   /api/ais   |  GET   | int? fromHoursAgo | Array of [DTOWebObjectData](DTOWebObjectData.cs) | Objects  |
| /api/station |  GET   | int id            |        [DTOWebStation](DTOWebStation.cs)         | Stations |

## Requirements

- Dotnet

## Configuration

Configuration is done via environment variables.

| Name                                         | Description                                           |
| -------------------------------------------- | ----------------------------------------------------- |
| MARITIMO_DB_CONNECTION_STRING                | Database connection string                            |
| MARITIMO_CORS_ORIGIN_WHITELIST               | CORS origin whitelist                                 |
| MARITIMO_DB_CACHE_STATION_MINUTES_EXPIRATION | Minutes that a cache entry for one station data lives |

## Running

Inside the webapi directory, run:

    $ dotnet run

## Tests

To run the tests execute the following command from the root of the backend applications directory:

    $ dotnet test WebApi.sln

## Formating code

To format code execute the following command from the root of the backend applications directory:

    $ dotnet format -v diag WebApi.sln
