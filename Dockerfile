# Build stage
FROM node:23-slim AS build_container

ARG APP_NAME=$APP_NAME
ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV

WORKDIR /install

COPY package*.json tsconfig.json ./

RUN npm ci

COPY ./apps/${APP_NAME} .

ENV NODE_ENV=production
RUN npm run build && \
    npm prune

# Final stage
FROM node:23-slim AS final

ARG APP_NAME=$APP_NAME
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

WORKDIR /usr/src/app

USER node

COPY --from=build_container --chown=node:node /install ./

EXPOSE $PORT

CMD node dist/${APP_NAME}/main.js