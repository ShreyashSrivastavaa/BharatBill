# BharatBill

**Simple billing. Smarter business.**

Affordable GST billing and business management SaaS for Indian wholesalers, retailers, distributors and traders.

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Vite
- **Backend:** Node.js, Express, TypeScript, Zod
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** argon2/bcrypt + JWT (httpOnly cookies)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ (or Docker)

### 1. Clone & Install

```bash
git clone <repo-url>
cd BharatBill

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Database Setup

**Option A: Docker (recommended)**
```bash
docker-compose up -d
```

**Option B: Local PostgreSQL**
Create a database named `bharatbill` and update `.env`.

### 3. Environment Variables

```bash
cp .env.example server/.env
# Edit server/.env with your values
```

### 4. Run Migrations & Seed

```bash
cd server
npx prisma migrate dev
npx prisma db seed
```

### 5. Start Development

```bash
# Terminal 1: Server
cd server && npm run dev

# Terminal 2: Client
cd client && npm run dev
```

- **Client:** http://localhost:5173
- **Server:** http://localhost:4000
- **API Base:** http://localhost:4000/api/v1

## Project Structure

```
BharatBill/
├── client/          # React frontend (Vite)
├── server/          # Express backend
│   ├── prisma/      # Schema & migrations
│   └── src/
│       ├── config/
│       ├── middleware/
│       ├── modules/  # Feature modules
│       ├── services/ # Shared services (GST, PDF)
│       └── utils/
├── docker-compose.yml
└── .env.example
```

## License

Proprietary — All rights reserved.

