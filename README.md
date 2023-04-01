# [Maritimo](https://maritimo.digital/) &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/t-recx/maritimo/blob/main/LICENSE)

Maritimo is a set of applications used to decode, persist and display AIS data. It aims to be fast, scalable and easy to extend.

AIS (Automatic Identification System) is an automatic tracking system. AIS transmitters are equipped in vessels, navigation markers, and shore stations. These transmitters emit data related to the vessel or object they're fitted on including position, heading, speed, course and more. This information is then used by other vessels to avoid collision or by ports and maritime authorities in their traffic monitoring systems.

## Applications

| Name                                    | Description                                               |
| --------------------------------------- | --------------------------------------------------------- |
| [Station](station/)                     | Fetches or receives data from AIS stations via TCP or UDP |
| [Decoder](decoder/)                     | Decodes NMEA VDM/VDO messages                             |
| [Persister](backend/Persister.App/)     | Records decoded data in a database                        |
| [Transmitter](backend/Transmitter.App/) | Transmits decoded data over a Signal-R hub                |
| [WebApi](backend/WebApi.App/)           | Queries the database via REST                             |
| [Frontend](frontend/)                   | Displays the information using a web frontend             |

## Requirements

- A Linux or [Windows with WSL](https://docs.microsoft.com/en-us/windows/wsl/install) system
- [Docker compose](https://docs.docker.com/compose/)

## Configuration

Configuration is done via environment variables.
To configure the entire system create a .env file in the main project directory and set the following variables:

| Name                                             | Description                                                                          |
| ------------------------------------------------ | ------------------------------------------------------------------------------------ |
| POSTGRES_USER                                    | PostgreSQL database user name                                                        |
| POSTGRES_DB                                      | PostgreSQL database name                                                             |
| POSTGRES_PASSWORD                                | PostgreSQL database password                                                         |
| MARITIMO_STATION_CONNECTION_PROTOCOL             | Protocol to use (TCP/UDP/FILE)                                                       |
| MARITIMO_STATION_CONNECTION_LISTEN_PORT          | Listen port (UDP)                                                                    |
| MARITIMO_STATION_HOSTNAME                        | Station host name (TCP)                                                              |
| MARITIMO_STATION_PORT                            | Station connection port (TCP)                                                        |
| MARITIMO_STATION_READ_TIMEOUT_SECONDS            | Station read timeout (TCP)                                                           |
| MARITIMO_STATION_FILENAME                        | Filename with VDM/VDO sentences (FILE)                                               |
| MARITIMO_STATION_INCLUDE_SENDER_IP_ADDRESS       | Includes the source's ip address on the encoded message                              |
| MARITIMO_DB_CONNECTION_STRING                    | Database connection string                                                           |
| MARITIMO_RABBITMQ_URI                            | URI for the RabbitMQ broker instance                                                 |
| MARITIMO_RABBITMQ_ENCODED_MESSAGES_QUEUE_NAME    | Broker queue name for encoded messages                                               |
| MARITIMO_RABBITMQ_DECODED_MESSAGES_EXCHANGE_NAME | Broker exchange name for decoded messages                                            |
| MARITIMO_CORS_ORIGIN_WHITELIST                   | CORS origin whitelist                                                                |
| MARITIMO_TRANSMITTER_BUFFER_SECONDS              | Seconds to buffer messages before sending them to ReceiveBuffered method             |
| MARITIMO_DB_CACHE_MINUTES_EXPIRATION             | Minutes until expiration of a cache entry for a station/object                       |
| MARITIMO_LOG_LEVEL_MINIMUM                       | Minimum logging level (TRACE / DEBUG / INFORMATION / WARNING / ERROR / NONE)         |
| MARITIMO_PERSISTER_SAVE_MESSAGES                 | Specifies whether to save AIS messages (might require a lot of disk space over time) |

Check an example configuration file in [.env.development](.env.development).

### Frontend configuration

An additional configuration .env file is also expected on the [frontend/](frontend/) directory, with the following variables set:

| Name                                   | Description                                                  |
| -------------------------------------- | ------------------------------------------------------------ |
| REACT_APP_WEB_API_URL                  | URL for the REST API endpoint for the latest AIS information |
| REACT_APP_TRANSMITTER_HUB_URL          | URL for the transmitter hub endpoint                         |
| REACT_APP_PHOTOS_URL                   | URL for the photos endpoint                                  |
| REACT_APP_MAP_OBJECT_LIFESPAN_HOURS    | Object lifespan in hours                                     |
| REACT_APP_MAP_INITIAL_CENTER_LATITUDE  | Map's initial latitude                                       |
| REACT_APP_MAP_INITIAL_CENTER_LONGITUDE | Map's initial longitude                                      |
| REACT_APP_MAP_INITIAL_ZOOM             | Map's initial zoom level                                     |
| REACT_APP_MAP_MAX_ZOOM                 | Map's maximum zoom level                                     |

Check an example configuration file in [frontend/.env.development](frontend/.env.development).

## Running

Inside the project directory run:

    $ docker compose up

Open [http://localhost](http://localhost) to access the application.

## Data Contributions

| Source                                                               | Location                   |
| -------------------------------------------------------------------- | -------------------------- |
| [NCA](https://www.kystverket.no/en/)                                 | Norway                     |
| [Sydney Sisco](https://www.sydsis.co/)                               | Vancouver, BC              |
| [Joeri van Dooren](https://rf.guru/sdr)                              | Lombardsijde, Belgium      |
| [Rab](https://www.qrz.com/db/MM7BVP/)                                | Greenock, Scotland         |
| [LARS](https://www.lars.pt/)                                         | Sintra, Portugal           |
| [Jose Elias Diaz](https://www.qrz.com/db/EB1AO)                      | Vigo, Spain                |
| [Carmelo Milla](https://www.olaje.com/)                              | Malaga, Spain              |
| [Pablo Costagliola](http://www.cx1rv.com)                            | Argentina and Uruguay      |
| [Gerrit van der Laag](https://amelandermusea.nl/)                    | Netherlands                |
| [John Wiseman](https://www.cantab.net/users/john.wiseman/Documents/) | Lewis and Harris, Scotland |
| [Rene](https://www.discriminator.nl/ais/index-en.html)               | Rotterdam, Netherlands     |
| [John Hearne](http://homepage.eircom.net/~johnhearne/index.html)     | Cork, Ireland              |
| [Manfred Schenk](http://www.vallicone.fr)                            | Vallicone, Corsica, France |
| [Peter Roosens](http://www.vvwmendonk.com)                           | Mendonk, Belgium           |
| [Telcomserv](http://www.telcomserv.eu)                               | Aalst, Belgium             |
| [Kinsale Angling](http://www.kinsaleangling.com)                     | Kinsale, Ireland           |
| [Subsea Survey Services Ltd.](http://www.subseasurvey.ie/)           | Cork, Ireland              |
| [ARAF/Mateus PP5FMM](https://www.araf.org.br/)                       | Florianópolis, Brazil      |
| [Alberto Pérez](http://www.buques.org/)                              | Cantábria, Spain           |
| [ALERT PLUS](http://alertplus.info/)                                 | Szczecin, Poland           |
| [ADVANCED TECHNOLOGY ENGINEERING](https://ate.com.pl/)               | Szczecin, Poland           |
| [Erik Jõgi](https://codeborne.com/)                                  | Miiduranna, Estonia        |
| [Peter Fässberg](https://fassberg.se)                                | Trollhättan, Sweden        |
| [SigmaPlusVO](https://sigma-plus.kz)                                 | Ақтау, Kazakhstan          |
| [Michael Stutzbach (DO6LSM)](https://wetterstationschlei.de)         | Borgwedel, Germany         |
| [Stephen Carns](http://www.nauticarazi.com/)                         | Los Angeles, USA           |
| [Regis Electronics St Lucia](http://www.regiselectronics.com/)       | Gros Islet, St. Lucia      |
| [Digimap Guernsey](https://www.digimap.gg/)                          | Guernsey                   |
| [Dirk Metz (SWLJO43)](https://metz-familie.de/)                      | Wentorf, Germany           |
| [Frans Veldman](https://www.zwerfcat.nl/)                            | Netherlands                |
| [Pedro Almeida (CT7ARQ)](https://www.qrz.com/db/CT7ARQ)              | Esposende, Portugal        |

Got a station and would like to help out? Shoot me an email at [hi@joaobruno.xyz](hi@joaobruno.xyz).

## Special thanks

This project wouldn't be possible without the open access that the [Norwegian Coastal Administration](https://www.kystverket.no/en/) offers to its AIS data and Eric S. Raymond's documentation on [AIVDM/AIVDO protocol decoding](https://gpsd.gitlab.io/gpsd/AIVDM.html).
