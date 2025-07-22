
export type Message = {
  id: string;
  sender: "user" | "bot";
  type: "audio" | "text" | "action";
  content: string; // URL for user audio blob, text for bot/user text
  transcription?: string;
  language?: string;
  category?: "police" | "medical" | "fire" | "spam";
  audioDataUri?: string; // For bot-generated audio
  autoPlayAudio?: boolean; // To trigger autoplay on the audio player
  actions?: { text: string; onClick: () => void }[];
};
