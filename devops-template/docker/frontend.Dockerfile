# Multi-stage Dockerfile for Node.js Frontend
# Supports: React, Vue, Angular, Next.js, Nuxt.js, SvelteKit

# ===========================================
# Stage 1: Dependencies
# ===========================================
FROM node:20-alpine AS deps

# Add libc6-compat for Alpine compatibility
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./

# Install dependencies based on the lock file present
RUN \
  if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm install --frozen-lockfile; \
  else echo "No lock file found" && npm install; \
  fi

# ===========================================
# Stage 2: Builder
# ===========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time environment variables
ARG NODE_ENV=production
ARG BUILD_DATE
ARG VCS_REF
ARG VERSION

# Build arguments for API URLs (customize as needed)
ARG NEXT_PUBLIC_API_URL
ARG VITE_API_URL
ARG REACT_APP_API_URL
ARG VUE_APP_API_URL
ARG PUBLIC_API_URL

ENV NODE_ENV=${NODE_ENV}

# Build the application based on framework
# Next.js
# RUN npm run build

# Create React App / Vite / Vue CLI
RUN npm run build

# Angular
# RUN npm run build -- --configuration=production

# Nuxt.js
# RUN npm run generate

# SvelteKit
# RUN npm run build && npm prune --production

# ===========================================
# Stage 3: Production Runner
# ===========================================
FROM node:20-alpine AS runner

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

WORKDIR /app

# Set production environment
ENV NODE_ENV=production \
    PORT=3000

# ===========================================
# For Static Sites (React, Vue, Angular)
# ===========================================
# Install serve for static hosting
RUN npm install -g serve

# Copy built static files
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
# For Create React App use: /app/build ./build
# For Angular use: /app/dist/your-app-name ./dist

# ===========================================
# For Next.js SSR/SSG
# ===========================================
# COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# ===========================================
# For Nuxt.js SSR
# ===========================================
# COPY --from=builder --chown=nextjs:nodejs /app/.nuxt ./.nuxt
# COPY --from=builder --chown=nextjs:nodejs /app/static ./static
# COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
# COPY --from=builder --chown=nextjs:nodejs /app/nuxt.config.js ./nuxt.config.js

# Labels for image metadata
LABEL org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.revision="${VCS_REF}" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.title="Frontend Application" \
      org.opencontainers.image.description="Node.js Frontend Application"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT} || exit 1

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE ${PORT}

# ===========================================
# Start Commands for Different Frameworks
# ===========================================

# Static sites with serve (React, Vue, Angular)
ENTRYPOINT ["dumb-init", "--"]
CMD ["serve", "-s", "dist", "-l", "3000"]
# For Create React App: CMD ["serve", "-s", "build", "-l", "3000"]

# Next.js
# CMD ["node", "server.js"]

# Nuxt.js
# CMD ["npm", "run", "start"]

# SvelteKit
# CMD ["node", "build/index.js"]

# Custom nginx configuration (alternative for static sites)
# Use nginx:alpine as base image in runner stage instead
# COPY --from=builder /app/dist /usr/share/nginx/html
# COPY nginx.conf /etc/nginx/conf.d/default.conf
# CMD ["nginx", "-g", "daemon off;"]