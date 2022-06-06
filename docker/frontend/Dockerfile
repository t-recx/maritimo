FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

ENTRYPOINT ["/usr/src/app/entrypoint.sh"]