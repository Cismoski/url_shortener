<<<<<<< HEAD
FROM node:22.16-alpine3.21 AS build
=======
FROM node:22.17-alpine3.22 AS build
>>>>>>> 1d164eb (init)
WORKDIR /usr/src/app

RUN apk add --no-cache openssl

COPY --chown=node:node package*.json ./
COPY --chown=node:node . .

RUN npm ci
RUN npm run build
RUN npx prisma generate

<<<<<<< HEAD
FROM node:22.16-alpine3.21 AS production
=======
FROM node:22.17-alpine3.22 AS production
>>>>>>> 1d164eb (init)
WORKDIR /usr/src/app

RUN apk add --no-cache openssl
ENV NODE_ENV=production

COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=build /usr/src/app/dist ./dist
COPY --chown=node:node --from=build /usr/src/app/generated ./generated
<<<<<<< HEAD
COPY --chown=node:node --from=build /usr/src/app/prisma ./prisma

RUN npm ci --omit=dev

# Expose port
EXPOSE 3000

USER node
# Start the application
CMD ["node", "dist/server.js"]

=======
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/prisma ./prisma

EXPOSE 8080

USER node
CMD ["node", "dist/main.js"]
>>>>>>> 1d164eb (init)
