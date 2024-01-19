FROM node:20-alpine

WORKDIR /express-docker

# Copying all the files in our project
COPY . .

# Installing dependencies
RUN npm ci

RUN npm run build

# Starting our application
CMD node dist/index.js

# docker build -t polycount-back:1.0 .
# docker run -dp 127.0.0.1:8080:8080 polycount-back:1.0