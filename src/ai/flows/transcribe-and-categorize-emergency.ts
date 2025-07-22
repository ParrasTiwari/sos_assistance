'use server';
/**
 * @fileOverview Transcribes audio, detects language, and categorizes emergency type.
 *
 * - transcribeAndCategorizeEmergency - A function that handles the audio transcription,
 *   language detection, and emergency categorization process.
 * - TranscribeAndCategorizeEmergencyInput - The input type for the transcribeAndCategorizeEmergency function.
 * - TranscribeAndCategorizeEmergencyOutput - The return type for the transcribeAndCategorizeEmergency function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranscribeAndCategorizeEmergencyInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "Audio data URI of the user's emergency message.  It must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type TranscribeAndCategorizeEmergencyInput = z.infer<typeof TranscribeAndCategorizeEmergencyInputSchema>;

const TranscribeAndCategorizeEmergencyOutputSchema = z.object({
  transcription: z.string().describe('The transcribed text of the audio message.'),
  language: z.string().describe('The detected language of the audio message.'),
  category: z.enum(['police', 'medical', 'fire', 'spam']).describe('The category of the emergency.'),
});
export type TranscribeAndCategorizeEmergencyOutput = z.infer<typeof TranscribeAndCategorizeEmergencyOutputSchema>;

export async function transcribeAndCategorizeEmergency(
  input: TranscribeAndCategorizeEmergencyInput
): Promise<TranscribeAndCategorizeEmergencyOutput> {
  return transcribeAndCategorizeEmergencyFlow(input);
}

const transcribeAndCategorizeEmergencyPrompt = ai.definePrompt({
  name: 'transcribeAndCategorizeEmergencyPrompt',
  input: {schema: TranscribeAndCategorizeEmergencyInputSchema},
  output: {schema: TranscribeAndCategorizeEmergencyOutputSchema},
  prompt: `You are an emergency response bot. Your task is to transcribe the user's audio message,
  detect the language, and categorize the emergency into one of the following categories: police, medical, fire, or spam.

  Audio: {{media url=audioDataUri}}

  Transcription:
  Language:
  Category:`, // The model will fill these fields in
});

const transcribeAndCategorizeEmergencyFlow = ai.defineFlow(
  {
    name: 'transcribeAndCategorizeEmergencyFlow',
    inputSchema: TranscribeAndCategorizeEmergencyInputSchema,
    outputSchema: TranscribeAndCategorizeEmergencyOutputSchema,
  },
  async input => {
    const {output} = await transcribeAndCategorizeEmergencyPrompt(input);
    return output!;
  }
);
