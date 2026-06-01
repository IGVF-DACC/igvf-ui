FROM node:24.11.0-bookworm-slim

ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /docker

COPY ./docker/nextjs/entrypoint.sh .

RUN chmod +x ./entrypoint.sh

WORKDIR /igvf-ui

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3000

ENTRYPOINT ["/docker/entrypoint.sh"]

CMD ["npm", "run", "start"]
