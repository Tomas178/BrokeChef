FROM node:22.17.0-alpine3.22 AS builder

WORKDIR /app

COPY ../package*.json .
COPY client/package*.json client/
COPY server/package*.json server/
RUN npm ci

COPY . .

WORKDIR /app/client

ARG VITE_BASE_ORIGIN
ENV VITE_BASE_ORIGIN=$VITE_BASE_ORIGIN

RUN npm run build

FROM nginx:1.29.0-alpine3.22 as nginx

# Delete the default welcome page
RUN rm /usr/share/nginx/html/* -rf

COPY --from=builder /app/client/dist /usr/share/nginx/html

ENV NGINX_ENVSUBST_OUTPUT_DIR '/etc/nginx/conf.d'

COPY client/nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY client/nginx/proxy_params.conf /etc/nginx/proxy_params.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]