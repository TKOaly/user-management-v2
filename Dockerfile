FROM node:14-alpine

WORKDIR /app
COPY yarn.lock ./
COPY package.json ./
COPY tsconfig.json ./
COPY webpack.config.js ./
COPY src ./src
COPY public ./public
RUN yarn -D

RUN echo "Build Web" && yarn build-web && echo "Build Server" && yarn build-server

EXPOSE 3001

CMD ["node", "./dist/js/server.js"]
