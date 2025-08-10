// Test timezone functionality
import { formatDateInTimezone, getCurrentHourInTimezone, getCurrentDateTimeInTimezone } from './src/lib/timezone.js';

// Test current date/time
const timezone = 'Asia/Kolkata';
const testDate = new Date();

console.log('Current date:', testDate);
console.log('Current hour in timezone:', getCurrentHourInTimezone(timezone));
console.log('Current datetime in timezone:', getCurrentDateTimeInTimezone(timezone));
console.log('Formatted date:', formatDateInTimezone(testDate, timezone, 'PPp'));
console.log('Formatted date (PP):', formatDateInTimezone(testDate, timezone, 'PP'));
