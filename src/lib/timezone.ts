'use client';

/**
 * Get user's timezone from browser
 */
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.error('Error getting user timezone:', error);
    return 'UTC'; // fallback
  }
}

/**
 * Get current hour in user's timezone (0-23)
 */
export function getCurrentHourInTimezone(timezone: string = 'UTC'): number {
  try {
    const now = new Date();
    const userTime = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false
    }).format(now);
    
    return parseInt(userTime, 10);
  } catch (error) {
    console.error('Error getting current hour in timezone:', error);
    return new Date().getHours();
  }
}

/**
 * Get current datetime in user's timezone as ISO string
 */
export function getCurrentDateTimeInTimezone(timezone: string = 'UTC'): string {
  try {
    const now = new Date();
    
    // What time is it in this timezone right now?
    const timeInTimezone = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).formatToParts(now);
    
    const year = timeInTimezone.find(part => part.type === 'year')?.value;
    const month = timeInTimezone.find(part => part.type === 'month')?.value;
    const day = timeInTimezone.find(part => part.type === 'day')?.value;
    const hour = timeInTimezone.find(part => part.type === 'hour')?.value;
    const minute = timeInTimezone.find(part => part.type === 'minute')?.value;
    const second = timeInTimezone.find(part => part.type === 'second')?.value;
    
    return `${year}-${month}-${day}T${hour}:${minute}:${second}.000Z`;
  } catch (error) {
    console.error('Error getting current datetime in timezone:', error);
    return new Date().toISOString();
  }
}

/**
 * Convert a date to a specific timezone and return ISO string
 */
export function convertToTimezone(date: Date | string, timezone: string): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Convert this date to the user's timezone
    const timeInTimezone = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).formatToParts(dateObj);
    
    const year = timeInTimezone.find(part => part.type === 'year')?.value;
    const month = timeInTimezone.find(part => part.type === 'month')?.value;
    const day = timeInTimezone.find(part => part.type === 'day')?.value;
    const hour = timeInTimezone.find(part => part.type === 'hour')?.value;
    const minute = timeInTimezone.find(part => part.type === 'minute')?.value;
    const second = timeInTimezone.find(part => part.type === 'second')?.value;
    
    return `${year}-${month}-${day}T${hour}:${minute}:${second}.000Z`;
  } catch (error) {
    console.error('Error converting to timezone:', error);
    return new Date().toISOString();
  }
}

/**
 * Format date for display in user's timezone
 */
export function formatDateInTimezone(date: Date | string, timezone: string, format: string = 'PPp'): string {
  try {
    // Make sure we have a date to work with
    if (!date) {
      console.error('formatDateInTimezone: No date provided');
      return 'Invalid date';
    }
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Show a friendly error for bad dates
    if (isNaN(dateObj.getTime())) {
      console.error('formatDateInTimezone: Invalid date:', date);
      return 'Invalid date';
    }
    
    // Format based on the requested format
    if (format === 'PPp') {
      // "Aug 11, 2025 at 2:00 AM"
      const datePart = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(dateObj);
      
      const timePart = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).format(dateObj);
      
      return `${datePart} at ${timePart}`;
    } else if (format === 'PPP') {
      // "August 11, 2025"
      return new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(dateObj);
    } else if (format === 'PP') {
      // "Aug 11, 2025"
      return new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(dateObj);
    } else {
      // Default format
      return new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).format(dateObj);
    }
  } catch (error) {
    console.error('Error formatting date in timezone:', error);
    return new Date(date).toLocaleString();
  }
}

/**
 * Get a list of common timezones for selection
 */
export function getCommonTimezones(): { value: string; label: string }[] {
  return [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'London (GMT/BST)' },
    { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
    { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Kolkata', label: 'India (IST)' },
    { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
    { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEDT/AEST)' },
    { value: 'Australia/Melbourne', label: 'Melbourne (AEDT/AEST)' },
    { value: 'Pacific/Auckland', label: 'Auckland (NZDT/NZST)' },
  ];
}

/**
 * Detect timezone from geolocation (requires user permission)
 */
export async function detectTimezoneFromLocation(): Promise<string> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(getUserTimezone());
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Look up timezone from GPS coordinates
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://api.ipgeolocation.io/timezone?apiKey=${process.env.NEXT_PUBLIC_GEOLOCATION_API_KEY}&lat=${latitude}&long=${longitude}`
          );
          
          if (response.ok) {
            const data = await response.json();
            resolve(data.timezone || getUserTimezone());
          } else {
            resolve(getUserTimezone());
          }
        } catch (error) {
          console.error('Error detecting timezone from location:', error);
          resolve(getUserTimezone());
        }
      },
      () => {
        // User said no to location sharing
        resolve(getUserTimezone());
      },
      { timeout: 5000 }
    );
  });
}
