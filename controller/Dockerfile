FROM resin/raspberrypi3-alpine-node:slim

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN apk add --no-cache make gcc g++ python && \
  npm install --production && \
  apk del make gcc g++ python

COPY . .

CMD [ "npm", "start" ]
