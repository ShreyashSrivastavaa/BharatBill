# BharatBill Production Deployment Guide

This guide covers deploying BharatBill on a virtual machine (AWS EC2, DigitalOcean Droplet, Hetzner, or GCP Compute Engine) or container platform.

---

## 1. Prerequisites

- Docker Engine 24+ and Docker Compose v2+
- A domain name pointing to your server's IP address (e.g., `bharatbill.in`)
- PostgreSQL 16 (or use the included containerized PostgreSQL)
- Google OAuth 2.0 Client ID (from Google Cloud Console)
- Razorpay API Keys & Webhook Secret (from Razorpay Dashboard)

---

## 2. Environment Setup

1. Clone repository to deployment server:
   ```bash
   git clone https://github.com/ShreyashSrivastavaa/BharatBill.git /opt/bharatbill
   cd /opt/bharatbill
   ```

2. Copy production configuration template:
   ```bash
   cp .env.production.example .env.production
   ```

3. Generate secure 64-character hex keys:
   ```bash
   openssl rand -hex 32  # Use for JWT_ACCESS_SECRET
   openssl rand -hex 32  # Use for JWT_REFRESH_SECRET
   ```

4. Populate `.env.production` with your live values:
   - `DATABASE_URL`: Connection string to PostgreSQL
   - `JWT_ACCESS_SECRET` & `JWT_REFRESH_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`
   - `RAZORPAY_WEBHOOK_SECRET`
   - `SUPER_ADMIN_EMAILS`: Comma-separated list of super admin email addresses

---

## 3. Database Migrations

Apply migrations to your production database using Prisma:

```bash
docker compose -f docker-compose.prod.yml run --rm server npx prisma migrate deploy --schema=../prisma/schema.prisma
```

---

## 4. Starting the Application

Build and start all production services with healthchecks:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

Verify service status:
```bash
docker compose -f docker-compose.prod.yml ps
```

Health check endpoints:
- API Liveness: `curl http://localhost/api/v1/health`
- Database Readiness: `curl http://localhost/api/v1/ready`

---

## 5. SSL / TLS Setup (Certbot & Nginx)

For HTTPS termination, set up Let's Encrypt with Certbot or front your server with Cloudflare / Caddy reverse proxy.
