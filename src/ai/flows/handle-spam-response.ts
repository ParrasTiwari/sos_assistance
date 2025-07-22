// src/ai/flows/handle-spam-response.ts
'use server';

/**
 * @fileOverview Handles the chatbot's response when a user message is detected as spam.
 *
 * - handleSpamResponse - A function that manages the spam response flow.
 * - HandleSpamResponseInput - The input type for the handleSpamResponse function.
 * - HandleSpamResponseOutput - The return type for the handleSpamResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HandleSpamResponseInputSchema = z.object({
  userLanguage: z
    .string()
    .describe('The language of the user who sent the spam message.'),
});
export type HandleSpamResponseInput = z.infer<typeof HandleSpamResponseInputSchema>;

const HandleSpamResponseOutputSchema = z.object({
  spamResponseAudio: z
    .string()
    .describe(
      'An audio data URI containing the spam education message in the user\u0027s language. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
  confirmRealEmergencyPrompt: z
    .string()
    .describe('A prompt asking the user to confirm if they have a real emergency, translated to their language.'),
});
export type HandleSpamResponseOutput = z.infer<typeof HandleSpamResponseOutputSchema>;

export async function handleSpamResponse(input: HandleSpamResponseInput): Promise<HandleSpamResponseOutput> {
  return handleSpamResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'handleSpamResponsePrompt',
  input: {schema: HandleSpamResponseInputSchema},
  output: {schema: HandleSpamResponseOutputSchema},
  prompt: `You are a civic-minded chatbot. Respond in the user's language, which is: {{{userLanguage}}}.

  Your task is to:
  1. Create an audio message (as a data URI) educating the user about the appropriate use of this emergency service and to avoid spamming.
  2. Generate a prompt asking the user to confirm if they have a real emergency.

  Ensure the audio message is polite and informative.
  Ensure the confirmRealEmergencyPrompt is clear and easy to understand.

  Output the audio message in the spamResponseAudio field, and the confirmation prompt in the confirmRealEmergencyPrompt field.
`,
});

const handleSpamResponseFlow = ai.defineFlow(
  {
    name: 'handleSpamResponseFlow',
    inputSchema: HandleSpamResponseInputSchema,
    outputSchema: HandleSpamResponseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

