# Deploying BharatBill to Vercel

This guide explains how to deploy BharatBill's frontend to Vercel with zero hassle.

---

## Architecture Overview

- **Frontend (Vite + React 19 SPA):** Deployed on Vercel's Edge Network with client-side SPA routing (`index.html` fallback), immutable asset caching, and security headers.
- **Backend (NestJS API + PostgreSQL):** Deployed on any Node/container platform (e.g., Render, Railway, AWS ECS, Fly.io, or VPS) where long-running TCP database connections, Prisma migrations, and NestJS run stably.

---

## Quick Deploy (Vercel Web UI)

1. **Import Repository in Vercel:**
   - Log in to [vercel.com](https://vercel.com) and click **"Add New Project"**.
   - Select your **`BharatBill`** GitHub repository.

2. **Project Settings:**
   - **Framework Preset:** Vite
   - **Root Directory:** Edit and select `client` (or leave as root `.` — both are supported via our root and client `vercel.json` configurations).
   - If setting Root Directory to `.`:
     - Build Command: `npm run build:client`
     - Output Directory: `client/dist`
   - If setting Root Directory to `client`:
     - Build Command: `npm run build`
     - Output Directory: `dist`

3. **Environment Variables:**
   Add these in Vercel Dashboard under **Project Settings -> Environment Variables**:

   | Key | Example Value | Description |
   |---|---|---|
   | `VITE_API_URL` | `https://api.yourdomain.com/api/v1` | URL of your deployed NestJS backend API |
   | `VITE_GOOGLE_CLIENT_ID` | `123456...apps.googleusercontent.com` | Google OAuth Client ID for web |
   | `VITE_RAZORPAY_KEY_ID` | `rzp_live_...` (or test key) | Razorpay Public Key ID for checkout modal |

4. **Click Deploy!**
   Vercel will bundle the Vite React app and publish it to a global CDN URL (e.g., `https://bharatbill.vercel.app`).

---

## Deploying via Vercel CLI

From the project root:

```bash
# Log in to Vercel
npx vercel login

# Link and deploy to preview
npx vercel

# Deploy to production
npx vercel --prod
```

---

## CORS Configuration on Backend

Make sure your NestJS backend allows requests from your Vercel domain. In your backend `.env`:

```env
CORS_ORIGIN=https://bharatbill.vercel.app,https://yourdomain.com
```

