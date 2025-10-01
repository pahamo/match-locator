import React from 'react';
import Header from '../components/Header';
import Breadcrumbs from '../components/Breadcrumbs';
import { ContentCard, TextContainer } from '../design-system';
import { generateBreadcrumbs } from '../utils/breadcrumbs';

const NotFoundPage: React.FC = () => {
  return (
    <div className="notfound-page">
      <Header />
      <main>
        <div className="wrap" style={{ paddingTop: 'var(--layout-page-top-margin)' }}>
          <Breadcrumbs items={generateBreadcrumbs(window.location.pathname)} />
          <ContentCard>
            <TextContainer>
              <h1>Page not found</h1>
              <p>Try one of these links:</p>
              <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/fixtures">All Fixtures</a></li>
                <li><a href="/clubs">Clubs</a></li>
              </ul>
            </TextContainer>
          </ContentCard>
        </div>
      </main>
    </div>
  );
};

export default NotFoundPage;
