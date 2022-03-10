FROM node:17.6.0-buster

WORKDIR /docker

COPY ./docker/entrypoint.sh .

RUN chmod +x ./entrypoint.sh

WORKDIR /igvf-ui

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

ENTRYPOINT ["/docker/entrypoint.sh"]