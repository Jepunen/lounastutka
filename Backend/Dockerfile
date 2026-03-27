# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 AS build
WORKDIR /usr/src/app

# Cache dependency install layer separately from source
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

# Compile to a self-contained binary — no Bun or node_modules needed at runtime
RUN bun build --compile --minify index.ts --outfile server

# Minimal final image: just the binary
FROM debian:bookworm-slim AS release
WORKDIR /app

COPY --from=build /usr/src/app/server ./server

EXPOSE 3001
ENTRYPOINT ["./server"]
