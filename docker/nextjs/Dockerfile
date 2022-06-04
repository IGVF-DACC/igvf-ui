FROM node:16.14.0-alpine

WORKDIR /docker

COPY ./docker/nextjs/entrypoint.sh .

RUN chmod +x ./entrypoint.sh

WORKDIR /igvf-ui

COPY package*.json ./

RUN npm ci

COPY . .

RUN echo "NEXT_PUBLIC_TEST='rudder'" >> /igvf-ui/.env.local

RUN cat /igvf-ui/.env.local

RUN npm run build

ENTRYPOINT ["/docker/entrypoint.sh"]
