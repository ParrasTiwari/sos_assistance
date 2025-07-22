"use server";
/**
 * @fileOverview Converts text to speech using Genkit and Google AI.
 *
 * - textToSpeech - A function that handles the text-to-speech conversion.
 * - TextToSpeechInput - The input type for the textToSpeech function.
 * - TextToSpeechOutput - The return type for the textToSpeech function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";
import wav from "wav";
import { googleAI } from "@genkit-ai/googleai";

const TextToSpeechInputSchema = z.object({
  text: z.string().describe("The text to convert to speech."),
  language: z.string().describe("The language code for the speech (e.g., 'en-US', 'es-ES')."),
});
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

const TextToSpeechOutputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "The generated speech as a WAV audio data URI. Expected format: 'data:audio/wav;base64,<encoded_data>'."
    ),
});
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;

export async function textToSpeech(
  input: TextToSpeechInput
): Promise<TextToSpeechOutput> {
  return textToSpeechFlow(input);
}

const textToSpeechFlow = ai.defineFlow(
  {
    name: "textToSpeechFlow",
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
  },
  async ({ text, language }) => {
    const { media } = await ai.generate({
      model: googleAI.model("gemini-2.5-flash-preview-tts"),
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          languageCode: language,
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: text,
    });

    if (!media) {
      throw new Error("No media returned from TTS model.");
    }
    
    // Convert raw PCM audio data from Gemini to a WAV file format
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    const wavData = await toWav(audioBuffer);

    return {
      audioDataUri: "data:audio/wav;base64," + wavData,
    };
  }
);

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: Buffer[] = [];
    writer.on("error", reject);
    writer.on("data", (chunk: Buffer) => {
      bufs.push(chunk);
    });
    writer.on("end", () => {
      resolve(Buffer.concat(bufs).toString("base64"));
    });

    writer.write(pcmData);
    writer.end();
  });
}
