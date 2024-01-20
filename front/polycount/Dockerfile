FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

ENV NODE_ENV="production"

RUN npm run build

FROM nginxinc/nginx-unprivileged:alpine3.18

RUN rm -rf /etc/nginx/html/*

COPY --from=build --chown=nginx:nginx /usr/src/app/build /etc/nginx/html
COPY --chown=nginx:nginx nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]

# docker build -t baraly/polycount-front:0.1.2 .
# docker run -p 81:8080 -it baraly/polycount-front:0.1.2