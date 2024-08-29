FROM node:21-slim

USER node

RUN mkdir -p /home/node/app

WORKDIR /home/node/app

COPY --chown=node:node . .

RUN npm install

EXPOSE 9090

CMD ["npm", "start"]