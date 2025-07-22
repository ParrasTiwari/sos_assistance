"use client";

import { useState, useRef, useCallback } from "react";

type RecordingStatus = "idle" | "permission_pending" | "recording" | "stopped";

export const useAudioRecorder = () => {
  const [status, setStatus] = useState<RecordingStatus>("idle");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    if (status !== "idle") return;
    
    setStatus("permission_pending");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStatus("recording");
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setStatus("stopped");
        stream.getTracks().forEach((track) => track.stop()); // Stop microphone access
      };

      mediaRecorderRef.current.start();
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setStatus("idle");
      throw err;
    }
  }, [status]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && status === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, [status]);

  const reset = useCallback(() => {
    setAudioBlob(null);
    setStatus("idle");
    audioChunksRef.current = [];
  }, []);

  return { status, audioBlob, startRecording, stopRecording, reset };
};
