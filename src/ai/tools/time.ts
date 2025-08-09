'use server';

import {ai} from '@/ai/genkit';
import {z} from 'zod';

export const getCurrentTime = ai.defineTool(
  {
    name: 'getCurrentTime',
    description: 'Gets the current date and time. Use this to resolve relative times like "today" or "now".',
    inputSchema: z.object({}),
    outputSchema: z.object({
      currentTime: z.string().describe('The current time in ISO 8601 format.'),
    }),
  },
  async () => {
    try {
      // Fetches the current time from an external API to ensure accuracy.
      const response = await fetch('https://worldtimeapi.org/api/ip', {
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return { currentTime: data.utc_datetime };
    } catch (error) {
        console.error("Failed to fetch time from worldtimeapi, falling back to local time.", error);
        // Fallback to the server's local time if the API fails.
        return { currentTime: new Date().toISOString() };
    }
  }
);
