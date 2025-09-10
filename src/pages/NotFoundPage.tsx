import React from 'react';
import Header from '../components/Header';

const NotFoundPage: React.FC = () => {
  return (
    <div className="notfound-page">
      <Header title="Page not found" subtitle="The page you’re looking for doesn’t exist." />
      <main>
        <div className="wrap">
          <p>Try one of these links:</p>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/fixtures">All Fixtures</a></li>
            <li><a href="/clubs">Clubs</a></li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default NotFoundPage;

