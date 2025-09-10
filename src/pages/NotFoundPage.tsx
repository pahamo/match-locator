import React from 'react';
import Header from '../components/Header';

const NotFoundPage: React.FC = () => {
  return (
    <div className="notfound-page">
      <Header />
      <main>
        <div className="wrap">
          <h1 style={{ marginTop: 0 }}>Page not found</h1>
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
