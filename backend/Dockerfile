FROM node:20-alpine AS builder

WORKDIR /app

RUN echo "http://mirror.yandex.ru/mirrors/alpine/v3.23/main" > /etc/apk/repositories \
    && echo "http://mirror.yandex.ru/mirrors/alpine/v3.23/community" >> /etc/apk/repositories \
    && apk add --no-cache openssl

COPY package*.json .npmrc ./
RUN npm ci --no-audit --no-fund

COPY tsconfig.json ./
COPY prisma ./prisma/
RUN npx prisma generate

COPY src ./src/
RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app

RUN echo "http://mirror.yandex.ru/mirrors/alpine/v3.23/main" > /etc/apk/repositories \
    && echo "http://mirror.yandex.ru/mirrors/alpine/v3.23/community" >> /etc/apk/repositories \
    && apk add --no-cache openssl dumb-init

COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY prisma ./prisma/

EXPOSE 4000

ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "npx prisma db push && node dist/index.js"]
