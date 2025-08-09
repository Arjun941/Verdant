'use server';

/**
 * This file defines an AI agent that categorizes a single transaction from a text description.
 *
 * - categorizeTransaction: The function that handles the transaction categorization.
 * - CategorizeTransactionInput: The type for the input data the function expects.
 * - CategorizeTransactionOutput: The type for the data the function returns.
 */

import {ai} from '@/ai/genkit';
import {getCurrentTime} from '@/ai/tools/time';
import {z} from 'genkit';

const CategorizeTransactionInputSchema = z.object({
  transactionDetails: z
    .string()
    .describe('The details of the transaction in natural language.'),
});
export type CategorizeTransactionInput = z.infer<typeof CategorizeTransactionInputSchema>;

const CategorizeTransactionOutputSchema = z.object({
  isIncome: z.boolean().describe('Whether this transaction is an income (gain of money).'),
  category: z.string().describe('The category of the transaction. For income, this could be "Salary", "Freelance", etc.'),
  amount: z.number().describe('The amount of the transaction.'),
  date: z.string().describe('The date of the transaction in ISO format.'),
  description: z.string().describe('A short description of the transaction.'),
});
export type CategorizeTransactionOutput = z.infer<typeof CategorizeTransactionOutputSchema>;

export async function categorizeTransaction(input: CategorizeTransactionInput): Promise<CategorizeTransactionOutput> {
  return categorizeTransactionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeTransactionPrompt',
  input: {schema: CategorizeTransactionInputSchema},
  output: {schema: CategorizeTransactionOutputSchema},
  tools: [getCurrentTime],
  prompt: `You are an expert financial assistant specializing in categorizing transactions.

You will use the transaction details provided to determine the category, amount, date, and description of the transaction. The date should be in ISO format.
If the user mentions a relative date like "today", "yesterday", or "now", use the getCurrentTime tool to get the accurate current date and time to resolve it.

IMPORTANT: You must determine if the transaction is an income (a gain of money) or an expense. Keywords like "salary", "paycheck", "freelance payment", "deposit" usually signify income. Set the isIncome field to true for income transactions.

Transaction Details: {{{transactionDetails}}}
`,
});

const categorizeTransactionFlow = ai.defineFlow(
  {
    name: 'categorizeTransactionFlow',
    inputSchema: CategorizeTransactionInputSchema,
    outputSchema: CategorizeTransactionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
