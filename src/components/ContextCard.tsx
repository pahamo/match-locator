import React from 'react';

interface ContextCardProps {
  icon: string;
  label: string;
  value: string;
  variant?: 'default' | 'live' | 'upcoming' | 'finished';
}

const ContextCard: React.FC<ContextCardProps> = ({
  icon,
  label,
  value,
  variant = 'default'
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'live':
        return {
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.05)',
          iconColor: '#ef4444'
        };
      case 'upcoming':
        return {
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.05)',
          iconColor: '#3b82f6'
        };
      case 'finished':
        return {
          borderColor: '#6b7280',
          backgroundColor: 'rgba(107, 114, 128, 0.05)',
          iconColor: '#6b7280'
        };
      default:
        return {
          borderColor: '#e5e7eb',
          backgroundColor: '#ffffff',
          iconColor: '#6366f1'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      className="context-card"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px',
        border: `1px solid ${styles.borderColor}`,
        borderRadius: '12px',
        backgroundColor: styles.backgroundColor,
        transition: 'all 0.2s ease-in-out',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div
        className="context-icon"
        style={{
          fontSize: '20px',
          color: styles.iconColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          backgroundColor: variant === 'live' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)',
          flexShrink: 0
        }}
      >
        {icon}
      </div>
      <div className="context-content" style={{ flex: 1, minWidth: 0 }}>
        <div
          className="context-label"
          style={{
            fontSize: '12px',
            fontWeight: '500',
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '0.025em',
            marginBottom: '2px'
          }}
        >
          {label}
        </div>
        <div
          className="context-value"
          style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            lineHeight: '1.3'
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
};

export default ContextCard;