FROM oven/bun:1.3.5 AS builder

WORKDIR /app

# 👇 backend folder copy karo
COPY backend/package.json backend/bun.lockb* ./
RUN bun install

COPY backend .
RUN bun run build

FROM oven/bun:1.3.5
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

ENV PORT=3000
EXPOSE 3000

CMD ["bun", "dist/server.js"]
