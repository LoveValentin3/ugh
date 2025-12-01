# 🎄 North Pole Pen Pals - EASY Deployment Guide

## Overview - What We're Using (All FREE!)

| Service | Purpose | Cost |
|---------|---------|------|
| **Vercel** | Hosts your website & API | FREE |
| **Supabase** | Database (stores users, letters, etc.) | FREE |
| **OpenAI** | AI elf responses | ~$5/month |
| **Stripe** | Payments | Only pays when you get paid |

---

## Step 1: Create Your Accounts (10 minutes)

### 1A. Create a Supabase Account (Your Database)

1. Go to **https://supabase.com**
2. Click **"Start your project"**
3. Sign up with GitHub (easiest) or email
4. Click **"New Project"**
5. Fill in:
   - **Name:** `north-pole-penpals`
   - **Database Password:** (save this somewhere safe!)
   - **Region:** Choose closest to you
6. Click **"Create new project"** (takes 2 minutes to setup)

### 1B. Get Your Supabase Keys

Once your project is ready:
1. Click **"Settings"** (gear icon) in left sidebar
2. Click **"API"**
3. You'll see:
   - **Project URL** - Copy this (looks like `https://xxxxx.supabase.co`)
   - **anon public key** - Copy this
   - **service_role key** - Copy this (keep secret!)

### 1C. Setup Your Database Tables

1. In Supabase, click **"SQL Editor"** in left sidebar
2. Click **"New query"**
3. Copy and paste the ENTIRE contents of `database/supabase-schema.sql` (I'll create this file)
4. Click **"Run"** (or press Ctrl+Enter)
5. You should see "Success" - your database is ready!

---

## Step 2: Create a Vercel Account (5 minutes)

1. Go to **https://vercel.com**
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"** (easiest)
4. Authorize Vercel to access GitHub

---

## Step 3: Get Your Code on GitHub (5 minutes)

### If you're new to GitHub:

1. Go to **https://github.com** and create account
2. Click the **"+"** button (top right) → **"New repository"**
3. Name it: `north-pole-penpals`
4. Keep it **Public** (or Private if you prefer)
5. Click **"Create repository"**

### Upload Your Files:

1. On your new repository page, click **"uploading an existing file"**
2. Drag and drop ALL the project files:
   ```
   - index.html
   - api/ (whole folder)
   - database/ (whole folder)
   - vercel.json
   - package.json
   ```
3. Click **"Commit changes"**

---

## Step 4: Deploy on Vercel (5 minutes)

1. Go to **https://vercel.com/dashboard**
2. Click **"Add New..."** → **"Project"**
3. Find your `north-pole-penpals` repository
4. Click **"Import"**

### Add Environment Variables:

Before deploying, click **"Environment Variables"** and add these:

| Name | Value |
|------|-------|
| `SUPABASE_URL` | Your Supabase Project URL |
| `SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_KEY` | Your Supabase service_role key |
| `JWT_SECRET` | Make up a random string (like `mySecretKey12345!@#$%`) |
| `OPENAI_API_KEY` | Your OpenAI key (get from openai.com) |
| `STRIPE_SECRET_KEY` | Your Stripe key (get from stripe.com) |

5. Click **"Deploy"**
6. Wait 1-2 minutes...
7. 🎉 **YOUR APP IS LIVE!** You'll get a URL like `north-pole-penpals.vercel.app`

---

## Step 5: Get API Keys for AI & Payments (Optional)

### OpenAI (for AI elf responses):
1. Go to **https://platform.openai.com**
2. Sign up / Log in
3. Click your profile → **"API keys"**
4. Click **"Create new secret key"**
5. Copy it and add to Vercel environment variables

### Stripe (for payments):
1. Go to **https://stripe.com**
2. Create account
3. Go to **Developers** → **API keys**
4. Copy **Secret key** and add to Vercel

---

## That's It! 🎄

Your app should now be live at your Vercel URL!

### Test It:
1. Visit your URL
2. Try registering as a parent
3. Create a kid account
4. Write a letter to an elf!

---

## Troubleshooting

### "Database error" 
→ Make sure you ran the SQL in Supabase

### "API not working"
→ Check your environment variables in Vercel

### "Login not working"
→ Make sure JWT_SECRET is set

### Need help?
→ Check the Vercel deployment logs (click on your deployment)

---

## Summary of What Goes Where

```
Your Computer/GitHub:
├── index.html          ← The website kids see
├── vercel.json         ← Tells Vercel how to run things
├── package.json        ← Lists what code libraries to use
├── api/                ← Backend code (runs on Vercel)
│   ├── auth.js
│   ├── letters.js
│   ├── elves.js
│   └── ...
└── database/
    └── supabase-schema.sql  ← Copy this into Supabase

Supabase (supabase.com):
└── Your database with tables for parents, kids, letters, etc.

Vercel (vercel.com):
└── Hosts everything and makes it work!
```

🎅 **Merry Coding!** 🎄
