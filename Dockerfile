FROM node:8.9.4-alpine

RUN mkdir /app
ADD package.json /app/
WORKDIR /app
RUN npm install
ADD . /app

CMD ["node", "app/index.js"]
