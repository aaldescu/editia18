# Stage 1: inline the app into a single index.html
FROM node:22-alpine AS build
WORKDIR /app
COPY scripts ./scripts
COPY src ./src
RUN node scripts/build.mjs

# Stage 2: serve it with nginx
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/index.html /usr/share/nginx/html/index.html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/healthz || exit 1
