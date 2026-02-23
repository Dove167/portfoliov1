# syntax = docker/dockerfile:1

# Stage 1: Build Astro frontend
FROM node:25.6.0-slim AS astro-build

WORKDIR /app
COPY package-lock.json package.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Build Rust backend
FROM rust:1.84 AS rust-build

WORKDIR /app/backend
COPY backend/Cargo.toml .
COPY backend/src ./src/
COPY --from=astro-build /app/summary_of_me.md ./
COPY --from=astro-build /app/dist ./dist/
RUN cargo build --release

# Stage 3: Final runtime image
FROM debian:bookworm-slim AS runtime

RUN apt-get update -qq && apt-get install -y --no-install-recommends \
    libssl3 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=rust-build /app/backend/target/release/josh-portfolio-backend /app/portfolio-backend
COPY --from=rust-build /app/backend/summary_of_me.md ./
COPY --from=astro-build /app/dist /app/dist

ENV PUBLIC_HOST="0.0.0.0:8080"
EXPOSE 8080

CMD ["./portfolio-backend"]
