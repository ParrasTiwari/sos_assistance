
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatMessage } from "./chat-message";
import { ChatBottombar } from "./chat-bottombar";
import { useToast } from "@/hooks/use-toast";
import { Message } from "@/types";
import { GuardianAngelIcon } from "@/components/icons";
import { transcribeAndCategorizeEmergency } from "@/ai/flows/transcribe-and-categorize-emergency";
import { handleSpamResponse } from "@/ai/flows/handle-spam-response";
import { provideOngoingAssistance, OngoingAssistanceInput } from "@/ai/flows/provide-ongoing-assistance";
import { textToSpeech } from "@/ai/flows/text-to-speech";
import { translateText } from "@/ai/flows/translate-text";
import { ShieldCheck } from "lucide-react";

type ConversationState = "idle" | "awaiting_emergency" | "in_assistance" | "awaiting_assistance_confirmation";

const WELCOME_AUDIO_URI = "data:audio/wav;base64,UklGRqYDAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABgAAABkYXRhqIMDAAD//wAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAA-IBAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAAQAAAAEAA-c-v/v/w/w/v/v/w/w/v/v/u/t/r/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/p/-";

export function ChatLayout() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [conversationState, setConversationState] = useState<ConversationState>("idle");
  const { toast } = useToast();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const conversationHistoryRef = useRef<OngoingAssistanceInput['history']>([]);
  const emergencyContextRef = useRef<{ category: 'medical' | 'fire' | 'police'; language: string, eta: number } | null>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = useCallback((message: Omit<Message, "id"> & { id?: string }) => {
    const id = message.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newMessage = { ...message, id };
    setMessages((prev) => [...prev, newMessage]);
    if (newMessage.sender === 'user' || newMessage.sender === 'bot') {
       if (newMessage.transcription) {
         conversationHistoryRef.current.push({role: 'user', content: newMessage.transcription});
       } else if (typeof newMessage.content === 'string' && (newMessage.type === 'text' || newMessage.type === 'action')) {
         conversationHistoryRef.current.push({role: 'model', content: newMessage.content});
       }
    }
    return id;
  }, []);
  
  const updateMessage = useCallback((id: string, updates: Partial<Message>) => {
    setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, ...updates } : msg));
  }, []);
  
  const speakAndAddMessage = useCallback(async (text: string, language: string, type: Message['type'] = 'text', additionalProps: Partial<Message> = {}) => {
    const tempBotMessageId = addMessage({
      sender: 'bot',
      type: 'text',
      content: '...',
      ...additionalProps
    });

    try {
      const { audioDataUri } = await textToSpeech({ text, language });
      updateMessage(tempBotMessageId, { type, content: text, audioDataUri, autoPlayAudio: true, ...additionalProps });
    } catch (error)      {
      console.error("Text-to-speech error:", error);
      updateMessage(tempBotMessageId, { type: 'text', content: text, ...additionalProps }); // Fallback to text
    }
  }, [addMessage, updateMessage]);

  const handleBeginClick = useCallback(() => {
    if (chatStarted) return;
    setChatStarted(true);
    addMessage({
      id: "initial-greeting",
      sender: "bot",
      type: "text",
      content: "How may I help you?",
      audioDataUri: WELCOME_AUDIO_URI,
      autoPlayAudio: true,
    });
    setConversationState("awaiting_emergency");
  }, [chatStarted, addMessage]);

  const askForAssistance = useCallback(async (language: string) => {
    const promptText = "Help is on the way. Do you need any immediate advice while you wait?";
    
    addMessage({
      sender: 'bot',
      type: 'action',
      content: promptText,
      actions: [
        { text: "Yes", onClick: async () => {
          if (!emergencyContextRef.current) return;
          setConversationState("in_assistance");
          const { category, language, eta } = emergencyContextRef.current;
          const processingMsgId = addMessage({ sender: "bot", type: "text", content: "..." });
          try {
            const { response } = await provideOngoingAssistance({
              emergencyType: category,
              language,
              question: "Yes, I need help. Please provide a short, empathetic first-aid or safety tip.",
              history: conversationHistoryRef.current,
              eta,
            });
            updateMessage(processingMsgId, { content: '', audioDataUri: undefined }); // Clear placeholder
            await speakAndAddMessage(response, language);
          } catch (error) {
            console.error("Assistance error:", error);
            updateMessage(processingMsgId, { content: "Sorry, I couldn't get advice. Please remain calm." });
          }
        }},
        { text: "No", onClick: async () => {
          if (!emergencyContextRef.current) return;
          setConversationState("in_assistance"); // Still in assistance mode for ETA updates etc.
          await speakAndAddMessage("Okay, please stay safe. Help is on the way. Let me know if you need anything else.", emergencyContextRef.current.language);
        }},
      ],
    });
    setConversationState("awaiting_assistance_confirmation");
  }, [addMessage, speakAndAddMessage]);

  const startAssistanceFlow = useCallback(async (category: 'medical' | 'fire' | 'police', language: string) => {
    setConversationState("in_assistance");
    const eta = Math.floor(Math.random() * 15) + 5;
    emergencyContextRef.current = { category, language, eta };
    
    const englishMessage = `A ${category} unit has been dispatched. Estimated time of arrival is ${eta} minutes.`;

    try {
      const { translation } = await translateText({ text: englishMessage, language });
      await speakAndAddMessage(translation, language);
    } catch (error) {
      console.error("Translation error:", error);
      // Fallback to English if translation fails
      await speakAndAddMessage(englishMessage, language);
    }
    
    await askForAssistance(language);
  }, [speakAndAddMessage, askForAssistance]);

  const continueAssistanceFlow = useCallback(async (transcription: string) => {
    if (!emergencyContextRef.current) {
        setConversationState('awaiting_emergency');
        return;
    }
    const { category, language } = emergencyContextRef.current;
    
    const processingMsgId = addMessage({ sender: "bot", type: "text", content: "..." });
    try {
      const { response } = await provideOngoingAssistance({
        emergencyType: category,
        language,
        question: transcription,
        history: conversationHistoryRef.current,
      });
      updateMessage(processingMsgId, { content: '', audioDataUri: undefined }); // Clear placeholder
      await speakAndAddMessage(response, language);
    } catch (error) {
       console.error("Assistance error:", error);
       updateMessage(processingMsgId, { content: "I'm having trouble. Please stay safe, help is on the way." });
    }
  }, [addMessage, updateMessage, speakAndAddMessage]);

  const processSpam = useCallback(async (language: string) => {
    setConversationState("idle");
    try {
      const { spamResponseAudio, confirmRealEmergencyPrompt } = await handleSpamResponse({ userLanguage: language });
      addMessage({
        sender: "bot",
        type: "audio",
        audioDataUri: spamResponseAudio,
        content: "Please listen to this important message.",
        autoPlayAudio: true,
      });
      addMessage({
        sender: "bot",
        type: "action",
        content: confirmRealEmergencyPrompt,
        actions: [
          { text: "I have a real emergency", onClick: () => {
              speakAndAddMessage("Please state your emergency.", language);
              setConversationState("awaiting_emergency");
          } },
          { text: "I made a mistake", onClick: async () => {
              await speakAndAddMessage("Thank you for clarifying. Please use this service responsibly.", language);
              setMessages([]);
              setChatStarted(false); // Reset to beginning
          }},
        ],
      });
    } catch (error) {
      console.error("Spam handling error:", error);
      toast({ title: "Error", description: "Could not process spam response.", variant: "destructive" });
    }
  }, [addMessage, speakAndAddMessage, toast]);

  const handleRecordingComplete = useCallback(async (audioDataUri: string) => {
    if (isProcessing || conversationState === 'awaiting_assistance_confirmation') return;

    setIsProcessing(true);
    const userMessageId = addMessage({ 
      sender: "user", 
      type: "audio", 
      content: audioDataUri,
    });

    try {
      const { transcription, language, category } = await transcribeAndCategorizeEmergency({ audioDataUri });
      updateMessage(userMessageId, { transcription, language, category });

      if (conversationState === 'in_assistance') {
        await continueAssistanceFlow(transcription);
      } else { // Awaiting emergency
        switch (category) {
          case "medical":
          case "fire":
          case "police":
            await startAssistanceFlow(category, language);
            break;
          case "spam":
            await processSpam(language);
            break;
          default:
             await speakAndAddMessage("I'm sorry, I didn't understand the category of the emergency. Could you please repeat?", language || 'en-US');
        }
      }
    } catch (error) {
      console.error("Processing error:", error);
      const errorLanguage = emergencyContextRef.current?.language || 'en-US';
      await speakAndAddMessage("I'm sorry, I didn't catch that. Could you please repeat your emergency?", errorLanguage);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, conversationState, addMessage, updateMessage, continueAssistanceFlow, startAssistanceFlow, processSpam, speakAndAddMessage]);
  
  return (
    <Card className="w-full max-w-2xl h-full max-h-[95dvh] flex flex-col shadow-xl">
      <CardHeader className="flex flex-col items-center text-center">
        <GuardianAngelIcon className="h-10 w-10 text-primary" />
        <div className="flex items-center space-x-2">
            <CardTitle className="text-xl md:text-2xl font-headline">
                SOS-Assistance
            </CardTitle>
            <ShieldCheck className="h-6 w-6 text-primary" />
        </div>
        <CardDescription>
          Emergency AI assistant. Get help 24*7
        </CardDescription>
      </CardHeader>
      <CardContent
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
         {isProcessing && (
            <ChatMessage message={{id: 'processing', sender: 'bot', type: 'text', content: "..."}} />
        )}
      </CardContent>
      <ChatBottombar
        onRecordingComplete={handleRecordingComplete}
        isProcessing={isProcessing}
        onBeginClick={handleBeginClick}
        chatStarted={chatStarted}
        disabled={isProcessing || conversationState === 'awaiting_assistance_confirmation'}
      />
    </Card>
  );
}
