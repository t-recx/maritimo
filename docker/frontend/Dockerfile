FROM node:18

LABEL maintainer="hi@joaobruno.xyz"
ENV REFRESHED_AT 2022-06-07

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

ENTRYPOINT ["/usr/src/app/entrypoint.sh"]