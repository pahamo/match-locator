# GitHub Secrets Configuration

This repository requires the following secrets for automated workflows:

## Required Secrets

### Sports Monks Daily Sync (`.github/workflows/sync-sportmonks.yml`)

1. **SUPABASE_URL**
   - Your Supabase project URL
   - Format: `https://your-project.supabase.co`

2. **SUPABASE_SERVICE_KEY**
   - Your Supabase service role key (secret)
   - Found in: Supabase Dashboard → Project Settings → API → service_role key

3. **SPORTMONKS_TOKEN**
   - Your Sports Monks API token
   - Found in: Sports Monks Dashboard → API Access

## How to Add Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with the exact name above
5. Paste the corresponding value
6. Click **Add secret**

## Testing the Workflow

### Manual Trigger
1. Go to **Actions** tab in GitHub
2. Select **Daily Sports Monks Sync** workflow
3. Click **Run workflow**
4. (Optional) Enter custom date range
5. Click **Run workflow**

### Automatic Schedule
- Runs daily at 2 AM UTC
- Syncs fixtures from today to +30 days
- No manual intervention needed

## Monitoring

Check workflow runs:
- GitHub → **Actions** tab → **Daily Sports Monks Sync**
- View logs for each run
- Check for errors or sync statistics
