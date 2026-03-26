# ---- Development ----
FROM node:20-alpine AS dev
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN addgroup -S blog && adduser -S blog -G blog && chown -R blog:blog /app
USER blog
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

# ---- Build (production assets) ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL:-https://myshkin451.com/api}
RUN npm run build

# ---- Production (nginx) ----
FROM nginx:alpine AS prod
RUN adduser -S blog -G nginx
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80 443
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget -q --spider http://localhost:80/ || exit 1
