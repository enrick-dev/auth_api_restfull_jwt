FROM node:21-slim

RUN apt-get update -y && apt-get install -y openssl

USER node

RUN mkdir -p /home/node/app

WORKDIR /home/node/app

COPY --chown=node:node . .

RUN npm install

RUN npx prisma generate

RUN npm run build

CMD ["npm", "run", "start:prod"]