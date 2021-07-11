# Build bundle
FROM node:9 as build-stage

WORKDIR /app

COPY package*.json ./

RUN npm i

COPY . .

ARG THEFEDERATION_GRAPHQL_API

ENV THEFEDERATION_GRAPHQL_API=${THEFEDERATION_GRAPHQL_API}

RUN npm run build

WORKDIR /app

# Nginx container
FROM nginx

COPY --from=build-stage /app/dist /srv/frontend

COPY docker/nginx/nginx.conf /etc/nginx/conf.d/thefederation.conf
