# ---- Base ----
FROM node:20-alpine AS base
WORKDIR /app
RUN addgroup -S blog && adduser -S blog -G blog

# ---- Development ----
FROM base AS dev
COPY package*.json ./
RUN npm install
COPY . .
USER blog
EXPOSE 3000
CMD ["node", "app.js"]

# ---- Production ----
FROM base AS prod
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY . .
RUN chown -R blog:blog /app
USER blog
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -q --spider http://localhost:3000/api/health || exit 1
CMD ["node", "app.js"]
