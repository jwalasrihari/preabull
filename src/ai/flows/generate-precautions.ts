'use server';
/**
 * @fileOverview Generates personalized precautions for patients before a doctor consultation.
 *
 * - generatePrecautions - A function that generates precautions based on symptoms, doctor type and optional patient reports.
 * - GeneratePrecautionsInput - The input type for the generatePrecautions function.
 * - GeneratePrecautionsOutput - The return type for the generatePrecautions function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GeneratePrecautionsInputSchema = z.object({
  symptoms: z.string().describe('The patient symptoms.'),
  doctorType: z.string().describe('The type of doctor the patient intends to consult.'),
  reportUrl: z.string().optional().describe('Optional URL of the patient\'s previous medical reports.'),
});
export type GeneratePrecautionsInput = z.infer<typeof GeneratePrecautionsInputSchema>;

const GeneratePrecautionsOutputSchema = z.object({
  dietPrecautions: z.string().describe('Dietary precautions to take before the consultation.'),
  sleepPrecautions: z.string().describe('Sleep-related precautions to take before the consultation.'),
  physicalPrecautions: z.string().describe('Physical precautions to take before the consultation.'),
  mentalPrecautions: z.string().describe('Mental precautions to take before the consultation.'),
  thingsToAvoid: z.string().describe('Things to avoid before the consultation.'),
});
export type GeneratePrecautionsOutput = z.infer<typeof GeneratePrecautionsOutputSchema>;

export async function generatePrecautions(input: GeneratePrecautionsInput): Promise<GeneratePrecautionsOutput> {
  return generatePrecautionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePrecautionsPrompt',
  input: {
    schema: z.object({
      symptoms: z.string().describe('The patient symptoms.'),
      doctorType: z.string().describe('The type of doctor the patient intends to consult.'),
      reportUrl: z.string().optional().describe('Optional URL of the patient\'s previous medical reports.'),
    }),
  },
  output: {
    schema: z.object({
      dietPrecautions: z.string().describe('Dietary precautions to take before the consultation.'),
      sleepPrecautions: z.string().describe('Sleep-related precautions to take before the consultation.'),
      physicalPrecautions: z.string().describe('Physical precautions to take before the consultation.'),
      mentalPrecautions: z.string().describe('Mental precautions to take before the consultation.'),
      thingsToAvoid: z.string().describe('Things to avoid before the consultation.'),
    }),
  },
  prompt: `You are an AI assistant designed to provide patients with precautions to take before consulting a doctor.\n\nGiven the patient's symptoms and the type of doctor they are consulting, generate personalized diet, sleep, physical, and mental precautions, as well as a list of things to avoid.\n\nSymptoms: {{{symptoms}}}\nDoctor Type: {{{doctorType}}}
{{#if reportUrl}}
Previous Medical Reports: {{media url=reportUrl}}
Consider the information in the report while generating the precautions.
{{/if}}

Provide the precautions in a clear and concise manner.
`,
});

const generatePrecautionsFlow = ai.defineFlow<
  typeof GeneratePrecautionsInputSchema,
  typeof GeneratePrecautionsOutputSchema
>(
  {
    name: 'generatePrecautionsFlow',
    inputSchema: GeneratePrecautionsInputSchema,
    outputSchema: GeneratePrecautionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
