import React, { forwardRef } from 'react';

interface DayGroupCardProps {
  id: string;
  date: string;
  time: string;
  children: React.ReactNode;
}

const DayGroupCard = forwardRef<HTMLDivElement, DayGroupCardProps>(
  ({ id, date, time, children }, ref) => {
    return (
      <div
        ref={ref}
        id={id}
        className="day-group-card"
        style={{
          borderRadius: '16px',
          border: '1px solid rgba(229, 231, 235, 0.7)',
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(8px)',
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
            marginBottom: '12px'
          }}
        >
          <span>{date}</span>
          <span>{time}</span>
        </div>

        {/* Fixture Cards */}
        <div className="fixtures-in-day" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {children}
        </div>
      </div>
    );
  }
);

DayGroupCard.displayName = 'DayGroupCard';

export default DayGroupCard;