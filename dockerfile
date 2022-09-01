FROM node:14-buster-slim AS build

WORKDIR /app
COPY package*.json ./
RUN npm install

WORKDIR /app/front
COPY front/package*.json ./
RUN npm install

WORKDIR /app
COPY . .
RUN npm run build


FROM node:14-buster-slim AS runtime

# RUN apk --no-cache -U upgrade
RUN mkdir -p /app/.ts-node && chown -R node:node /app
WORKDIR /app

COPY package*.json ./
USER node

RUN npm install --only=production
COPY --chown=node:node --from=build /app/.ts-node ./.ts-node

EXPOSE 3000

ENTRYPOINT ["node", "/app/.ts-node/index.js"]

