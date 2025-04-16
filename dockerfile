ARG BUILD_FROM="node:20-alpine"

FROM ${BUILD_FROM} AS base

RUN addgroup -g 1000 node \
    && adduser -u 1000 -G node -s /bin/sh -D node; exit 0
RUN apk add --no-cache nodejs npm


FROM base AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

WORKDIR /app
COPY . .
RUN npm run build
RUN chmod +x /app/docker-entrypoint.sh


FROM base AS runtime

# RUN apk --no-cache -U upgrade
RUN mkdir -p /app/.ts-node && chown -R node:node /app
WORKDIR /app

COPY package*.json ./
USER node

RUN npm ci --omit=dev
COPY --chown=node:node --from=build /app/MRA_V1.1.1 ./MRA_V1.1.1
COPY --chown=node:node --from=build /app/MRA_custom ./MRA_custom
COPY --chown=node:node --from=build /app/views ./views
COPY --chown=node:node --from=build /app/public ./public
COPY --chown=node:node --from=build /app/.ts-node ./.ts-node
COPY --chown=node:node --from=build /app/LICENSE /app/buildinfo* ./
COPY --chown=node:node --from=build /app/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

