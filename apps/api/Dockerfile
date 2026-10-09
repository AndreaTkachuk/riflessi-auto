FROM node:24-slim

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app
RUN corepack enable

# 1. In the begginning only the manifests — Docker caches this layer,
#    and dependencies are not reinstalled on every code change
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
RUN pnpm install --frozen-lockfile --filter @riflessi/api...

# 2. Now code and build
COPY apps/api apps/api
# Prisma generate reads the config from DATABASE_URL, so we provide a dummy URL only for the build time
RUN DATABASE_URL=postgresql://build:build@localhost:5432/build pnpm --filter @riflessi/api build
RUN test -f apps/api/dist/main.js

ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "apps/api/dist/main.js"]