'use server';

/**
 * This file defines an AI agent that categorizes many transactions at once from a block of text.
 *
 * - bulkCategorizeTransactions: The function that handles the bulk categorization.
 * - BulkCategorizeTransactionsInput: The type for the input data the function expects.
 * - BulkCategorizeTransactionsOutput: The type for the data the function returns.
 */

import { ai } from '@/ai/genkit';
import { getCurrentTime } from '@/ai/tools/time';
import { z } from 'genkit';

const CategorizedTransactionSchema = z.object({
    isIncome: z.boolean().describe('Whether this transaction is an income (gain of money).'),
    category: z.string().describe('The category of the transaction. For income, this could be "Salary", "Freelance", etc.'),
    amount: z.number().describe('The amount of the transaction.'),
    date: z.string().describe('The date of the transaction in ISO format.'),
    description: z.string().describe('A short description of the transaction.'),
});

const BulkCategorizeTransactionsInputSchema = z.object({
  bulkText: z
    .string()
    .describe('A large text blob containing multiple transaction details, potentially from a CSV or user paste.'),
});
export type BulkCategorizeTransactionsInput = z.infer<typeof BulkCategorizeTransactionsInputSchema>;

const BulkCategorizeTransactionsOutputSchema = z.object({
  transactions: z.array(CategorizedTransactionSchema).describe('An array of categorized transactions found in the text.'),
});
export type BulkCategorizeTransactionsOutput = z.infer<typeof BulkCategorizeTransactionsOutputSchema>;


export async function bulkCategorizeTransactions(input: BulkCategorizeTransactionsInput): Promise<BulkCategorizeTransactionsOutput> {
  return bulkCategorizeTransactionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'bulkCategorizeTransactionsPrompt',
  input: { schema: BulkCategorizeTransactionsInputSchema },
  output: { schema: BulkCategorizeTransactionsOutputSchema },
  tools: [getCurrentTime],
  prompt: `You are an expert financial assistant specializing in parsing and categorizing bulk transaction data.

You will be given a single block of text which may contain many transactions. Your task is to analyze this text, identify each individual transaction, and extract its details.

**Key Instructions:**
1.  **Parse Thoroughly**: Go through the entire text and pull out every transaction you can find.
2.  **Ignore Junk**: Discard any lines or text that are clearly not financial transactions (e.g., headers, notes, random text).
3.  **Determine Income vs. Expense**: For each transaction, you MUST determine if it's income (a gain of money) or an expense. Set the \`isIncome\` field accordingly.
4.  **Use Tools for Dates**: If you encounter relative dates like "today" or "yesterday", use the \`getCurrentTime\` tool to resolve the exact date in ISO format.
5.  **Structure the Output**: Return a JSON object containing a single key, "transactions", which is an array of all the identified transaction objects.

**Bulk Transaction Text:**
{{{bulkText}}}
`,
});

const bulkCategorizeTransactionsFlow = ai.defineFlow(
  {
    name: 'bulkCategorizeTransactionsFlow',
    inputSchema: BulkCategorizeTransactionsInputSchema,
    outputSchema: BulkCategorizeTransactionsOutputSchema,
  },
  async input => {
    // A basic check to prevent overly large inputs.
    // Average token length is ~4 chars. Gemini flash has a large context, so 100k chars is a safe-ish limit.
    if (input.bulkText.length > 100000) {
        throw new Error("The provided text is too long. Please shorten it and try again.");
    }
    const { output } = await prompt(input);
    return output!;
  }
);
