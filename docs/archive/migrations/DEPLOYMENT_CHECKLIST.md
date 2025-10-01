# Smart Slug Migration - Deployment Checklist

## Pre-Deployment Setup

1. **Environment Variables**
   - Ensure `.env` file has your actual Supabase credentials:
   ```
   REACT_APP_SUPABASE_URL=your_actual_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key
   ```

2. **Test Database Migration Locally (Optional)**
   ```bash
   node scripts/update-team-slugs.js
   ```

## Deployment Steps

1. **Deploy Code Changes**
   ```bash
   git add -A
   git commit -m "feat: implement smart team slug system with redirects

   - Add url_slug column to teams table
   - Implement smart slug generation with business rules
   - Update ClubPage, ClubCard, MatchPage to use new slugs
   - Add automatic redirects from old to new URLs
   - Update sitemap generation
   - Maintain backward compatibility

   🤖 Generated with [Claude Code](https://claude.ai/code)

   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

2. **Run Database Migration** (via deployed function)
   ```bash
   # After deployment, call the function to add url_slug column
   curl -X POST https://your-site.netlify.app/.netlify/functions/add-url-slug-column

   # Then generate the smart slugs
   curl -X POST https://your-site.netlify.app/.netlify/functions/generate-smart-slugs
   ```

3. **Update Redirects File**
   ```bash
   # After slug generation, update redirects
   node scripts/update-redirects.js
   git add public/_redirects
   git commit -m "update: add team slug redirects after migration"
   # Deploy again
   ```

## Testing Checklist

After deployment, test these scenarios:

### URL Redirects
- [ ] `/clubs/arsenal-fc` redirects to `/club/arsenal`
- [ ] `/clubs/manchester-united-fc` redirects to `/club/man-united`
- [ ] `/club/old-slug` redirects to `/club/new-slug` for changed teams
- [ ] New URLs work directly: `/club/man-united`, `/club/arsenal`

### Application Functionality
- [ ] Team pages load correctly with new URLs
- [ ] Team links in fixture cards use new slugs
- [ ] Match page team buttons link to correct URLs
- [ ] Club cards link to correct URLs
- [ ] No broken links throughout the application

### SEO & Technical
- [ ] Sitemap includes new team URLs (`/sitemaps/sitemap-teams.xml`)
- [ ] Old URLs return 301 redirects (not 404s)
- [ ] Google Search Console shows no crawl errors
- [ ] Page speed remains good with redirect system

## Rollback Plan

If issues occur:

1. **Database Rollback**
   ```sql
   UPDATE teams SET url_slug = NULL;
   ```

2. **Remove Redirects**
   - Clear `public/_redirects` file
   - Keep only the general `/clubs/:slug /club/:slug 301!` rule

3. **Code Rollback**
   - Revert to use `team.slug` instead of `getTeamUrlSlug(team)`
   - Remove `url_slug` references from queries

## Success Metrics

- [ ] All team URLs follow new smart slug format
- [ ] Zero 404 errors for old team URLs
- [ ] Improved URL readability (e.g., `/club/man-united` vs `/club/manchester-united-fc`)
- [ ] No performance degradation
- [ ] SEO ranking maintained or improved

## Monitoring

After deployment, monitor:
- **Analytics**: Check for drops in team page traffic
- **Search Console**: Watch for crawl errors or indexing issues
- **User Reports**: Any broken links or redirect issues
- **Performance**: Ensure redirect overhead is minimal

## Clean Up (After Successful Migration)

After confirming everything works for 1-2 weeks:

1. Remove old slug generation functions:
   ```bash
   rm netlify/functions/add-url-slug-column.js
   rm netlify/functions/generate-smart-slugs.js
   ```

2. Remove migration scripts:
   ```bash
   rm scripts/update-team-slugs.js
   ```

3. Update documentation to reflect new URL structure

## Emergency Contacts

- Check logs in Netlify Functions dashboard
- Database changes can be monitored in Supabase dashboard
- Google Search Console for SEO impact monitoring

---

**Next Steps:**
1. Set up your `.env` file with real credentials
2. Deploy the code changes
3. Run the migration functions in production
4. Test all scenarios in the checklist