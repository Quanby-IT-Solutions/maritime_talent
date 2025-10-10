# ---------- deps: install node_modules ----------
FROM node:20-slim AS deps
WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential libc6-dev curl python3 ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN npm install

# ---------- builder: build Next.js ----------
FROM node:20-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ---------- Build-time ARGs ----------
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG SUPABASE_SERVICE_ROLE_KEY
ARG SENDGRID_API_KEY
ARG SENDGRID_FROM_EMAIL
ARG SENDGRID_FROM_NAME

# ---------- Environment Variables ----------
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
ENV SENDGRID_API_KEY=$SENDGRID_API_KEY
ENV SENDGRID_FROM_EMAIL=$SENDGRID_FROM_EMAIL
ENV SENDGRID_FROM_NAME=$SENDGRID_FROM_NAME

# Build the Next.js app
RUN npm run build

# ---------- runner: production ----------
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy only the necessary output
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# ---------- Runtime Environment Variables ----------
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
ENV SENDGRID_API_KEY=$SENDGRID_API_KEY
ENV SENDGRID_FROM_EMAIL=$SENDGRID_FROM_EMAIL
ENV SENDGRID_FROM_NAME=$SENDGRID_FROM_NAME
ENV PORT=8080

EXPOSE 8080

# Start Next.js in production mode
CMD node_modules/.bin/next start -p $PORT
