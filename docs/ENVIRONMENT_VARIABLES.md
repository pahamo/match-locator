# Environment Variables Configuration

## 🚨 CRITICAL: Production vs Development

### 🏭 PRODUCTION (Netlify)
**Environment variables are configured in Netlify Dashboard:**
```
https://app.netlify.com → Site Settings → Environment Variables
```

**NEVER debug production issues by looking at local .env files!**

### 💻 LOCAL DEVELOPMENT
**Environment variables are in local `.env` file (ignored by git):**
```
cp .env.example .env
# Edit .env with your local values
```

## 📋 Required Environment Variables

### Frontend Variables (REACT_APP_*)
```bash
REACT_APP_SUPABASE_URL=https://[project].supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGci...  # Public anon key
```

### Server-side Script Variables
```bash
SUPABASE_URL=https://[project].supabase.co
SUPABASE_SERVICE_KEY=eyJhbGci...  # Service role key (SECRET!)
FOOTBALL_DATA_TOKEN=91f8454d...   # Football-Data.org API key
```

### Configuration Variables
```bash
COMP_ID_DB=1        # Premier League in database
COMP_ID_API=2021    # Premier League in Football-Data API
SEASON=2025         # Current season
```

## 🔧 Setup Instructions

### Local Development Setup
1. **Copy template:** `cp .env.example .env`
2. **Get Supabase credentials:** Project Settings → API
3. **Get Football-Data key:** https://www.football-data.org/client/register
4. **Fill in .env file** with actual values
5. **Test:** `npm start` should work without API errors

### Production Setup (Netlify)
1. **Go to:** https://app.netlify.com → Site Settings → Environment Variables
2. **Add all variables** from the list above
3. **Deploy:** Variables are available in build and runtime

## 🚨 Common Mistakes to Avoid

### ❌ Don't Debug Production Using Local Files
```bash
# WRONG: Looking at .env for production issues
cat .env  # This is local only!

# RIGHT: Check Netlify dashboard environment variables
# https://app.netlify.com → Site Settings → Environment Variables
```

### ❌ Don't Commit .env Files
```bash
# WRONG: Committing secrets
git add .env
git commit -m "add env"  # NEVER DO THIS

# RIGHT: .env is in .gitignore and never committed
# Only .env.example is in git
```

### ❌ Don't Mix Local and Production Values
- **Local .env:** Use your personal Supabase project for testing
- **Netlify:** Use production Supabase project
- **Never copy production secrets to local files**

## 🛠️ Troubleshooting

### "No API key found" Error
1. **Check Netlify environment variables** are set correctly
2. **Verify variable names** match exactly (case-sensitive)
3. **Redeploy** after changing Netlify environment variables

### Local Development Not Working
1. **Check .env file exists:** `ls -la .env`
2. **Check .env has values:** `cat .env | grep REACT_APP`
3. **Restart dev server:** `npm start`

### Scripts Not Working
1. **Check server-side variables:** `SUPABASE_SERVICE_KEY`, `FOOTBALL_DATA_TOKEN`
2. **Run with debug:** `node scripts/your-script.mjs`
3. **Check for typos** in variable names

## 📝 Environment Variables Checklist

**For new team members:**
- [ ] Copied .env.example to .env
- [ ] Filled in all REACT_APP_* variables
- [ ] Filled in all script variables (SUPABASE_SERVICE_KEY, etc.)
- [ ] Tested `npm start` works without errors
- [ ] Confirmed .env is not committed to git

**For production debugging:**
- [ ] Checked Netlify environment variables (not local .env)
- [ ] Verified all required variables are set in Netlify
- [ ] Redeployed after environment variable changes
- [ ] Checked build logs for environment variable errors

---

**Remember: When in doubt, production environment variables are in Netlify, not in your local files!**