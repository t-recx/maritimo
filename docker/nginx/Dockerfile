FROM nginx:stable-alpine

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d
COPY robots.txt /etc/nginx/robots.txt
COPY compression.conf /etc/nginx/compression.conf
