
## Builder
FROM node:22.17-alpine3.22 AS builder

# RUN apk add --no-cache libc6-compat
WORKDIR /app/apps/frontend
COPY . .

RUN npm ci
RUN npm run build

# Expose port 3000 for the application
EXPOSE 3000

# Start the application
CMD [ "npm", "run", "start" ]