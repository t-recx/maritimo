FROM ruby:3.1

LABEL maintainer="hi@joaobruno.xyz"
ENV REFRESHED_AT 2022-06-07

RUN apt-get update && apt-get install -y netcat wait-for-it && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY . .

RUN bundle install

