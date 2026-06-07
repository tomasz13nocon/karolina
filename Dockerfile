# Shared image for the Node services (build-hook + preview): the full project
# plus its dependencies, so either can run `astro build`. The per-service
# `command` and `environment` in docker-compose.yml decide what each one does.
FROM node:26-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# build-hook is the default; the preview service overrides command + env.
CMD ["node", "webhook-server.js"]
