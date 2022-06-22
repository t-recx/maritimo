# [Maritimo](https://maritimo.digital/) &middot; Station

Station is a ruby application used to fetch data from one or more AIS stations over a tcp connection and send them over a RabbitMQ queue for processing.

## Requirements

- Ruby
- [Bundler](https://bundler.io/)

## Configuration

Configuration is done via environment variables.

| Name                                          | Description                            | Applicable to |
| --------------------------------------------- | -------------------------------------- | :-----------: |
| MARITIMO_STATION_CONNECTION_PROTOCOL          | Protocol to use (TCP/UDP)              |               |
| MARITIMO_STATION_CONNECTION_LISTEN_PORT       | Listen port                            |      UDP      |
| MARITIMO_STATION_HOSTNAME                     | Station host name                      |      TCP      |
| MARITIMO_STATION_PORT                         | Station connection port                |      TCP      |
| MARITIMO_STATION_READ_TIMEOUT_SECONDS         | Station read timeout                   |      TCP      |
| MARITIMO_RABBITMQ_URI                         | URI for the RabbitMQ broker instance   |               |
| MARITIMO_RABBITMQ_ENCODED_MESSAGES_QUEUE_NAME | Broker queue name for encoded messages |               |

## Running

Inside the station directory, install any missing gem dependencies using:

    $ bundle install

And then run the application using:

    $ bundle exec exe/station

## Tests

To run the tests execute the following command from the root of the station application directory:

    $ bundle exec rake test

## Linting/Formating code

To automatically lint and format code execute the following command from the root of the station application directory:

    $ bundle exec standardrb --fix
