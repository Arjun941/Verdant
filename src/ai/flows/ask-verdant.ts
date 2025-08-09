'use server';

/**
 * This file defines an AI agent that provides conversational financial advice.
 *
 * - askVerdant: Answers user questions based on their financial data.
 * - AskVerdantInput: The type for the input data the function expects.
 * - AskVerdantOutput: The type for the data the function returns.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

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

const AskVerdantInputSchema = z.object({
  question: z.string().describe("The user's question about their finances."),
  transactions: z.array(transactionSchema).optional().describe("The user's transaction history."),
  insights: z.array(insightSchema).optional().describe("The history of previously generated insights for the user."),
});
export type AskVerdantInput = z.infer<typeof AskVerdantInputSchema>;

const AskVerdantOutputSchema = z.object({
  answer: z.string().describe("The AI's answer to the user's question."),
});
export type AskVerdantOutput = z.infer<typeof AskVerdantOutputSchema>;

export async function askVerdant(input: AskVerdantInput): Promise<AskVerdantOutput> {
  return askVerdantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'askVerdantPrompt',
  input: { schema: AskVerdantInputSchema },
  output: { schema: AskVerdantOutputSchema },
  prompt: `You are Verdant, a friendly, expert financial advisor AI for the Verdant app. Your role is to answer the user's questions about their finances.

{{#if transactions.length}}
You have access to the user's financial data. Use their transaction history and the past advice you've given them to formulate a specific, helpful, and context-aware answer.

**User's Question: {{{question}}}**

**Transaction History:**
{{#each transactions}}
- {{date}}: {{description}} ({{category}}) - ₹{{amount}}
{{/each}}

{{#if insights.length}}
**Previous Insights You've Provided:**
{{#each insights}}
---
**On {{createdAt}} you said:**
**Summary:** {{summary}}
**Analysis:** {{detailedAnalysis}}
---
{{/each}}
{{/if}}

Based on all of this information, provide a clear and encouraging answer to the user's question.

{{else}}
You are Verdant, a friendly, expert financial advisor AI for the Verdant app. The user has asked a question, but you do not have access to their personal financial data yet.

**User's Question: {{{question}}}**

First, politely inform the user that you don't have their spending data yet, so you can only provide general advice. Then, answer their question with general financial tips and best practices. Encourage them to add their transactions to get personalized advice.
{{/if}}
`,
});

const askVerdantFlow = ai.defineFlow(
  {
    name: 'askVerdantFlow',
    inputSchema: AskVerdantInputSchema,
    outputSchema: AskVerdantOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
