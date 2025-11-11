import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Fixture } from '../types';
import { getFixturesByDateRange } from '../services/supabase';
import { getUKDate } from '../utils/dateRange';
import { FixtureCard } from '../design-system';
import { Card, CardHeader, CardTitle, CardContent } from '../design-system/components/Card';

/**
 * WeekendPreviewSection Component
 * Shows upcoming weekend (Saturday + Sunday) fixtures
 * Used on homepage for match discovery
 */
export const WeekendPreviewSection: React.FC = () => {
  const [weekendFixtures, setWeekendFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekendDates, setWeekendDates] = useState<{ saturday: Date; sunday: Date } | null>(null);

  useEffect(() => {
    const fetchWeekendFixtures = async () => {
      setLoading(true);

      try {
        const ukToday = getUKDate();
        const currentDay = ukToday.getDay(); // 0 = Sunday, 6 = Saturday

        // Calculate next Saturday and Sunday
        let daysUntilSaturday: number;
        if (currentDay === 0) {
          // If today is Sunday, next Saturday is in 6 days
          daysUntilSaturday = 6;
        } else if (currentDay === 6) {
          // If today is Saturday, use today
          daysUntilSaturday = 0;
        } else {
          // Otherwise calculate days until next Saturday
          daysUntilSaturday = 6 - currentDay;
        }

        const saturday = new Date(ukToday);
        saturday.setDate(ukToday.getDate() + daysUntilSaturday);

        const sunday = new Date(saturday);
        sunday.setDate(saturday.getDate() + 1);

        setWeekendDates({ saturday, sunday });

        // Fetch fixtures for both days
        const saturdayStart = new Date(saturday);
        saturdayStart.setHours(0, 0, 0, 0);
        const sundayEnd = new Date(sunday);
        sundayEnd.setHours(23, 59, 59, 999);

        const fixtures = await getFixturesByDateRange(
          saturdayStart.toISOString(),
          sundayEnd.toISOString()
        );

        // Sort by kickoff time
        const sortedFixtures = fixtures.sort(
          (a, b) => new Date(a.kickoff_utc).getTime() - new Date(b.kickoff_utc).getTime()
        );

        setWeekendFixtures(sortedFixtures);
      } catch (error) {
        console.error('Error fetching weekend fixtures:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeekendFixtures();
  }, []);

  if (loading) {
    return (
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          This Weekend's Matches
        </h2>
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  if (weekendFixtures.length === 0 || !weekendDates) {
    return null;
  }

  // Show only first 6 fixtures as preview
  const previewFixtures = weekendFixtures.slice(0, 6);
  const hasMoreFixtures = weekendFixtures.length > 6;

  const formatWeekendDate = (date: Date): string => {
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          This Weekend's Matches
        </h2>
        {hasMoreFixtures && (
          <Link
            to="/weekend"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
          >
            View all {weekendFixtures.length} matches →
          </Link>
        )}
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {formatWeekendDate(weekendDates.saturday)} - {formatWeekendDate(weekendDates.sunday)}
      </p>

      <div className="space-y-3">
        {previewFixtures.map((fixture) => (
          <FixtureCard
            key={fixture.id}
            fixture={fixture}
            variant="withTime"
          />
        ))}
      </div>

      {hasMoreFixtures && (
        <div className="mt-4 text-center">
          <Link
            to="/weekend"
            className="inline-block px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium"
          >
            View All Weekend Matches ({weekendFixtures.length})
          </Link>
        </div>
      )}
    </div>
  );
};
