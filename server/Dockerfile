# ── Build Stage ──
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache openssl libc6-compat

# Install root & server dependencies
COPY package*.json ./
COPY server/package*.json ./server/
COPY prisma ./prisma/

WORKDIR /app/server
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate --schema=../prisma/schema.prisma

# Copy source and build NestJS app
COPY server ./
RUN npm run build

# ── Production Runner Stage ──
FROM node:22-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

ENV NODE_ENV=production
ENV PORT=4000

# Copy package manifests & install production-only dependencies
COPY server/package*.json ./
COPY prisma ./prisma/

RUN npm ci --omit=dev && npm cache clean --force

# Copy built artifacts & Prisma schema / client
COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/server/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/server/node_modules/@prisma ./node_modules/@prisma

# Security: run as unprivileged user
USER node

EXPOSE 4000

CMD ["node", "dist/main.js"]
