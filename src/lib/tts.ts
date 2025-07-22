"use client";

// This file is no longer used for primary TTS but is kept as a fallback or for other potential uses.
// The main TTS logic is now handled by the `text-to-speech` Genkit flow.

export const speak = (text: string, lang: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      console.warn("Speech synthesis not supported.");
      return resolve(); // Resolve silently if not supported
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    
    // A small delay can help in some browsers
    setTimeout(() => {
      utterance.onend = () => resolve();
      utterance.onerror = (event) => {
        // "not-allowed" is a common browser restriction on autoplaying audio.
        // We can warn about it but don't need to reject the promise for this specific case.
        if (event.error === 'not-allowed') {
          console.warn(`Speech synthesis not allowed by the browser. User interaction is likely required first.`);
          resolve();
        } else {
          console.error("SpeechSynthesis Error", event.error);
          reject(event.error);
        }
      };
      window.speechSynthesis.speak(utterance);
    }, 100);
  });
};
