ARG BUILD_FROM
FROM ${BUILD_FROM} AS base

RUN apk add --no-cache nodejs npm


FROM base as build

WORKDIR /app
COPY ./src/package*.json ./
RUN npm ci

WORKDIR /app
COPY ./src .
RUN npm run build


FROM base AS runtime

# RUN apk --no-cache -U upgrade
RUN mkdir -p /app/.ts-node
WORKDIR /app

COPY ./src/package*json ./
#USER node

RUN npm ci --omit-dev
COPY --chown=node:node --from=build /app/MRA_V1.1.1 ./MRA_V1.1.1
COPY --chown=node:node --from=build /app/MRA_custom ./MRA_custom
COPY --chown=node:node --from=build /app/views ./views
COPY --chown=node:node --from=build /app/public ./public
COPY --chown=node:node --from=build /app/.ts-node ./.ts-node
COPY --chown=node:node --from=build /app/LICENSE /app/buildinfo* ./

EXPOSE 3000

COPY docker-entrypoint.sh /
RUN chmod a+x /docker-entrypoint.sh
CMD /docker-entrypoint.sh
