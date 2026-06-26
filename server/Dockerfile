# Step 1: Build the backend project
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Step 2: Create a lightweight runtime image
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist

# Expose port (Cloud Run sets PORT automatically)
EXPOSE 5000
CMD ["node", "dist/app.js"]
