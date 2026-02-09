# Deploying Josh's Portfolio to Cloudflare Workers

Hey! This guide will walk you through getting this portfolio live on Cloudflare Workers. It's free-tier friendly and should take about 15-20 minutes. Follow every step in order — don't skip ahead.

---

## Prerequisites

Before you start, make sure you have:

- [ ] A GitHub account (you probably already have this)
- [ ] Node.js installed (v18 or newer — run `node --version` to check)
- [ ] This repo cloned to your computer

---

## Step 1: Create a Cloudflare Account

1. Go to [https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)
2. Sign up with your email and a password
3. Verify your email (check your inbox, click the link)
4. You'll land on the Cloudflare dashboard — that's where you need to be

---

## Step 2: Get an OpenRouter API Key

The AI chat feature on the portfolio uses OpenRouter to talk to an AI model. You need a free API key.

1. Go to [https://openrouter.ai](https://openrouter.ai)
2. Sign up / log in
3. Go to [https://openrouter.ai/keys](https://openrouter.ai/keys)
4. Click **"Create Key"**
5. Name it whatever you want (e.g. "josh-portfolio")
6. Copy the key — it starts with `sk-or-...`
7. **Save it somewhere safe.** You'll need it in Step 5.

The model we're using (`google/gemini-2.0-flash-lite-preview-02-05:free`) is free, so you won't be charged.

---

## Step 3: Create a D1 Database

D1 is Cloudflare's database. Think of it like a tiny SQLite database that lives in the cloud.

1. In the Cloudflare dashboard, look at the left sidebar
2. Click **"Workers & Pages"**
3. Click **"D1 SQL Database"** in the left sidebar (under Storage & Databases, or you can search for "D1" in the sidebar)
4. Click **"Create"**
5. Name it: `portfolio-db`
6. Click **"Create"**
7. You'll be taken to the database page. Look for **Database ID** — it's a long string like `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
8. **Copy that Database ID.** You need it next.

---

## Step 4: Update the Config File with Your Database ID

1. Open the file `wrangler.jsonc` in the root of the project
2. Find this line (around line 31):
   ```
   "database_id": "YOUR_D1_DATABASE_ID_HERE"
   ```
3. Replace `YOUR_D1_DATABASE_ID_HERE` with the Database ID you copied in Step 3
4. Save the file

It should look something like:
```jsonc
"database_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```

---

## Step 5: Create the Database Tables

The database exists, but it's empty — no tables yet. You need to run the schema file to create them.

### Option A: Using the Cloudflare Dashboard (easier)

1. Go back to the Cloudflare dashboard
2. Go to **Workers & Pages** → **D1 SQL Database** → click on **portfolio-db**
3. Click the **"Console"** tab
4. Open the file `d1/schema.sql` from this project in a text editor
5. Copy the **entire contents** of that file
6. Paste it into the Console input box
7. Click **"Execute"**
8. You should see two success messages (one for each table: `contacts` and `projects`)

### Option B: Using the command line (if you're comfortable with terminal)

First, install dependencies if you haven't:
```bash
npm install
```

Then run:
```bash
npx wrangler login
npx wrangler d1 execute portfolio-db --remote --file=d1/schema.sql
```

It will open a browser window to log you in to Cloudflare, then create the tables.

---

## Step 6: Connect GitHub to Cloudflare

This is what makes it auto-deploy when you push code.

1. In the Cloudflare dashboard, go to **Workers & Pages**
2. Click **"Create"**
3. Click the **"Workers"** tab (not Pages)
4. Click **"Import a repository"** / **"Connect to Git"**
5. Authorize Cloudflare to access your GitHub account
6. Select the repository for this portfolio
7. Configure the build settings:
   - **Build command:** `npm run build`
   - **Deploy command:** `npx wrangler deploy`
8. **Don't deploy yet!** You need to set environment variables first (Step 7).

> **If it asks for a "Framework preset"**: choose **None** — we handle everything through wrangler.

---

## Step 7: Set Environment Variables (Secrets)

These are private values that the app needs to run. **Never put these in code or commit them to git.**

1. After connecting the repo (or from the Workers & Pages dashboard), go to your worker
2. Click **"Settings"**
3. Click **"Variables and Secrets"**
4. Add the following **secrets** (click "Add" for each one, and make sure to select **"Encrypt"** / **"Secret"** for each):

| Variable Name       | Value                                                      | Type    |
|---------------------|------------------------------------------------------------|---------|
| `OPENROUTER_API_KEY`| The API key from Step 2 (starts with `sk-or-...`)          | Secret  |
| `ADMIN_USERNAME`    | Pick a username for the admin panel (e.g. `admin`)         | Secret  |
| `ADMIN_PASSWORD`    | Pick a strong password for the admin panel                 | Secret  |

5. The `OPENROUTER_MODEL` variable is already set in `wrangler.jsonc` — you don't need to add it here unless you want to override it.

---

## Step 8: Add the D1 Database Binding

Your Worker needs to know about the database.

1. Still in your Worker's **Settings**, look for **"Bindings"**
2. Click **"Add"**
3. Choose **"D1 Database"**
4. Set the **Variable name** to: `DB` (must be exactly `DB`, all caps)
5. Select your **portfolio-db** database from the dropdown
6. Save

> **Note:** If the binding was already created automatically from `wrangler.jsonc`, you might see it listed already. If `DB` is already there pointing to `portfolio-db`, you're good — skip this.

---

## Step 9: Deploy!

### First deploy (from the dashboard):

1. Go to your Worker in the dashboard
2. Trigger a deploy (click "Retry deploy" or push a commit to GitHub)
3. Wait for the build to finish — it usually takes 1-2 minutes

### Or deploy from the command line:

```bash
npm install           # if you haven't already
npm run deploy        # builds the site and deploys to Cloudflare
```

If using the CLI for the first time, it will ask you to log in — a browser window will open.

---

## Step 10: Verify Everything Works

Your site will be live at a URL like `https://josh-portfolio.<your-subdomain>.workers.dev`

Test these things:

- [ ] **Homepage loads** — Visit the URL, make sure the page renders
- [ ] **Pages work** — Click around: Projects, Resume, Contact, Chat
- [ ] **Favicon shows** — Check the browser tab for the custom icon (might need a hard refresh: Ctrl+Shift+R)
- [ ] **Contact form** — Go to `/contact`, fill in a test message, submit it. You should see a success message.
- [ ] **AI Chat** — Click the compass icon (bottom-right) or press `Ctrl+Q`. Send a message like "Who is Josh?" — you should get an AI response about Josh.
- [ ] **Admin login** — Go to `/admin`, log in with the username/password you set in Step 7
- [ ] **Admin dashboard** — After logging in, you should see the dashboard with your test contact message

---

## Custom Domain (Optional)

If you want the site on a custom domain (like `joshfajardo.dev`):

1. In the Cloudflare dashboard, add the domain to your account (Workers & Pages → your worker → Settings → Domains & Routes)
2. Click **"Add"** → **"Custom Domain"**
3. Enter the domain name
4. Cloudflare will tell you what DNS records to set
5. If the domain is already on Cloudflare DNS, it'll be automatic

---

## Troubleshooting

### "AI service returned an error"
- Your OpenRouter API key is wrong or missing
- Go to Worker Settings → Variables and Secrets → make sure `OPENROUTER_API_KEY` is set and starts with `sk-or-`

### Contact form gives an error
- The D1 database tables weren't created. Go back to Step 5.
- The DB binding is missing. Go back to Step 8.

### Pages are blank / 500 errors
- Check that the build command is `npm run build` and deploy command is `npx wrangler deploy`
- Check the build logs in the Cloudflare dashboard for specific errors

### Admin login doesn't work
- Make sure `ADMIN_USERNAME` and `ADMIN_PASSWORD` are set in Worker Settings → Variables and Secrets
- They're case-sensitive — type carefully

### "no such table: contacts" error
- You need to run the database schema. Go back to Step 5.

---

## Local Development (if you want to make changes)

To run the site locally on your own computer:

```bash
# 1. Install dependencies
npm install

# 2. Create local database tables (only needed once, or after deleting .wrangler/)
npx wrangler d1 execute portfolio-db --local --file=d1/schema.sql

# 3. Edit .dev.vars with your real values
#    (this file is gitignored so your secrets stay local)

# 4. Build and preview
npm run build
npm run preview
```

The site will be running at `http://localhost:8787`

Every time you make changes, you need to rebuild (`npm run build`) then restart preview.

If you delete the `.wrangler/` folder (or it gets wiped), run the `d1 execute` command again from step 2 to recreate the local database tables.

---

## File Reference

If you need to find anything:

| What                      | Where                                    |
|---------------------------|------------------------------------------|
| Cloudflare config         | `wrangler.jsonc`                         |
| Database schema           | `d1/schema.sql`                          |
| Local dev secrets         | `.dev.vars`                              |
| API endpoints             | `src/pages/api/`                         |
| Frontend pages            | `src/pages/`                             |
| AI chat component         | `src/components/AIChat.tsx`              |
| Josh's AI context file    | `summary_of_me.md`                       |
| Favicons                  | `public/images/favicons/`               |
| Tailwind styles           | `src/styles/global.css`                  |

---

That's it! If something goes wrong, re-read the step you're on — 90% of issues are a missed step or a typo. Good luck!
