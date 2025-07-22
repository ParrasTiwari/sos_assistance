
"use client";

import { Mic, Loader2, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { blobToBase64 } from "@/lib/audio-utils";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface ChatBottombarProps {
  onRecordingComplete: (audioDataUri: string) => void;
  isProcessing: boolean;
  chatStarted: boolean;
  onBeginClick: () => void;
  disabled?: boolean;
}

export function ChatBottombar({
  onRecordingComplete,
  isProcessing,
  chatStarted,
  onBeginClick,
  disabled = false,
}: ChatBottombarProps) {
  const { status, audioBlob, startRecording, stopRecording, reset } = useAudioRecorder();
  const { toast } = useToast();

  useEffect(() => {
    if (status === "stopped" && audioBlob) {
      blobToBase64(audioBlob)
        .then(onRecordingComplete)
        .catch((error) => {
            console.error("Error converting blob to base64:", error);
            toast({
                title: "Error",
                description: "Failed to process audio. Please try again.",
                variant: "destructive",
            });
        })
        .finally(reset);
    }
  }, [status, audioBlob, onRecordingComplete, reset, toast]);

  if (!chatStarted) {
    return (
      <div className="p-4 flex items-center justify-center w-full">
        <Button
          size="lg"
          className="h-16 w-48 text-xl rounded-lg shadow-lg transition-transform duration-200 ease-in-out hover:scale-105 active:scale-100"
          onClick={onBeginClick}
        >
          Begin
        </Button>
      </div>
    );
  }

  const handleRecord = () => {
    if (status === "recording") {
      stopRecording();
    } else {
      startRecording().catch(() => {
        toast({
            title: "Microphone Error",
            description: "Could not access microphone. Please check your browser permissions.",
            variant: "destructive",
        });
      });
    }
  };

  const isRecording = status === "recording";
  const isPermissionPending = status === "permission_pending";
  const isDisabled = isProcessing || isPermissionPending || disabled;

  const getButtonIcon = () => {
    if (isProcessing || isPermissionPending) {
      return <Loader2 className="h-6 w-6 animate-spin" />;
    }
    if (isRecording) {
      return <StopCircle className="h-6 w-6 text-red-500" />;
    }
    return <Mic className="h-6 w-6" />;
  };

  const getButtonTooltip = () => {
    if (disabled) return "Please wait for a response.";
    if (isProcessing) return "Processing...";
    if (isPermissionPending) return "Awaiting permission...";
    if (isRecording) return "Stop recording";
    return "Start recording";
  };

  return (
    <div className="p-4 flex items-center w-full">
      <div className="flex-1" />
      <Button
        size="icon"
        className="h-16 w-16 rounded-full shadow-lg transition-transform duration-200 ease-in-out hover:scale-110 active:scale-100"
        onClick={handleRecord}
        disabled={isDisabled}
        aria-label={getButtonTooltip()}
        title={getButtonTooltip()}
      >
        {getButtonIcon()}
      </Button>
       <div className="flex-1" />
    </div>
  );
}
