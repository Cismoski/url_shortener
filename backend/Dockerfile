FROM node:22.17-alpine3.22 AS build
WORKDIR /usr/src/app

RUN apk add --no-cache openssl

COPY --chown=node:node package*.json ./
COPY --chown=node:node . .

RUN npm ci
RUN npm run build
RUN npx prisma generate

FROM node:22.17-alpine3.22 AS production
WORKDIR /usr/src/app

RUN apk add --no-cache openssl
ENV NODE_ENV=production

COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=build /usr/src/app/dist ./dist
COPY --chown=node:node --from=build /usr/src/app/generated ./generated
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/prisma ./prisma

EXPOSE 8080

USER node
CMD ["node", "dist/main.js"]
