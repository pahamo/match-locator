/**
 * Sitemap generation utilities for H2H pages
 * Replaces individual match page sitemaps with consolidated H2H pages
 */

import { generateAllPremierLeagueH2HRoutes, getPopularH2HMatchups } from './generateH2HRoutes';

interface SitemapUrl {
  url: string;
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority: string;
  lastmod?: string;
}

/**
 * Generate H2H sitemap entries
 */
export function generateH2HSitemapUrls(): SitemapUrl[] {
  const baseUrl = process.env.REACT_APP_CANONICAL_BASE || 'https://matchlocator.com';
  const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const allH2HRoutes = generateAllPremierLeagueH2HRoutes();
  const popularRoutes = getPopularH2HMatchups();

  return allH2HRoutes.map(route => {
    const isPopular = popularRoutes.includes(route);

    return {
      url: `${baseUrl}${route}`,
      changefreq: 'daily' as const, // H2H pages update with new fixtures
      priority: isPopular ? '0.9' : '0.8', // Higher priority for popular matchups
      lastmod: currentDate
    };
  });
}

/**
 * Generate XML sitemap for H2H pages
 */
export function generateH2HSitemap(): string {
  const urls = generateH2HSitemapUrls();

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(urlEntry => `  <url>
    <loc>${urlEntry.url}</loc>
    <lastmod>${urlEntry.lastmod}</lastmod>
    <changefreq>${urlEntry.changefreq}</changefreq>
    <priority>${urlEntry.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return sitemap;
}

/**
 * Generate sitemap index that includes H2H sitemap
 */
export function generateSitemapIndex(): string {
  const baseUrl = process.env.REACT_APP_CANONICAL_BASE || 'https://matchlocator.com';
  const currentDate = new Date().toISOString().split('T')[0];

  const sitemaps = [
    {
      loc: `${baseUrl}/sitemap-h2h.xml`,
      lastmod: currentDate,
      description: 'Head-to-Head pages'
    },
    {
      loc: `${baseUrl}/sitemap-fixtures.xml`,
      lastmod: currentDate,
      description: 'Fixture listing pages'
    },
    {
      loc: `${baseUrl}/sitemap-teams.xml`,
      lastmod: currentDate,
      description: 'Team pages'
    },
    {
      loc: `${baseUrl}/sitemap-legal.xml`,
      lastmod: currentDate,
      description: 'Legal and static pages'
    }
  ];

  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(sitemap => `  <sitemap>
    <loc>${sitemap.loc}</loc>
    <lastmod>${sitemap.lastmod}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;

  return sitemapIndex;
}

/**
 * Generate comprehensive sitemap statistics
 */
export function generateSitemapStats() {
  const h2hUrls = generateH2HSitemapUrls();
  const popularRoutes = getPopularH2HMatchups();

  return {
    totalH2HPages: h2hUrls.length,
    popularMatchups: popularRoutes.length,
    estimatedCrawlTime: `${Math.ceil(h2hUrls.length / 10)} minutes`, // Assuming 10 pages per minute
    lastGenerated: new Date().toISOString(),
    priorities: {
      popular: h2hUrls.filter(u => u.priority === '0.9').length,
      standard: h2hUrls.filter(u => u.priority === '0.8').length
    }
  };
}

/**
 * Helper to write sitemaps to files (for build process)
 */
export function writeSitemapFiles() {
  const h2hSitemap = generateH2HSitemap();
  const sitemapIndex = generateSitemapIndex();
  const stats = generateSitemapStats();

  console.log('H2H Sitemap Generation Stats:');
  console.log(`- Total H2H pages: ${stats.totalH2HPages}`);
  console.log(`- Popular matchups: ${stats.popularMatchups}`);
  console.log(`- High priority pages: ${stats.priorities.popular}`);
  console.log(`- Standard priority pages: ${stats.priorities.standard}`);
  console.log(`- Estimated crawl time: ${stats.estimatedCrawlTime}`);

  return {
    'sitemap-h2h.xml': h2hSitemap,
    'sitemap.xml': sitemapIndex,
    stats
  };
}

/**
 * Get sitemap URLs for testing/validation
 */
export function getH2HSitemapUrls(): string[] {
  return generateH2HSitemapUrls().map(entry => entry.url);
}