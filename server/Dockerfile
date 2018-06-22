FROM resin/raspberrypi3-alpine-node:slim

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json package-lock.json ./

# Install dependencies but not devDependencies
RUN npm install --production

# Bundle app source
COPY . .

EXPOSE 9000
CMD [ "npm", "start" ]
