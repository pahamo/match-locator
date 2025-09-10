import React from 'react';

interface MobileFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const MobileFilterModal: React.FC<MobileFilterModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-modal-title"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'var(--color-card)',
          borderTopLeftRadius: 'var(--border-radius)',
          borderTopRightRadius: 'var(--border-radius)',
          zIndex: 1001,
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          backgroundColor: 'var(--color-card)',
          zIndex: 1
        }}>
          <h2 id="filter-modal-title" style={{
            margin: 0,
            fontSize: '1.1rem',
            fontWeight: '600',
            color: 'var(--color-text)'
          }}>
            Filter Fixtures
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px',
              color: 'var(--color-muted)',
              minHeight: '44px',
              minWidth: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Close filters"
          >
            ×
          </button>
        </div>
        
        {/* Content */}
        <div style={{ padding: '20px' }}>
          {children}
        </div>
        
        {/* Close button */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--color-border)',
          position: 'sticky',
          bottom: 0,
          backgroundColor: 'var(--color-card)'
        }}>
          <button
            onClick={onClose}
            style={{
              width: '100%',
              background: 'var(--color-accent)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '14px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              minHeight: '44px'
            }}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
};

export default MobileFilterModal;