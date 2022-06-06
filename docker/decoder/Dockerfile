FROM rust:1.61 as builder

LABEL maintainer="hi@joaobruno.xyz"
ENV REFRESHED_AT 2022-06-07

WORKDIR /usr/src/decoder
COPY . .
RUN cargo install --path .

FROM debian:buster-slim
RUN apt-get update && apt-get install -y libssl-dev netcat wait-for-it && rm -rf /var/lib/apt/lists/*
COPY --from=builder /usr/local/cargo/bin/decoder /usr/local/bin/decoder