import { config } from 'dotenv';
config();

import '@/ai/flows/categorize-transaction.ts';
import '@/ai/tools/time.ts';
import '@/ai/flows/generate-insights.ts';
import '@/ai/flows/ask-verdant.ts';
import '@/ai/flows/bulk-categorize-transactions.ts';
