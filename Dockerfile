# ---- Teachable Dockerfile best practices ----
# 1. Pin a specific, slim base image (smaller attack surface, fewer CVEs for Trivy to find)
FROM node:20-alpine

# 2. Run as a non-root user (node:alpine ships with a 'node' user)
WORKDIR /app

# 3. Copy only what's needed (see .dockerignore)
COPY package.json server.js ./

# 4. Drop privileges
USER node

# 5. Document the port
EXPOSE 3000

# 6. Container-native healthcheck
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "server.js"]
