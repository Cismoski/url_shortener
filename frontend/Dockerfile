
## Builder
FROM node:22.17-alpine3.22 AS builder

# RUN apk add --no-cache libc6-compat
WORKDIR /app/apps/frontend
COPY . .

RUN npm ci
RUN npm run build

# Stage 2: Serve the built application with Nginx
FROM nginx:alpine
COPY --from=builder /app/apps/frontend/build /usr/share/nginx/html
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]