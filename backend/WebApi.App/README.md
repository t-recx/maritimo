# [Maritimo](https://maritimo.digital/) &middot; WebApi

WebApi is a dotnet application that is used to serve via-REST AIS information that is stored in the relational database serving the system.

## REST API

| Endpoint | Method | Parameters        |                  Data returned                   |  Table  |
| :------: | :----: | ----------------- | :----------------------------------------------: | :-----: |
| /api/ais |  GET   | int? fromHoursAgo | Array of [DTOWebObjectData](DTOWebObjectData.cs) | Objects |

## Requirements

- Dotnet

## Configuration

Configuration is done via environment variables.

| Name                           | Description                |
| ------------------------------ | -------------------------- |
| MARITIMO_DB_CONNECTION_STRING  | Database connection string |
| MARITIMO_CORS_ORIGIN_WHITELIST | CORS origin whitelist      |

## Running

Inside the webapi directory, run:

    $ dotnet run

## Tests

To run the tests execute the following command from the root of the backend applications directory:

    $ dotnet test WebApi.sln

## Formating code

To format code execute the following command from the root of the backend applications directory:

    $ dotnet format -v diag WebApi.sln
