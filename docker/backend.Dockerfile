FROM node:20-alpine AS build

WORKDIR /app

RUN apk add --no-cache openssl

COPY backend/package.json backend/package-lock.json ./
RUN npm ci

COPY backend/tsconfig.json ./tsconfig.json
COPY backend/jest.config.js ./jest.config.js
COPY backend/register-aliases.js ./register-aliases.js
COPY backend/prisma ./prisma
COPY backend/src ./src

RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache openssl

COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
RUN npm prune --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/register-aliases.js ./register-aliases.js

RUN mkdir -p uploads/logos

EXPOSE 3001

CMD ["node", "-r", "./register-aliases.js", "dist/index.js"]
