# Étape 1: Construire l'application
FROM node:latest as build-step

WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

# Étape 2: Servir l'application
FROM nginx:alpine
COPY --from=build-step /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# docker build -t polycount-front:1.0 .
# docker run --name polycount-front -dp 80:3000 polycount-front:1.0