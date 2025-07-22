
"use client";

import { cn } from "@/lib/utils";
import { Message } from "@/types";
import { ChatAvatar } from "./chat-avatar";
import { AudioPlayer } from "./audio-player";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isBot = message.sender === "bot";

  const renderAudioPlayer = () => {
    // User audio uses blob URL from `content` which is a data URI
    if (message.sender === 'user' && message.type === 'audio' && message.content) {
      return <AudioPlayer audioUrl={message.content} />;
    }
    // Bot audio uses `audioDataUri`
    if (isBot && message.audioDataUri) {
      return <AudioPlayer audioUrl={message.audioDataUri} autoPlay={message.autoPlayAudio} />;
    }
    return null;
  }

  const renderContent = () => {
    // Handle the "thinking" state
    if (isBot && message.content === '...') {
      return (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <p className="text-sm text-muted-foreground">Thinking...</p>
        </div>
      );
    }
    
    // Always render text content if it exists
    if (typeof message.content === 'string' && message.content) {
       // For user audio, content is a data URL, so we don't render it as text
       if (message.sender === 'user' && message.type === 'audio') {
         return null;
       }
       if (message.content.trim().length > 0) {
        return <p className="whitespace-pre-wrap">{message.content}</p>;
       }
    }
    return null;
  };

  const renderTranscription = () => {
    if (message.sender === 'user' && message.transcription) {
      return (
        <p className="text-xs text-muted-foreground italic mt-1">
          &quot;{message.transcription}&quot;
        </p>
      );
    }
    return null;
  };
  
  const renderActions = () => {
    if (message.type === 'action' && message.actions && message.actions.length > 0) {
      return (
        <div className="flex flex-wrap gap-2 mt-2">
          {message.actions.map((action, index) => (
            <Button key={index} variant="outline" size="sm" onClick={action.onClick}>
              {action.text}
            </Button>
          ))}
        </div>
      );
    }
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3",
        !isBot && "justify-end"
      )}
    >
      {isBot && <ChatAvatar message={message} />}
      <div
        className={cn(
          "max-w-md rounded-lg p-3 flex flex-col gap-1",
          isBot ? "bg-card" : "bg-primary text-primary-foreground"
        )}
      >
        {renderAudioPlayer()}
        {renderContent()}
        {renderTranscription()}
        {renderActions()}
      </div>
      {!isBot && <ChatAvatar message={message} />}
    </div>
  );
}
