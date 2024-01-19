FROM node:20-alpine AS base

WORKDIR /express-docker

# Copying all the files in our project
COPY package*.json ./

# Installing dependencies
RUN npm ci

COPY . .

RUN npx prisma generate

RUN npm run build

RUN npm prune --omit=dev

FROM node:20-alpine

WORKDIR /express-docker

COPY --from=base /express-docker/node_modules ./node_modules
COPY --from=base /express-docker/dist ./dist
COPY --from=base /express-docker/prisma ./prisma
COPY --from=base /express-docker/package.json ./package.json

# Starting our application
CMD ["node", "dist/index.js"]

# docker build -t baraly/polycount-back:0.1.0 .
# docker run -dp 8080:8080 polycount-back:0.1.0
