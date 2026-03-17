FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json /app/
RUN npm install

FROM node:22-alpine AS build
WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules
COPY . /app
RUN bun run build

FROM nginx:1.27-alpine
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build/client /usr/share/nginx/html
