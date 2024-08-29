FROM node:21-slim

USER node

RUN mkdir -p /home/node/app

WORKDIR /home/node/app

COPY --chown=node:node . .

RUN npm install

CMD ["npm", "start"]