# ---------- Development Environment ----------
FROM node:20-slim
WORKDIR /app

# Install OS dependencies
RUN apt-get update && apt-get install -y \
    build-essential libc6-dev curl python3 ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy package files and install dependencies (including dev)
COPY package.json package-lock.json* ./
RUN npm install

# Copy the source code
COPY . .

# ---------- Build-time Arguments ----------
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

# Expose the default Next.js dev port
EXPOSE 3000

# ---------- Run Next.js in Dev Mode ----------
CMD ["npm", "run", "dev"]
