import React from 'react';
import Header from '../components/Header';

const AboutPage: React.FC = () => {
  return (
    <div className="about-page">
      <Header 
        title="About fixtures.app"
        subtitle="Premier League TV Schedule for the UK"
      />

      <main>
        <div className="wrap">
          <section className="card" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius)', padding: 'var(--spacing-xl)', boxShadow: 'var(--shadow-sm)' }}>
            <p className="muted" style={{ marginTop: 0 }}>
              A simple, fast way to see who is broadcasting each Premier League match in the UK.
            </p>

            <h2 style={{ marginTop: '1.5rem' }}>What this is</h2>
            <p>
              This site lists upcoming Premier League fixtures and shows which UK broadcaster is carrying each match when announced.
              It is designed for speed, clarity, and mobile-first browsing.
            </p>

            <h2 style={{ marginTop: '1.5rem' }}>How it works</h2>
            <ul>
              <li>Fixtures are stored in a lightweight database.</li>
              <li>Broadcast assignments are added and edited via a small admin interface.</li>
              <li>Only essential data is shown: teams, kick-off, venue, and broadcaster.</li>
            </ul>

            <h2 style={{ marginTop: '1.5rem' }}>Broadcasters (UK)</h2>
            <p>
              Most live Premier League matches in the UK appear across <strong>Sky Sports</strong> and <strong>TNT Sports</strong> across the season. 
              When no broadcaster is confirmed yet, you will see <em>TBD</em>. 
              Some matches or highlights may appear on other services when rights and schedules allow.
            </p>

            <h2 style={{ marginTop: '1.5rem' }}>Notes & disclaimers</h2>
            <ul>
              <li>Listings can change. Always check the broadcaster’s official schedule before making plans.</li>
              <li>Kick-off times are shown in local UK time (Europe/London).</li>
              <li>This is an independent project and not affiliated with the Premier League or any broadcaster.</li>
            </ul>

            <h2 style={{ marginTop: '1.5rem' }}>Roadmap</h2>
            <ul>
              <li>Team pages with simple viewing guides.</li>
              <li>Competition filters and better search.</li>
              <li>Accessibility improvements and small design polish.</li>
            </ul>

            <h2 style={{ marginTop: '1.5rem' }}>Contact</h2>
            <p>
              Feedback or corrections are welcome. If you spot an error in broadcast info, please let us know so we can fix it quickly.
            </p>

            <div style={{ marginTop: '1.5rem' }}>
              <a href="/" style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}>← Back to Schedule</a>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AboutPage;

