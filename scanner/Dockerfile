FROM node:9-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json yarn.lock ./

RUN apk add --no-cache make linux-headers eudev-dev gcc g++ python && \
  yarn install --production && \
  apk del make linux-headers gcc g++ python

# Bundle app source
COPY . .

CMD [ "npm", "start" ]
