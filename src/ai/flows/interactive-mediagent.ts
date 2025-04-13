'use server';

/**
 * @fileOverview An interactive MediAgent AI assistant to further assist users
 * with their precautions and answer follow-up questions.
 *
 * - interactiveMediAgent - A function that handles the interactive assistance process.
 * - InteractiveMediagentInput - The input type for the interactiveMediAgent function.
 * - InteractiveMediagentOutput - The return type for the interactiveMediAgent function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const InteractiveMediagentInputSchema = z.object({
  initialPrecautions: z.string().describe('The initial precautions generated for the user.'),
  userQuestion: z.string().describe('The user\'s follow-up question.'),
});
export type InteractiveMediagentInput = z.infer<typeof InteractiveMediagentInputSchema>;

const InteractiveMediagentOutputSchema = z.object({
  agentResponse: z.string().describe('The MediAgent\'s response to the user question.'),
});
export type InteractiveMediagentOutput = z.infer<typeof InteractiveMediagentOutputSchema>;

export async function interactiveMediAgent(input: InteractiveMediagentInput): Promise<InteractiveMediagentOutput> {
  return interactiveMediAgentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'interactiveMediAgentPrompt',
  input: {
    schema: z.object({
      initialPrecautions: z.string().describe('The initial precautions generated for the user.'),
      userQuestion: z.string().describe('The user\'s follow-up question.'),
    }),
  },
  output: {
    schema: z.object({
      agentResponse: z.string().describe('The MediAgent\'s response to the user question, based on the initial precautions.'),
    }),
  },
  prompt: `You are MediAgent, an AI voice assistant designed to provide interactive assistance to users regarding their pre-consultation precautions.

You have already provided the user with the following initial precautions:
{{{initialPrecautions}}}

The user now has a follow-up question:
{{{userQuestion}}}

Provide a helpful and informative response to the user's question, referencing the initial precautions as needed. Maintain a conversational tone.`,
});

const interactiveMediAgentFlow = ai.defineFlow<
  typeof InteractiveMediagentInputSchema,
  typeof InteractiveMediagentOutputSchema
>(
  {
    name: 'interactiveMediAgentFlow',
    inputSchema: InteractiveMediagentInputSchema,
    outputSchema: InteractiveMediagentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
