FROM node:22.16-alpine3.21 AS build
WORKDIR /usr/src/app

RUN apk add --no-cache openssl

COPY --chown=node:node package*.json ./
COPY --chown=node:node . .

RUN npm ci
RUN npm run build
RUN npx prisma generate

FROM node:22.16-alpine3.21 AS production
WORKDIR /usr/src/app

RUN apk add --no-cache openssl
ENV NODE_ENV=production

COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=build /usr/src/app/dist ./dist
COPY --chown=node:node --from=build /usr/src/app/generated ./generated
COPY --chown=node:node --from=build /usr/src/app/prisma ./prisma

RUN npm ci --omit=dev

# Expose port
EXPOSE 3000

USER node
# Start the application
CMD ["node", "dist/server.js"]

