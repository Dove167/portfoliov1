# Deploying to Cloudflare Workers (Alternative to Fly.io)

Your friend has provided an excellent guide for deploying to **Cloudflare Workers** instead of Fly.io. This document summarizes both approaches to help you decide which to use.

---

## Quick Comparison

| Feature | Fly.io | Cloudflare Workers |
|---------|--------|-------------------|
| **Free Tier** | 3 shared VMs, 3GB storage | Unlimited Workers, 5GB D1 |
| **Database** | SQLite via volume | D1 (Cloudflare SQLite) |
| **Runtime** | Your choice (we used Rust/Axum) | Cloudflare Workers (JS/TS/WASM) |
| **Cold Starts** | Minimal | Can be noticeable |
| **CLI Tool** | `flyctl` | `wrangler` |
| **Custom Domains** | Yes | Yes (free) |
| **Setup Complexity** | Moderate | Easy |

---

## Why Choose Cloudflare Workers?

✅ **Advantages:**
- Free tier is more generous for small projects
- Automatic deployments from GitHub
- D1 database is easier to set up than volumes
- Faster global edge deployment
- Your friend has already written a complete guide

❌ **Potential Downsides:**
- Workers have cold start delays (usually 50-200ms)
- If you're set on Rust/Axum, you'd need to compile to WASM
- May require architectural changes to your current codebase

---

## Your Friend's Complete Guide

Your friend has written an excellent step-by-step guide. Here's the condensed version:

### Step 1: Account Setup
```bash
# No CLI install needed initially - do it all in browser
# https://dash.cloudflare.com/sign-up
```

### Step 2: Get OpenRouter API Key
1. Go to https://openrouter.ai/keys
2. Create a key starting with `sk-or-...`
3. Save it somewhere safe

### Step 3: Create D1 Database
1. Cloudflare Dashboard → Workers & Pages → D1 SQL Database
2. Create database named `portfolio-db`
3. Copy the Database ID

### Step 4: Update Config
Edit `wrangler.jsonc`:
```jsonc
{
  "d1_databases": {
    "DATABASE": {
      "database_id": "your-database-id-here"
    }
  }
}
```

### Step 5: Create Database Tables
```bash
# Option A: Dashboard Console
# Copy contents of d1/schema.sql and paste in D1 Console

# Option B: CLI
npm install
npx wrangler login
npx wrangler d1 execute portfolio-db --remote --file=d1/schema.sql
```

### Step 6: Connect Git. Cloudflare Dashboard → Workers & PagesHub
1 → Create → Workers
2. Import your GitHub repository
3. Build settings:
   - Build command: `npm run build`
   - Deploy command: `npx wrangler deploy`

### Step 7: Set Environment Variables
In Worker Settings → Variables and Secrets:

| Variable | Value | Type |
|----------|-------|------|
| `OPENROUTER_API_KEY` | `sk-or-...` | Secret |
| `ADMIN_USERNAME` | your username | Secret |
| `ADMIN_PASSWORD` | your password | Secret |

### Step 8: Add D1 Binding
1. Settings → Bindings → Add
2. Variable name: `DB` (must be exact)
3. Select `portfolio-db`

### Step 9: Deploy
```bash
# From command line
npm run deploy

# Or push to GitHub (auto-deploys)
```

### Step 10: Verify
- Homepage loads
- Contact form works
- AI chat responds (press Ctrl+Q or click compass)
- Admin login works at `/admin`

---

## Migrating from Fly.io to Cloudflare

### What Changes

| Component | Fly.io | Cloudflare Workers |
|-----------|--------|-------------------|
| Frontend | Astro static build | Same (static) |
| Backend | Rust/Axum | Likely Hono or similar |
| Database | SQLite file | D1 (SQLite-compatible) |
| Config | `fly.toml` | `wrangler.jsonc` |
| API Routes | `/api/*` handlers | `src/pages/api/*` |

### Key Decision Point

**If your current repo uses:**
- **Rust/Axum backend** → Stay with Fly.io (harder to migrate)
- **Hono or similar JS framework** → Cloudflare Workers is great

---

## Running Both Side-by-Side

You can try Cloudflare Workers while keeping Fly.io deployed:

1. **Don't delete the Fly.io app** yet
2. Follow your friend's guide to set up Cloudflare
3. Test thoroughly on Cloudflare
4. Only switch DNS when ready

---

## Files Reference (Your Friend's Guide)

| File | Purpose |
|------|---------|
| `wrangler.jsonc` | Cloudflare config + D1 binding |
| `d1/schema.sql` | Database table definitions |
| `.dev.vars` | Local development secrets |
| `src/pages/api/` | API endpoints |
| `src/components/AIChat.tsx` | AI chat interface |
| `summary_of_me.md` | Josh's bio for AI |

---

## Troubleshooting Cloudflare

### "AI service returned an error"
```bash
# Check secrets are set
npx wrangler secret list

# Set missing secret
npx wrangler secret put OPENROUTER_API_KEY
```

### "no such table: contacts"
```bash
# Re-run schema
npx wrangler d1 execute portfolio-db --remote --file=d1/schema.sql
```

### Pages are blank
```bash
# Check build logs in Cloudflare dashboard
# Verify build command: npm run build
# Verify deploy command: npx wrangler deploy
```

### Local development
```bash
npm install
npx wrangler d1 execute portfolio-db --local --file=d1/schema.sql
npm run build
npm run preview
```

---

## Summary

**Use Cloudflare Workers if:**
- You want free, generous hosting
- Your codebase works with Workers/Hono
- You want auto-deploy from GitHub
- Cold starts aren't a dealbreaker

**Stick with Fly.io if:**
- You want to keep Rust/Axum
- You already have everything working
- You prefer full control over the VM

---

## Your Friend's Guide

Your friend's document (`DEPLOYING_TO_CLOUDFLARE_WORKERS.md` or similar) contains the complete step-by-step. It includes:

- ✅ All prerequisites listed
- ✅ Screenshot-level detail
- ✅ Multiple options for each step
- ✅ Local development setup
- ✅ Custom domain instructions
- ✅ Troubleshooting section

**Recommendation:** Try your friend's Cloudflare approach. The free tier is more generous, and you have a complete guide written for you.

---

## Quick Start (Cloudflare)

```bash
# 1. Create account at https://dash.cloudflare.com/sign-up

# 2. Get OpenRouter key at https://openrouter.ai/keys

# 3. Create D1 database in dashboard

# 4. Update wrangler.jsonc with database ID

# 5. Set secrets
npx wrangler secret put OPENROUTER_API_KEY
npx wrangler secret put ADMIN_USERNAME
npx wrangler secret put ADMIN_PASSWORD

# 6. Connect GitHub and deploy via dashboard
# OR
npm run deploy
```

---

*Document created: February 2026*
