FROM node:21-slim

USER node

RUN mkdir -p /home/node/app

WORKDIR /home/node/app

RUN apt-get update -y && apt-get install -y openssl

COPY --chown=node:node . .

RUN npm install

RUN npm run build

CMD ["npm", "run", "start:prod"]