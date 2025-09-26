// Design System Components Export

// Legacy components (keep for backward compatibility)
export { default as FixtureCard } from './FixtureCard';
export { default as ClubCard } from './ClubCard';
export { default as ContentCard } from './ContentCard';
export { default as TextContainer } from './TextContainer';

export type { FixtureCardProps } from './FixtureCard';
export type { ClubCardProps } from './ClubCard';
export type { ContentCardProps } from './ContentCard';
export type { TextContainerProps } from './TextContainer';

// New shadcn/ui components (replacing old design system)
export * from './Button';
export * from './Input';
export * from './Select';
export * from './Badge';
export * from './Dialog';

// Layout utilities (converted to Tailwind)
export * from './Layout';

// Typography components (converted to Tailwind)
export * from './Typography';