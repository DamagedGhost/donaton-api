FROM node:18-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

FROM node:18-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY app.js ./
COPY bin ./bin
COPY middlewares ./middlewares
COPY routes ./routes
COPY public ./public
COPY views ./views
COPY .env ./
COPY swagger.yaml ./

EXPOSE 3000

CMD ["node", "./bin/www"]