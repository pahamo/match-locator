import React from 'react';
import { useParams } from 'react-router-dom';

const MatchPage: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();

  return (
    <div className="match-page">
      <header>
        <h1>Match Details</h1>
      </header>
      
      <main>
        <div className="wrap">
          <p>Match ID: {matchId}</p>
          <p>React version - Coming soon!</p>
        </div>
      </main>
    </div>
  );
};

export default MatchPage;