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
  prompt: `You are an expert financial assistant specializing in categorizing transactions.

You will use the transaction details provided to determine the category, amount, and description of the transaction.

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
