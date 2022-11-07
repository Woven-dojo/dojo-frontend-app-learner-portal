FROM --platform=linux/amd64 node:12.22.12-bullseye-slim AS node_builder
WORKDIR /usr/src/app
COPY . ./
ARG NPM_AUTH_TOKEN
RUN npm ci
RUN npm run build

FROM nginx
COPY --from=node_builder /usr/src/app/dist /usr/share/nginx/html/lms
COPY ./app.conf /etc/nginx/templates/app.conf.template
