# =========================
# ETAPA 1: BUILD
# =========================
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build


# =========================
# ETAPA 2: TESTS
# =========================
FROM build AS test

ENTRYPOINT ["npm", "run", "test:ci"]


# =========================
# ETAPA 3: NGINX
# =========================
FROM nginx:alpine

COPY default.conf.template /etc/nginx/templates/default.conf.template

COPY --from=build /app/dist /usr/share/nginx/html

ENV BACKEND_URL=http://backend:8080 \
    DNS_RESOLVER=127.0.0.11

EXPOSE 80
