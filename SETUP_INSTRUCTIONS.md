# ⚠️ CRITICAL: Supabase Setup Required

Your application cannot connect to Supabase because the credentials are invalid.

## 🔧 Fix Steps

### Step 1: Get Your Supabase Credentials

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard/

2. **Create or Select a Project:**
   - If you don't have a project, click "New Project"
   - Name it (e.g., "alumni-platform")
   - Choose a database password (save it somewhere safe)
   - Select a region close to you
   - Click "Create new project" (wait 2-3 minutes for setup)

3. **Get Your API Credentials:**
   - Click on your project
   - Go to: **Settings** → **API** (in the left sidebar)
   - You'll see two important values:

   **Project URL** (looks like):
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```

   **anon/public key** (it's a LONG token, 100+ characters, looks like):
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHgiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY4ODAwMDAwMCwiZXhwIjoyMDAzNTc2MDAwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### Step 2: Update Your .env.local File

Replace the content of your `.env.local` file with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=YOUR_PROJECT_URL_HERE
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_LONG_ANON_KEY_HERE
```

Example (with real values):
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODgwMDAwMDAsImV4cCI6MjAwMzU3NjAwMH0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 3: Run Database Migrations

After updating credentials:

1. **Open Supabase SQL Editor:**
   - In your Supabase project dashboard
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

2. **Run Each Migration File in Order:**

   **First:** Copy content from `scripts/001_create_tables.sql` → Paste → Run
   
   **Second:** Copy content from `scripts/002_add_enrollment_and_preferences.sql` → Paste → Run
   
   **Third:** Copy content from `scripts/003_fix_admin_permissions.sql` → Paste → Run
   
   **Fourth (CHAT FEATURE):** Copy content from `scripts/EXECUTE_THIS_004_create_chat_tables.sql` → Paste → Run

### Step 4: Restart Development Server

After updating `.env.local`:

```powershell
# Stop current server (Ctrl+C in terminal)
# Then restart:
npm run dev
```

## ✅ Verification

After setup, verify everything works:

1. Visit: http://localhost:3000/diagnostic
2. All checks should show green ✓

## 🆘 Troubleshooting

**If you see "Connect Timeout" or "ENOTFOUND":**
- Your Supabase credentials are wrong
- Check that you copied the FULL anon key (it's very long!)
- Make sure there are no extra spaces in `.env.local`

**If you see "relation does not exist":**
- You haven't run the migrations
- Go to Step 3 and run all SQL files

**If you see "Not authenticated":**
- You need to register/login first
- Go to http://localhost:3000/auth/register

---

## 📝 Current Issue

Your `.env.local` has an invalid anon key:
```
sb_publishable_bQi7ScbtqduJsTk7RBx04g_YUZANVYQ  ❌ TOO SHORT
```

A real anon key looks like:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHgiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY4ODAwMDAwMCwiZXhwIjoyMDAzNTc2MDAwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  ✓ CORRECT LENGTH
```

**Follow the steps above to fix this!**
