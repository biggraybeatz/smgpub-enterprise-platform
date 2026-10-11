# Use official Node.js runtime environment
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy dependency files first for layer caching
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy backend source code
COPY . .

# Expose API port
EXPOSE 4000

# Start server
CMD ["npm", "start"]



