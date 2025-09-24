# Netlify Functions

## Environment Variables

**IMPORTANT:** All functions use standardized environment variables through `_shared/supabase.js`

Required environment variables in Netlify:
- `REACT_APP_SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_KEY` - Your Supabase service role key (NOT anon key)

## Creating New Functions

Always use the shared Supabase client to avoid environment variable issues:

```javascript
const { getSupabaseClient } = require('./_shared/supabase');

exports.handler = async (event, context) => {
  const supabase = getSupabaseClient(); // This handles all env validation
  // ... your function code
};
```

## Existing Functions

- `save-broadcaster.js` - Updates match broadcaster assignments
- `update-team-slug.js` - Updates team slug for SEO
- `save-competition-visibility.js` - Toggle competition visibility
- `export-teams-csv.js` - Export teams data as CSV

All functions use the standardized `getSupabaseClient()` approach.