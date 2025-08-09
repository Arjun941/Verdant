'use server';

/**
 * This file defines an AI agent that generates financial insights from transaction data.
 *
 * - generateSpendingInsights: The function that analyzes transactions and provides insights.
 * - GenerateSpendingInsightsInput: The type for the input data the function expects.
 * - GenerateSpendingInsightsOutput: The type for the data the function returns.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { Insight, Transaction } from '@/lib/types';


const transactionSchema = z.object({
  id: z.string(),
  date: z.string(),
  description: z.string(),
  amount: z.number(),
  category: z.string(),
});

const insightSchema = z.object({
    id: z.string(),
    summary: z.string(),
    detailedAnalysis: z.string(),
    createdAt: z.string(),
});

const GenerateSpendingInsightsInputSchema = z.object({
  transactions: z.array(transactionSchema).describe("An array of the user's recent transactions."),
  previousInsights: z.array(insightSchema).optional().describe("An array of the last 7 insights generated for the user, for historical context."),
});
export type GenerateSpendingInsightsInput = z.infer<typeof GenerateSpendingInsightsInputSchema>;

const GenerateSpendingInsightsOutputSchema = z.object({
  summary: z.string().describe("A one or two-sentence summary of the user's spending habits."),
  detailedAnalysis: z.string().describe("A detailed analysis of spending patterns, identifying trends, and offering actionable suggestions for improvement and good spending habits. Use Markdown for formatting and line breaks."),
});
export type GenerateSpendingInsightsOutput = z.infer<typeof GenerateSpendingInsightsOutputSchema>;

export async function generateSpendingInsights(input: GenerateSpendingInsightsInput): Promise<GenerateSpendingInsightsOutput> {
  return generateSpendingInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSpendingInsightsPrompt',
  input: {schema: GenerateSpendingInsightsInputSchema},
  output: {schema: GenerateSpendingInsightsOutputSchema},
  prompt: `You are a friendly and encouraging financial advisor. Your goal is to help users understand their spending habits and provide them with actionable advice without being judgmental.

Analyze the following list of transactions and generate a summary and a detailed analysis.

**Transactions:**
{{#each transactions}}
- {{date}}: {{description}} ({{category}}) - ₹{{amount}}
{{/each}}

{{#if previousInsights}}
**Previous Insights Provided to the User (for context):**
Here are the last few insights you provided. Use them to understand the user's journey and avoid repeating the same advice. Acknowledge their progress if you see improvements.
{{#each previousInsights}}
---
**On {{createdAt}} you said:**
**Summary:** {{summary}}
**Analysis:** {{detailedAnalysis}}
---
{{/each}}
{{/if}}

**Instructions:**
1.  **Summary**: Write a short, encouraging summary (1-2 sentences) of the user's spending.
2.  **Detailed Analysis**:
    *   Identify the top spending categories.
    *   Point out any noticeable trends (e.g., "You seem to spend a lot on dining out on weekends.").
    *   If previous insights are available, reflect on them. Have they followed the advice? Is there a new pattern?
    *   Provide 2-3 specific, actionable suggestions for improvement (e.g., "Consider setting a monthly budget for 'Entertainment' to see if you can save more.").
    *   Offer general tips for good spending habits.
    *   Use Markdown for formatting, including newlines to separate paragraphs for readability. Keep the tone positive and helpful.`,
});

const generateSpendingInsightsFlow = ai.defineFlow(
  {
    name: 'generateSpendingInsightsFlow',
    inputSchema: GenerateSpendingInsightsInputSchema,
    outputSchema: GenerateSpendingInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
