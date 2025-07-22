// src/ai/flows/provide-contextual-assistance.ts
'use server';

/**
 * @fileOverview Provides contextual assistance to users waiting for emergency services.
 *
 * - provideContextualAssistance - A function that offers empathetic advice based on the user's emergency and language.
 * - ProvideContextualAssistanceInput - The input type for the provideContextualAssistance function.
 * - ProvideContextualAssistanceOutput - The return type for the provideContextualAssistance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvideContextualAssistanceInputSchema = z.object({
  emergencyType: z
    .enum(['police', 'medical', 'fire'])
    .describe('The type of emergency reported by the user.'),
  language: z.string().describe('The language spoken by the user.'),
});
export type ProvideContextualAssistanceInput = z.infer<typeof ProvideContextualAssistanceInputSchema>;

const ProvideContextualAssistanceOutputSchema = z.object({
  advice: z.string().describe('Short, empathetic advice tailored to the emergency and language.'),
});
export type ProvideContextualAssistanceOutput = z.infer<typeof ProvideContextualAssistanceOutputSchema>;

export async function provideContextualAssistance(input: ProvideContextualAssistanceInput): Promise<ProvideContextualAssistanceOutput> {
  return provideContextualAssistanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'provideContextualAssistancePrompt',
  input: {schema: ProvideContextualAssistanceInputSchema},
  output: {schema: ProvideContextualAssistanceOutputSchema},
  prompt: `You are an empathetic AI assistant providing support to users during emergencies.

  Based on the type of emergency ({{{emergencyType}}}) and the user's language ({{{language}}}), offer a brief (under 40 words), helpful tip or words of encouragement. Do not redirect them to other services or suggest they call anyone else.
  Respond in the user's language.
  Make sure to be concise. Focus on actionable advice or emotional support.
  Make sure the advice provided is relevant to the emergency type.
  `,
});

const provideContextualAssistanceFlow = ai.defineFlow(
  {
    name: 'provideContextualAssistanceFlow',
    inputSchema: ProvideContextualAssistanceInputSchema,
    outputSchema: ProvideContextualAssistanceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
