FROM oven/bun:1 AS deps
WORKDIR /app

COPY package.json bun.lock /app/
RUN bun install --frozen-lockfile

FROM oven/bun:1 AS build
WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules
COPY . /app
RUN bun run build

FROM nginx:alpine
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build/client /usr/share/nginx/html
