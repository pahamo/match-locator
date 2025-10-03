import React from 'react';
import { Link } from 'react-router-dom';
import { tokens } from '../tokens';
import type { Team } from '../../types';
import { getDisplayTeamName } from '../../utils/teamNames';
import { getTeamUrlSlug } from '../../utils/slugUtils';

export interface ClubCardProps {
  team: Team;
  variant?: 'default' | 'compact' | 'ucl';
  showBadge?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const ClubCard: React.FC<ClubCardProps> = ({ 
  team, 
  variant = 'default',
  showBadge = false,
  className = '',
  style = {}
}) => {
  const isUCL = variant === 'ucl';
  
  const baseCardStyle = {
    background: isUCL 
      ? `linear-gradient(135deg, ${tokens.colors.competition.background.ucl} 0%, #ffffff 100%)`
      : 'white',
    border: `1px solid ${isUCL ? tokens.colors.competition.ucl : tokens.colors.gray[200]}`,
    borderRadius: tokens.borderRadius.lg,
    padding: `${tokens.spacing.lg} ${tokens.spacing.md}`,
    textAlign: 'center' as const,
    textDecoration: 'none',
    color: 'inherit',
    transition: tokens.transition.base,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    height: '120px',
    justifyContent: 'center',
    position: 'relative' as const,
    ...style
  };
  
  const hoverStyle = {
    borderColor: isUCL ? tokens.colors.competition.ucl : tokens.colors.primary[500],
    boxShadow: isUCL ? tokens.boxShadow.ucl : tokens.boxShadow.primary,
    transform: 'translateY(-2px)'
  };
  
  const crestContainerStyle = {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.spacing.sm
  };
  
  const crestStyle = {
    maxHeight: '40px',
    maxWidth: '40px',
    objectFit: 'contain' as const
  };
  
  const fallbackCrestStyle = {
    width: '40px',
    height: '40px',
    borderRadius: tokens.borderRadius.full,
    background: tokens.colors.gray[100],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: tokens.fontWeight.bold,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.gray[500]
  };
  
  const teamNameStyle = {
    fontSize: tokens.fontSize.sm,
    fontWeight: tokens.fontWeight.semibold,
    color: tokens.colors.gray[800],
    lineHeight: '1.3',
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center'
  };
  
  const shortNameStyle = {
    fontSize: tokens.fontSize.base,
    fontWeight: tokens.fontWeight.bold,
    color: tokens.colors.gray[800],
    display: 'none' // Will be shown on mobile via CSS
  };
  
  const badgeStyle = {
    position: 'absolute' as const,
    top: tokens.spacing.xs,
    right: tokens.spacing.xs,
    background: tokens.colors.competition.ucl,
    color: 'white',
    borderRadius: tokens.borderRadius.full,
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px'
  };
  
  const initials = team.name.split(' ').map((word: string) => word[0]).join('').slice(0, 3);
  
  return (
    <Link
      to={`/club/${getTeamUrlSlug(team)}`}
      className={`club-card club-card--${variant} ${className}`}
      style={baseCardStyle}
      onMouseEnter={(e) => {
        Object.assign(e.currentTarget.style, hoverStyle);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = isUCL ? tokens.colors.competition.ucl : tokens.colors.gray[200];
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* UCL Badge */}
      {showBadge && isUCL && (
        <div style={badgeStyle}>
          ⭐
        </div>
      )}

      {/* Crest */}
      <div style={crestContainerStyle}>
        {team.crest ? (
          <img 
            src={team.crest} 
            alt={`${team.name} crest`}
            style={crestStyle}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div style={fallbackCrestStyle}>
            {initials}
          </div>
        )}
      </div>
      
      {/* Team Name */}
      <div style={teamNameStyle}>
        {/* Full name - responsive */}
        <div 
          className="team-name-full"
          style={{
            display: 'block'
          }}
        >
          {team.name}
        </div>
        {/* Short name - hidden by default, shown on mobile */}
        <div 
          className="team-name-short"
          style={shortNameStyle}
        >
          {getDisplayTeamName(team.name, true)}
        </div>
      </div>
    </Link>
  );
};

// Add CSS for responsive team name display
const clubCardStyles = `
  .team-name-short {
    display: none;
  }

  @media (max-width: 768px) {
    .team-name-full {
      display: none;
    }

    .team-name-short {
      display: block;
    }
  }
`;

// Inject styles if not already present
if (typeof document !== 'undefined' && !document.getElementById('club-card-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'club-card-styles';
  styleSheet.textContent = clubCardStyles;
  document.head.appendChild(styleSheet);
}

export default ClubCard;