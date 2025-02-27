FROM nginxinc/nginx-unprivileged:alpine3.20 AS base-app


FROM node:23-alpine AS base-assets
## this is a base for dev and production assets
## dev might use make and bash, prod does not need these


FROM node:23-alpine AS assets-dev

RUN apk add --no-cache make bash



#
#   ▒█▀▀█ █▀▀█ █▀▀█ █▀▀▄ █░░█ █▀▀ ▀▀█▀▀ ░▀░ █▀▀█ █▀▀▄
#   ▒█▄▄█ █▄▄▀ █░░█ █░░█ █░░█ █░░ ░░█░░ ▀█▀ █░░█ █░░█
#   ▒█░░░ ▀░▀▀ ▀▀▀▀ ▀▀▀░ ░▀▀▀ ▀▀▀ ░░▀░░ ▀▀▀ ▀▀▀▀ ▀░░▀
#
#   ░░  ░░  ░░  ░░  ░░  ░░  ░░  ░░  ░░  ░░  ░░  ░░  ░░  ░░


FROM base-assets AS assets
## Build assets independantly.
## This step creates an opportiunuty to selectively pick the assets we need for the app.

## Get into the home directory...
WORKDIR /home/node

## What do we need to succesfully build assets?
COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install
RUN npm run build



FROM base-app AS build-prod
## Our pristine production build.
## Ensure only the necessary files are copied over.
COPY --from=assets /home/node/public /usr/share/nginx/html

USER 1000

