FROM node:20-alpine AS base

FROM base AS installer
WORKDIR /app
COPY package.json .npmrc ./
RUN npm install

FROM base AS builder
WORKDIR /app
COPY --from=installer /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
EXPOSE 8080/tcp
COPY .npmrc ./
RUN npm install @modern-js/app-tools @modern-js/runtime --no-optional --no-shrinkwrap && mkdir src
COPY modern.config.ts package.json ./
COPY --from=builder /app/dist ./dist
ENV API_BASE=
CMD ["npm", "run", "serve"]
