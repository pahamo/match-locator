import React from 'react';
import { Card } from '../design-system/components/Card';
import Flex from '../design-system/components/Layout/Flex';
import LiveBadge from './LiveBadge';

/**
 * StatusBar Component
 * Displays match count, live status, and update time in a compact bar
 * Uses design system components (Card, Flex) and Tailwind classes
 */
interface StatusBarProps {
  matchCount: number;
  lastUpdated: Date;
  hasLiveMatches?: boolean;
  liveKickoffTime?: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  matchCount,
  lastUpdated,
  hasLiveMatches = false,
  liveKickoffTime,
}) => {
  return (
    <Card variant="outline" className="mb-4">
      <Flex
        justify="between"
        align="center"
        wrap="wrap"
        gap="md"
        className="px-4 py-2.5"
      >
        <Flex align="center" gap="md" wrap="wrap">
          {hasLiveMatches && liveKickoffTime && (
            <LiveBadge kickoffTime={liveKickoffTime} variant="compact" />
          )}
          <span className="text-sm font-semibold text-foreground">
            {matchCount} {matchCount === 1 ? 'match' : 'matches'} today
          </span>
        </Flex>

        <Flex align="center" gap="md" wrap="wrap" className="text-xs text-muted-foreground">
          <span>
            Updated: {lastUpdated.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="hidden sm:inline">• Auto-updates</span>
        </Flex>
      </Flex>
    </Card>
  );
};
