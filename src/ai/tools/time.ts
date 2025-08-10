'use server';

import {ai} from '@/ai/genkit';
import {z} from 'zod';

export const getCurrentTime = ai.defineTool(
  {
    name: 'getCurrentTime',
    description: 'Gets the current date and time. Use this to resolve relative times like "today" or "now".',
    inputSchema: z.object({
      timezone: z.string().optional().describe('IANA timezone identifier (e.g., America/New_York, Asia/Kolkata). Defaults to UTC.'),
    }),
    outputSchema: z.object({
      currentTime: z.string().describe('The current time in ISO 8601 format.'),
      timezone: z.string().describe('The timezone used for the current time.'),
    }),
  },
  async (input) => {
    const timezone = input.timezone || 'UTC';
    
    try {
      // Use current system time directly instead of external API
      const now = new Date();
      console.log('getCurrentTime called with timezone:', timezone, 'Current time:', now.toISOString());
      
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
      
      const isoString = `${year}-${month}-${day}T${hour}:${minute}:${second}.000Z`;
      console.log('Returning current time:', isoString, 'for timezone:', timezone);
      
      return { 
        currentTime: isoString,
        timezone: timezone
      };
    } catch (error) {
        console.error("Failed to get current time, using fallback.", error);
      return { 
        currentTime: new Date().toISOString(),
        timezone: timezone
      };
    }
  }
);
