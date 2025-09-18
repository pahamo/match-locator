import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Breadcrumbs from '../components/Breadcrumbs';
import StructuredData from '../components/StructuredData';
import { updateDocumentMeta } from '../utils/seo';
import { generateBreadcrumbs } from '../utils/breadcrumbs';
import { SkyAffiliateLink, AmazonAffiliateLink } from '../components/affiliate/AffiliateLink';

interface HowToWatchContent {
  title: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  provider: string;
  mainContent: React.ReactNode;
  faqData?: Array<{question: string; answer: string}>;
}

const getHowToWatchContent = (slug: string): HowToWatchContent | null => {
  switch (slug) {
    case 'sky-sports':
      return {
        title: 'How to Watch Sky Sports Football',
        description: 'Complete guide to watching Premier League, EFL Cup and more on Sky Sports',
        metaTitle: 'How to Watch Sky Sports Football - UK TV Guide | Match Locator',
        metaDescription: 'Complete guide to watching football on Sky Sports. Premier League, EFL Cup coverage, Sky Sports packages, and where to watch Sky Sports in the UK.',
        provider: 'Sky Sports',
        mainContent: (
          <div>
            <section style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Sky Sports Football Coverage</h2>
              <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>
                Sky Sports is the UK's leading broadcaster for live football, showing more Premier League matches than any other UK broadcaster.
                With Sky Sports, you can watch live matches, highlights, analysis, and exclusive content.
              </p>

              <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', marginTop: '24px' }}>What Football Does Sky Sports Show?</h3>
              <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
                <li><strong>Premier League</strong> - Up to 128 live matches per season</li>
                <li><strong>EFL Championship</strong> - Selected matches throughout the season</li>
                <li><strong>EFL Cup</strong> - Live coverage from early rounds to final</li>
                <li><strong>Scottish Premiership</strong> - Selected Rangers and Celtic matches</li>
                <li><strong>MLS</strong> - Major League Soccer from the USA</li>
                <li><strong>International Football</strong> - England friendlies and qualifiers</li>
              </ul>
            </section>

            <section style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>How to Get Sky Sports</h2>

              <div style={{
                background: '#f8fafc',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                marginBottom: '20px'
              }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', marginTop: '0' }}>Sky TV Packages</h3>
                <p style={{ marginBottom: '12px' }}>Add Sky Sports to your Sky TV package:</p>
                <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                  <li>Sky Sports (all channels) - typically £25-30/month</li>
                  <li>Sky Sports Premier League only - around £18/month</li>
                  <li>Sky Sports + Cinema bundle - various prices</li>
                </ul>
                <SkyAffiliateLink
                  href="https://www.sky.com/deals/sports"
                  trackingLabel="how-to-watch"
                  pageType="guide"
                  style={{
                    display: 'inline-block',
                    background: '#0084ff',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontWeight: '500'
                  }}
                >
                  View Sky Sports Deals
                </SkyAffiliateLink>
              </div>

              <div style={{
                background: '#f8fafc',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                marginBottom: '20px'
              }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', marginTop: '0' }}>NOW TV (Streaming)</h3>
                <p style={{ marginBottom: '12px' }}>Watch Sky Sports without a contract:</p>
                <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                  <li>Day Pass - £11.98 for 24 hours</li>
                  <li>Weekly Pass - £25 for 7 days</li>
                  <li>Monthly Pass - £33.99 per month</li>
                </ul>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>
                  Perfect for occasional viewing or big matches. No contract required.
                </p>
              </div>

              <div style={{
                background: '#f8fafc',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', marginTop: '0' }}>Other Ways to Watch</h3>
                <ul style={{ paddingLeft: '20px' }}>
                  <li><strong>Virgin Media</strong> - Add Sky Sports channels to Virgin TV</li>
                  <li><strong>BT TV</strong> - Sky Sports available as add-on</li>
                  <li><strong>Pubs & Venues</strong> - Many show Sky Sports for free</li>
                </ul>
              </div>
            </section>

            <section style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Sky Sports Channels</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 8px 0' }}>Sky Sports Premier League</h4>
                  <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>Dedicated to Premier League coverage</p>
                </div>
                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 8px 0' }}>Sky Sports Football</h4>
                  <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>EFL, Scottish football, and more</p>
                </div>
                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 8px 0' }}>Sky Sports Main Event</h4>
                  <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>Biggest matches and events</p>
                </div>
              </div>
            </section>
          </div>
        ),
        faqData: [
          {
            question: "How much does Sky Sports cost?",
            answer: "Sky Sports typically costs £25-30 per month when added to a Sky TV package. Sky Sports Premier League only is around £18/month. You can also watch via NOW TV with day (£11.98), weekly (£25), or monthly (£33.99) passes."
          },
          {
            question: "Can I watch Sky Sports without Sky TV?",
            answer: "Yes, you can watch Sky Sports through NOW TV streaming service without needing a Sky TV subscription. You can also get Sky Sports through Virgin Media, BT TV, and other providers."
          },
          {
            question: "What Premier League matches does Sky Sports show?",
            answer: "Sky Sports shows up to 128 live Premier League matches per season. This includes matches on Saturday evening, Sunday, Monday Night Football, and selected midweek fixtures."
          }
        ]
      };

    case 'tnt-sports':
      return {
        title: 'How to Watch TNT Sports Football',
        description: 'Complete guide to watching Champions League, Europa League and Premier League on TNT Sports',
        metaTitle: 'How to Watch TNT Sports Football - UK TV Guide | Match Locator',
        metaDescription: 'Complete guide to watching football on TNT Sports. Champions League, Europa League, Premier League coverage and TNT Sports packages in the UK.',
        provider: 'TNT Sports',
        mainContent: (
          <div>
            <section style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>TNT Sports Football Coverage</h2>
              <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>
                TNT Sports (formerly BT Sport) is the exclusive home of Champions League and Europa League football in the UK.
                They also show selected Premier League matches and other European competitions.
              </p>

              <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', marginTop: '24px' }}>What Football Does TNT Sports Show?</h3>
              <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
                <li><strong>UEFA Champions League</strong> - All matches exclusively</li>
                <li><strong>UEFA Europa League</strong> - All matches exclusively</li>
                <li><strong>UEFA Europa Conference League</strong> - Selected matches</li>
                <li><strong>Premier League</strong> - Up to 52 matches per season</li>
                <li><strong>FA Cup</strong> - Selected matches (shared with BBC/ITV)</li>
                <li><strong>Women's Super League</strong> - Selected matches</li>
              </ul>
            </section>

            <section style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>How to Get TNT Sports</h2>

              <div style={{
                background: '#f8fafc',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                marginBottom: '20px'
              }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', marginTop: '0' }}>BT TV Packages</h3>
                <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                  <li>TNT Sports on BT TV - typically £30-35/month</li>
                  <li>Big Sport package (TNT + Sky Sports) - around £40/month</li>
                  <li>Available with BT Broadband packages</li>
                </ul>
              </div>

              <div style={{
                background: '#f8fafc',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                marginBottom: '20px'
              }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', marginTop: '0' }}>Other Providers</h3>
                <ul style={{ paddingLeft: '20px' }}>
                  <li><strong>Sky TV</strong> - TNT Sports available as add-on</li>
                  <li><strong>Virgin Media</strong> - TNT Sports in premium packages</li>
                  <li><strong>EE TV</strong> - Available with some packages</li>
                  <li><strong>Amazon Prime Video</strong> - TNT Sports add-on available</li>
                </ul>
              </div>
            </section>
          </div>
        ),
        faqData: [
          {
            question: "How much does TNT Sports cost?",
            answer: "TNT Sports typically costs £30-35 per month on BT TV. You can also get it through Sky TV, Virgin Media, and as an Amazon Prime Video add-on. Prices vary by provider and package."
          },
          {
            question: "Does TNT Sports show all Champions League matches?",
            answer: "Yes, TNT Sports has exclusive rights to all Champions League matches in the UK. This includes group stages, knockout rounds, and the final."
          },
          {
            question: "Can I watch TNT Sports without BT?",
            answer: "Yes, TNT Sports is available through Sky TV, Virgin Media, EE TV, and as an Amazon Prime Video add-on. You don't need BT broadband or TV to access it."
          }
        ]
      };

    case 'premier-league':
      return {
        title: 'How to Watch Premier League on TV',
        description: 'Complete guide to watching Premier League matches on UK television',
        metaTitle: 'How to Watch Premier League on TV - UK Broadcasting Guide | Match Locator',
        metaDescription: 'Complete guide to watching Premier League matches on UK TV. Sky Sports, TNT Sports, Amazon Prime coverage, fixtures, and where to watch every game.',
        provider: 'Premier League',
        mainContent: (
          <div>
            <section style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Premier League TV Coverage</h2>
              <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>
                Premier League matches are broadcast across multiple platforms in the UK. Not all 380 matches are shown live due to
                the 3pm Saturday blackout rule, but around 200 matches are televised each season.
              </p>

              <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', marginTop: '24px' }}>Where to Watch Premier League</h3>

              <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
                <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#0084ff' }}>Sky Sports (Most Matches)</h4>
                  <ul style={{ paddingLeft: '20px', margin: '0' }}>
                    <li>Up to 128 live matches per season</li>
                    <li>Saturday 5:30pm kick-offs</li>
                    <li>Sunday matches (2pm and 4:30pm)</li>
                    <li>Monday Night Football</li>
                    <li>Selected midweek fixtures</li>
                  </ul>
                </div>

                <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#e91e63' }}>TNT Sports</h4>
                  <ul style={{ paddingLeft: '20px', margin: '0' }}>
                    <li>Up to 52 live matches per season</li>
                    <li>Saturday 12:30pm kick-offs</li>
                    <li>Selected weekend and midweek matches</li>
                  </ul>
                </div>

                <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#ff9500' }}>Amazon Prime Video</h4>
                  <ul style={{ paddingLeft: '20px', margin: '0' }}>
                    <li>20 matches per season</li>
                    <li>Full Boxing Day fixtures</li>
                    <li>One midweek round in December</li>
                  </ul>
                </div>
              </div>
            </section>

            <section style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>The 3pm Saturday Blackout</h2>
              <div style={{
                background: '#fef3c7',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #fbbf24',
                marginBottom: '20px'
              }}>
                <h3 style={{ margin: '0 0 12px 0' }}>⚠️ Important to Know</h3>
                <p style={{ margin: '0', lineHeight: '1.6' }}>
                  Matches kicking off at 3pm on Saturday are <strong>not shown live on UK television</strong>.
                  This UEFA rule protects lower league attendance. You can watch highlights later on Match of the Day.
                </p>
              </div>
            </section>

            <section style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Cost Comparison</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 8px 0' }}>Sky Sports</h4>
                  <p style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>£25-30/month</p>
                  <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>Most Premier League matches</p>
                </div>
                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 8px 0' }}>TNT Sports</h4>
                  <p style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>£30-35/month</p>
                  <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>52 Premier League matches</p>
                </div>
                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 8px 0' }}>Amazon Prime</h4>
                  <p style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>£8.99/month</p>
                  <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>20 Premier League matches</p>
                </div>
              </div>
            </section>
          </div>
        ),
        faqData: [
          {
            question: "Are all Premier League matches on TV?",
            answer: "No, not all Premier League matches are televised. Around 200 of the 380 matches are shown live on UK television. Matches at 3pm on Saturday are not broadcast live due to the blackout rule."
          },
          {
            question: "What is the cheapest way to watch Premier League?",
            answer: "Amazon Prime Video at £8.99/month shows 20 Premier League matches per season, making it the cheapest option. However, Sky Sports shows the most matches for £25-30/month."
          },
          {
            question: "Can I watch Premier League for free?",
            answer: "Very few Premier League matches are shown free-to-air. Occasionally, special matches may be shown on BBC or ITV, but the vast majority require a subscription to Sky Sports, TNT Sports, or Amazon Prime Video."
          }
        ]
      };

    default:
      return null;
  }
};

const HowToWatchPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const content = slug ? getHowToWatchContent(slug) : null;

  useEffect(() => {
    if (content && slug) {
      const meta = {
        title: content.metaTitle,
        description: content.metaDescription,
        canonical: `${process.env.REACT_APP_CANONICAL_BASE || 'https://matchlocator.com'}/how-to-watch/${slug}`,
        ogTitle: content.title,
        ogDescription: content.metaDescription,
        ogImage: `${process.env.REACT_APP_CANONICAL_BASE || 'https://matchlocator.com'}/og-how-to-watch-${slug}.jpg`
      };

      updateDocumentMeta(meta);
    }
  }, [slug, content]);

  if (!slug) {
    return <div>Invalid page</div>;
  }

  if (!content) {
    return <div>Page not found</div>;
  }

  return (
    <div>
      <StructuredData type="faq" data={content.faqData} />
      <Header />
      <main className="wrap" style={{ paddingTop: 'var(--layout-page-top-margin)' }}>
        <Breadcrumbs items={generateBreadcrumbs(`/how-to-watch/${slug}`, { customTitle: content.title })} />

        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            marginBottom: '8px',
            fontWeight: '700'
          }}>
            {content.title}
          </h1>
          <p style={{
            fontSize: '1.125rem',
            color: 'var(--color-text-secondary)',
            margin: 0
          }}>
            {content.description}
          </p>
        </div>

        {content.mainContent}

        {/* Quick Links */}
        <section style={{
          marginTop: '48px',
          padding: '24px',
          background: 'var(--color-surface)',
          borderRadius: 'var(--border-radius-lg)',
          border: '1px solid var(--color-border)'
        }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Other TV Guides</h2>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {slug !== 'sky-sports' && (
              <a
                href="/how-to-watch/sky-sports"
                style={{
                  padding: '8px 16px',
                  background: 'var(--color-primary)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Sky Sports Guide
              </a>
            )}
            {slug !== 'tnt-sports' && (
              <a
                href="/how-to-watch/tnt-sports"
                style={{
                  padding: '8px 16px',
                  background: 'var(--color-primary)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                TNT Sports Guide
              </a>
            )}
            {slug !== 'premier-league' && (
              <a
                href="/how-to-watch/premier-league"
                style={{
                  padding: '8px 16px',
                  background: 'var(--color-primary)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Premier League Guide
              </a>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default HowToWatchPage;