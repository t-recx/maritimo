FROM ruby:3.1

RUN apt-get update && apt-get install -y netcat wait-for-it && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY . .

RUN bundle install

