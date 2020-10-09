FROM node:14-alpine

WORKDIR /app
COPY yarn.lock ./
COPY package.json ./
COPY tsconfig.json ./
COPY src ./src
COPY public ./public
RUN yarn

EXPOSE 3001

CMD ["yarn", "start"]
