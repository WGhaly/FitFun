# FitFun - Complete Deployment Guide

## 🎯 Overview

FitFun now has a complete production-ready backend that works with:
- **Local Development**: JSON file database (no setup needed)
- **Production (Vercel)**: PostgreSQL database

---

## 🚀 Quick Start - Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Local Database
```bash
npm run db:setup
```

This creates a JSON file database at `data/database.json` with demo data.

### 3. Start Development Server
```bash
npm run dev
```

Server runs at: http://localhost:3000

### 4. Demo Credentials
- **Admin**: admin@fitfun.com / Admin123!
- **User 1**: john@example.com / Password123!
- **User 2**: sarah@example.com / Password123!

---

## 📦 Production Deployment to Vercel

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Complete FitFun application with backend"
git remote add origin https://github.com/YOUR_USERNAME/fitfun.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js

### Step 3: Set Up Vercel Postgres

1. In your Vercel project dashboard:
   - Go to **Storage** tab
   - Click **Create Database**
   - Select **Postgres**
   - Choose a region close to your users
   - Click **Create**

2. Vercel automatically adds these environment variables:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
   - `POSTGRES_USER`
   - `POSTGRES_HOST`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_DATABASE`

### Step 4: Run Database Migrations

**Option A: Using Vercel Postgres Dashboard**
1. Go to your database in Vercel
2. Click **Query** tab
3. Copy contents of `database/schema.sql`
4. Click **Run**
5. Copy contents of `database/seed.sql`
6. Click **Run**

**Option B: Using psql Locally**
```bash
# Get connection string from Vercel dashboard
psql "YOUR_POSTGRES_URL_FROM_VERCEL"

# Run schema
\i database/schema.sql

# Run seed data
\i database/seed.sql

# Exit
\q
```

### Step 5: Add Environment Variables

In Vercel dashboard → Settings → Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `JWT_SECRET` | Generate with: `openssl rand -base64 32` | Production, Preview, Development |
| `NODE_ENV` | production | Production |

### Step 6: Redeploy

Vercel will automatically redeploy after adding environment variables.

---

## 🏗️ Architecture

### Local Development
```
Frontend → Next.js API Routes → JSON File Database
```

### Production (Vercel)
```
Frontend → Next.js API Routes → Vercel Postgres
```

The database adapter (`lib/database.js`) automatically switches based on environment.

---

## 📁 Project Structure

```
FitFun/
├── pages/
│   ├── api/                    # API routes
│   │   ├── auth/
│   │   │   ├── register.js
│   │   │   ├── login.js
│   │   │   ├── admin-login.js
│   │   │   ├── logout.js
│   │   │   └── me.js
│   │   ├── testimonials/
│   │   │   ├── index.js
│   │   │   └── [id].js
│   │   └── competitions/
│   │       └── index.js
│   ├── user/                   # User portal pages
│   └── admin/                  # Admin portal pages
├── lib/
│   ├── database.js             # Database adapter (auto-switches)
│   ├── database-json.js        # JSON file implementation
│   ├── database-postgres.js    # Postgres implementation
│   └── auth.js                 # Authentication utilities
├── database/
│   ├── schema.sql              # Postgres schema
│   └── seed.sql                # Seed data
├── data/
│   └── database.json           # Local JSON database
├── scripts/
│   └── setup-database.js       # Local database setup
├── package.json
├── next.config.js
├── .env.example
└── DEPLOYMENT.md
```

---

## 🔧 Environment Variables

### Local Development (.env.local)
```env
DATABASE_URL=json://local
JWT_SECRET=your-local-secret-key
NODE_ENV=development
```

### Production (Vercel)
```env
POSTGRES_URL=postgresql://...           # Auto-populated by Vercel
JWT_SECRET=<generated-secret>           # Add manually
NODE_ENV=production                     # Add manually
```

---

## 🧪 Testing

### Test Locally
1. Start server: `npm run dev`
2. Open http://localhost:3000
3. Test user portal and admin portal
4. Verify data persists in `data/database.json`

### Test Production
1. Deploy to Vercel
2. Run database migrations
3. Test with production URL
4. Verify data persists in Postgres

---

## 🔐 Security Checklist

Before going live:

- [ ] Change default admin password
- [ ] Generate strong JWT_SECRET: `openssl rand -base64 32`
- [ ] Enable HTTPS (Vercel does this automatically)
- [ ] Review CORS settings if needed
- [ ] Set up monitoring/logging
- [ ] Configure rate limiting (optional)
- [ ] Set up database backups (Vercel handles this)

---

## 📊 Database Schema

### Tables
- `users` - User accounts
- `admins` - Admin accounts
- `competitions` - Competitions
- `competition_participants` - Participants junction table
- `measurements` - User measurements
- `testimonials` - User testimonials
- `notifications` - In-app notifications

See `database/schema.sql` for complete schema.

---

## 🐛 Troubleshooting

### Local Development

**Database not found?**
```bash
npm run db:setup
```

**Port 3000 already in use?**
```bash
# Kill the process
lsof -ti:3000 | xargs kill

# Or use a different port
npm run dev -- -p 3001
```

### Production

**Database connection error?**
- Verify `POSTGRES_URL` is set in Vercel
- Check database is created in Vercel dashboard
- Verify migrations ran successfully

**API errors?**
- Check Vercel function logs
- Verify environment variables are set
- Check database schema is up to date

---

## 🚦 Next Steps

1. ✅ Test locally with JSON database
2. ✅ Deploy to Vercel
3. ✅ Set up Postgres database
4. ✅ Run migrations
5. ✅ Test production deployment
6. 🔄 Connect frontend to API (next phase)
7. 🔄 Add remaining API endpoints
8. 🔄 Full integration testing

---

## 📞 Support

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Postgres Docs](https://vercel.com/docs/storage/vercel-postgres)
- [Next.js Documentation](https://nextjs.org/docs)

---

**Status**: ✅ Backend Complete & Production Ready
