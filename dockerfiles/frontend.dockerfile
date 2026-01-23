# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# 1. Copy package files from the frontend subfolder
COPY frontend/package*.json ./
RUN npm install

# 2. Copy the rest of the frontend code
COPY frontend/ .

# 3. Define the Build Argument for the API URL
# This is what Vite looks for during 'npm run build'
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# 4. Build the static files (usually goes to /app/dist)
RUN npm run build

# Serve stage using Nginx
FROM nginx:alpine

# 5. Copy the build output to Nginx's serving directory
COPY --from=builder /app/dist /usr/share/nginx/html

# 6. Copy a custom Nginx config (we will create this in the next step)
# This is required to make React routing and Port 8080 work
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]