import React from 'react';
import { useParams } from 'react-router-dom';

const ClubPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();

  return (
    <div className="club-page">
      <header>
        <h1>Club Details</h1>
      </header>
      
      <main>
        <div className="wrap">
          <p>Club ID: {clubId}</p>
          <p>React version - Coming soon!</p>
        </div>
      </main>
    </div>
  );
};

export default ClubPage;