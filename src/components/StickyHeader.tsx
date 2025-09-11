import React, { useEffect, useState } from 'react';

interface StickyHeaderProps {
  activeGroup: {
    date: string;
    time: string;
  } | null;
  show: boolean;
}

const StickyHeader: React.FC<StickyHeaderProps> = ({ activeGroup, show }) => {
  const [previousGroup, setPreviousGroup] = useState(activeGroup);
  const [isAnimating, setIsAnimating] = useState(false);

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (activeGroup && activeGroup !== previousGroup && !prefersReducedMotion) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setPreviousGroup(activeGroup);
        setIsAnimating(false);
      }, 150); // 150ms transition
      
      return () => clearTimeout(timer);
    } else {
      setPreviousGroup(activeGroup);
    }
  }, [activeGroup, previousGroup, prefersReducedMotion]);

  if (!show || !activeGroup) return null;

  const displayGroup = isAnimating ? previousGroup : activeGroup;

  return (
    <div
      className="sticky-header"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        background: 'rgba(248, 250, 252, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        padding: '12px 16px',
        margin: '0 -16px',
        transition: prefersReducedMotion ? 'none' : 'all 150ms ease-out',
        opacity: isAnimating ? 0.7 : 1,
        transform: isAnimating ? 'translateY(-2px)' : 'translateY(0)'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '14px',
          fontWeight: '600',
          color: '#475569'
        }}
      >
        <span>{displayGroup?.date}</span>
        <span>{displayGroup?.time}</span>
      </div>
    </div>
  );
};

export default StickyHeader;