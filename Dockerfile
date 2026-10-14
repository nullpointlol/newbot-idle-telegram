FROM node:24-alpine

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install production dependencies (zero external npm dependencies required)
RUN npm ci --omit=dev --ignore-scripts || true

# Copy application source
COPY . .

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

VOLUME ["/app/data"]

CMD ["node", "src/server.js"]
