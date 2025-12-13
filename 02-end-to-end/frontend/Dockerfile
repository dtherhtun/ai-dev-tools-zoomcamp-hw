# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config (optional, using default for now or create one inline)
# Default nginx conf handles index.html for root, but client-side routing needs fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
