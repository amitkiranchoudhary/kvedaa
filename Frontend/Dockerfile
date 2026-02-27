FROM node:18-alpine

WORKDIR /app

# Install dependencies first for better layer caching
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Expose Vite's default dev server port
EXPOSE 5173

# Start development server and bind to 0.0.0.0 to be accessible outside the container
CMD ["npm", "run", "dev", "--", "--host"]
