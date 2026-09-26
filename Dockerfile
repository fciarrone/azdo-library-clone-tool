FROM node:26-alpine AS builder
WORKDIR /app

COPY backend/package*.json ./backend/
RUN cd backend && npm install

COPY backend/tsconfig.json ./backend/
COPY backend/src ./backend/src
RUN cd backend && npm run build

COPY frontend/package*.json ./frontend/
COPY frontend/vite.config.ts ./frontend/
COPY frontend/postcss.config.js ./frontend/
COPY frontend/tailwind.config.js ./frontend/
COPY frontend/index.html ./frontend/
COPY frontend/public ./frontend/public
COPY frontend/src ./frontend/src
RUN cd frontend && npm install && npm run build

RUN mkdir -p backend/public && cp -r frontend/dist/* backend/public/

FROM node:26-alpine
WORKDIR /app
COPY --from=builder /app/backend ./backend
EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app/backend
CMD ["npm", "run", "start:prod"]
