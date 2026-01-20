# ============================================
# Stage 1: Build React App
# ============================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock* ./

# Install dependencies
RUN yarn install --frozen-lockfile || yarn install

# Copy source code
COPY . .

# Set build-time environment variable
ARG REACT_APP_BACKEND_URL=http://localhost:8001
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

# Build the app
RUN yarn build

# ============================================
# Stage 2: Serve with Nginx
# ============================================
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
