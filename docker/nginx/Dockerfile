FROM nginx:stable-alpine

LABEL maintainer="hi@joaobruno.xyz"
ENV REFRESHED_AT 2022-06-07

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d
COPY robots.txt /etc/nginx/robots.txt
COPY compression.conf /etc/nginx/compression.conf
