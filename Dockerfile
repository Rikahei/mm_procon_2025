# Use official Node.js 22 LTS slim version as the base image
FROM node:22-slim

# Change working directory to /app/frontend
WORKDIR /app/frontend

# Copy package.json and package-lock.json first to leverage Docker cache
COPY /app/frontend/package*.json ./

# Install dependencies
RUN npm install

EXPOSE 5173

# Start the development server from /app/spending-app
CMD ["npm", "run", "dev", "--", "--host"]
