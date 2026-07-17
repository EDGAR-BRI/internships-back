FROM node:24-alpine AS base

FROM base AS builder
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN node ace build --ignore-ts-errors
RUN npm prune --omit=dev

FROM base AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/build ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3333
RUN printf '#!/bin/sh\nset -e\necho "Running migrations..."\nnode ace migration:run --force\necho "Starting server..."\nexec node bin/server.js\n' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh
CMD ["sh", "/app/entrypoint.sh"]
