import React from 'react';
import Header from '../components/Header';
import { ContentCard, TextContainer } from '../design-system';

const AboutPage: React.FC = () => {
  return (
    <div className="about-page">
      <Header />

      <main>
        <div className="wrap" style={{ paddingTop: 'var(--layout-page-top-margin)' }}>
          <ContentCard>
            <TextContainer>
              <h1>About Match Locator</h1>
              <p className="muted">
                A simple, fast way to see who is broadcasting each Premier League match in the UK.
              </p>

              <h2>What this is</h2>
              <p>
                This site lists upcoming Premier League fixtures and shows which UK broadcaster is carrying each match when announced.
                It is designed for speed, clarity, and mobile-first browsing.
              </p>

              <h2>How it works</h2>
              <ul>
                <li>Fixtures are stored in a lightweight database.</li>
                <li>Broadcast assignments are added and edited via a small admin interface.</li>
                <li>Only essential data is shown: teams, kick-off, venue, and broadcaster.</li>
              </ul>

              <h2>Broadcasters (UK)</h2>
              <p>
                Most live Premier League matches in the UK appear across <strong>Sky Sports</strong> and <strong>TNT Sports</strong> across the season.
                When no broadcaster is confirmed yet, you will see <em>TBD</em>.
                Some matches or highlights may appear on other services when rights and schedules allow.
              </p>

              <h2>Notes & disclaimers</h2>
              <ul>
                <li>Listings can change. Always check the broadcaster's official schedule before making plans.</li>
                <li>Kick-off times are shown in local UK time (Europe/London).</li>
                <li>This is an independent project and not affiliated with the Premier League or any broadcaster.</li>
              </ul>

              <h2>Roadmap</h2>
              <ul>
                <li>Team pages with simple viewing guides.</li>
                <li>Competition filters and better search.</li>
                <li>Accessibility improvements and small design polish.</li>
              </ul>

              <h2>Contact</h2>
              <p>
                Feedback or corrections are welcome. If you spot an error in broadcast info, please let us know so we can fix it quickly.
              </p>

              <div>
                <a href="/">← Back to Schedule</a>
              </div>
            </TextContainer>
          </ContentCard>
        </div>
      </main>
    </div>
  );
};

export default AboutPage;
