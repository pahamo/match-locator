import React, { forwardRef, useState, useEffect } from 'react';

interface DayGroupCardProps {
  id: string;
  date: string;
  matchweek: string;
  kickoffTime?: string;
  children: React.ReactNode;
}

const DayGroupCard = React.memo(forwardRef<HTMLDivElement, DayGroupCardProps>(
  ({ id, date, matchweek, kickoffTime, children }, ref) => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
      const handleScroll = () => {
        const scrolled = window.scrollY > 100;
        setIsScrolled(scrolled);
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    return (
      <div
        ref={ref}
        id={id}
        className="day-group-card"
        style={{
          borderRadius: '16px',
          border: '1px solid rgba(209, 213, 219, 0.8)',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
          padding: 'clamp(8px, 2vw, 16px)',
          marginBottom: '24px'
        }}
      >
        {/* Day Header */}
        <div
          className="day-header"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px 12px 12px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#475569',
            borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
            marginBottom: '12px',
            position: typeof window !== 'undefined' && window.innerWidth <= 768 ? 'sticky' : 'static',
            top: typeof window !== 'undefined' && window.innerWidth <= 768 ? '0' : 'auto',
            zIndex: typeof window !== 'undefined' && window.innerWidth <= 768 ? '10' : 'auto',
            background: typeof window !== 'undefined' && window.innerWidth <= 768 ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
            backdropFilter: typeof window !== 'undefined' && window.innerWidth <= 768 ? 'blur(8px)' : 'none',
            marginLeft: typeof window !== 'undefined' && window.innerWidth <= 768 ? '-' + 'clamp(8px, 2vw, 16px)' : '0',
            marginRight: typeof window !== 'undefined' && window.innerWidth <= 768 ? '-' + 'clamp(8px, 2vw, 16px)' : '0',
            paddingLeft: typeof window !== 'undefined' && window.innerWidth <= 768 ? 'clamp(8px, 2vw, 16px)' : '12px',
            paddingRight: typeof window !== 'undefined' && window.innerWidth <= 768 ? 'clamp(8px, 2vw, 16px)' : '12px'
          }}
        >
          <span style={{
            background: isScrolled && kickoffTime ? '#e0f2fe' : '#f3f4f6',
            color: isScrolled && kickoffTime ? '#0369a1' : '#374151',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 0.2s ease-in-out'
          }}>
            {isScrolled && kickoffTime ? (
              <>
                <span style={{ fontSize: '10px' }}>⏰</span>
                {kickoffTime}
              </>
            ) : (
              matchweek.replace('Matchweek ', 'MW')
            )}
          </span>
          <span>{date}</span>
        </div>

        {/* Fixture Cards */}
        <div className="fixtures-in-day" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {children}
        </div>
      </div>
    );
  }
));

DayGroupCard.displayName = 'DayGroupCard';

export default DayGroupCard;