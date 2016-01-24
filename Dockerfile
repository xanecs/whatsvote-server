FROM node:argon

RUN apt-get update
RUN apt-get -y install build-essential

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install

COPY . /usr/src/app

RUN rm /usr/src/app/config.json
COPY config-prod.json /usr/src/app/config.json

RUN rm /usr/src/app/database.json
COPY database-prod.json /usr/src/app/database.json

EXPOSE 3000

CMD ["npm", "start"]
