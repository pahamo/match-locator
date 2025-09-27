/**
 * Timezone Test Utility
 * Test local time display functionality
 */

import { formatTime, formatTimeWithTimezone, getUserTimezone, getDateInfo } from './dateFormat';

// Test fixture data
const testFixture = {
  id: 1,
  kickoff_utc: '2025-09-27T15:00:00.000Z', // 3:00 PM UTC
};

export function testTimezoneDisplay() {
  console.log('🌍 Timezone Display Test');
  console.log('='.repeat(40));

  const utcTime = testFixture.kickoff_utc;
  console.log(`UTC Time: ${utcTime}`);

  // Test current timezone detection
  const userTimezone = getUserTimezone();
  console.log(`User Timezone: ${userTimezone}`);

  // Test local time formatting
  const localTime = formatTime(utcTime);
  console.log(`Local Time (24h): ${localTime}`);

  // Test time with timezone
  const timeWithTz = formatTimeWithTimezone(utcTime);
  console.log(`Time with TZ: ${timeWithTz}`);

  // Test date info
  const dateInfo = getDateInfo(utcTime);
  console.log('Date Info:', dateInfo);

  // Test different timezones
  const testTimezones = [
    'America/New_York',
    'America/Los_Angeles',
    'Europe/London',
    'Asia/Tokyo',
    'Australia/Sydney'
  ];

  console.log('\n🗺️  Test Times in Different Timezones:');
  testTimezones.forEach(tz => {
    const timeInTz = formatTime(utcTime, tz);
    console.log(`${tz}: ${timeInTz}`);
  });

  // Test edge cases
  console.log('\n⚡ Edge Case Tests:');

  // Test midnight crossing
  const midnightTest = '2025-09-27T23:30:00.000Z';
  const midnightInfo = getDateInfo(midnightTest);
  console.log(`Midnight test (23:30 UTC):`, midnightInfo);

  // Test early morning
  const earlyMorning = '2025-09-27T01:00:00.000Z';
  const earlyInfo = getDateInfo(earlyMorning);
  console.log(`Early morning test (01:00 UTC):`, earlyInfo);

  return {
    userTimezone,
    localTime,
    timeWithTz,
    dateInfo
  };
}

// Browser console test - call this in browser dev tools
if (typeof window !== 'undefined') {
  (window as any).testTimezone = testTimezoneDisplay;
  console.log('💡 Run testTimezone() in console to test timezone functionality');
}