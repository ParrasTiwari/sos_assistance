
'use server';
/**
 * @fileOverview Provides ongoing, multi-turn contextual assistance to users waiting for emergency services.
 *
 * - provideOngoingAssistance - A function that offers empathetic advice and answers follow-up questions.
 * - OngoingAssistanceInput - The input type for the provideOngoingAssistance function.
 * - OngoingAssistanceOutput - The return type for the provideOngoingAssistance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Tool to get the latest ETA. In a real app, this would fetch from a live service.
const getLatestEta = ai.defineTool(
  {
    name: 'getLatestEta',
    description: 'Gets the latest estimated time of arrival for the dispatched emergency unit.',
    inputSchema: z.object({}),
    outputSchema: z.number().describe('The ETA in minutes.'),
  },
  async () => {
    // This is a mock implementation.
    return Math.floor(Math.random() * 10) + 2; // Returns a new random ETA
  }
);


const OngoingAssistanceInputSchema = z.object({
  emergencyType: z
    .enum(['police', 'medical', 'fire'])
    .describe('The type of emergency reported by the user.'),
  language: z.string().describe('The language spoken by the user.'),
  question: z.string().describe("The user's latest question or statement."),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).describe('The conversation history so far.'),
  eta: z.number().optional().describe('The initial estimated time of arrival in minutes.')
});
export type OngoingAssistanceInput = z.infer<typeof OngoingAssistanceInputSchema>;

const OngoingAssistanceOutputSchema = z.object({
  response: z.string().describe('Empathetic and helpful response tailored to the situation and language.'),
});
export type OngoingAssistanceOutput = z.infer<typeof OngoingAssistanceOutputSchema>;

export async function provideOngoingAssistance(input: OngoingAssistanceInput): Promise<OngoingAssistanceOutput> {
  return provideOngoingAssistanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'provideOngoingAssistancePrompt',
  input: {schema: OngoingAssistanceInputSchema},
  output: {schema: OngoingAssistanceOutputSchema},
  tools: [getLatestEta],
  prompt: `You are an empathetic and calm AI assistant for an emergency service. Your role is to provide support and assistance to a user who is waiting for help to arrive.

Current situation:
- Emergency Type: {{{emergencyType}}}
- User's Language: {{{language}}}
{{#if eta}}
- Initial ETA: {{{eta}}} minutes.
{{/if}}

Your instructions:
1.  **Always respond in the user's language: {{{language}}}.**
2.  **Be concise and clear.** Keep your responses short and to the point (under 40 words).
3.  **Be empathetic and reassuring.** The user is in a stressful situation.
4.  **Use your tools.** If the user asks for an update on the arrival time, use the 'getLatestEta' tool to provide the most current information.
5.  **Provide helpful tips.** Offer simple, actionable advice relevant to the '{{{emergencyType}}}' emergency. For medical, suggest basic first aid. For fire, suggest safety precautions. For police, advise them to stay safe.
6.  **Maintain context.** Use the conversation history to understand the user's needs and avoid repeating information.

Conversation History:
{{#each history}}
- {{role}}: {{content}}
{{/each}}

User's latest message: "{{{question}}}"

Based on all this information, generate the most helpful and supportive response possible.
`,
});

const provideOngoingAssistanceFlow = ai.defineFlow(
  {
    name: 'provideOngoingAssistanceFlow',
    inputSchema: OngoingAssistanceInputSchema,
    outputSchema: OngoingAssistanceOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("The model did not generate a response.");
    }
    return { response: output.response };
  }
);
