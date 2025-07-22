# **App Name**: Guardian Angel

## Core Features:

- Greeting Audio: Initial greeting with an audio message: 'How may I help you!' (audio saved for future use).
- Audio Interface: Audio recording and playback: Users can record their emergency message and play back previous audio interactions within the chatbot interface. Recording button should always be visible.
- Emergency Analysis: Automatic transcription and categorization: Transcribe user's audio message, identify the language, and categorize the emergency as police, medical, fire, or spam.
- Spam Handling: Spam response: If spam is detected, play a pre-recorded audio message educating the user about appropriate usage. Then ask the user to confirm a real emergency. Respond in the user's language.
- Real-time Assistance: Location services and ETA calculation: Based on the emergency type (police, medical, fire) tool to find the nearest relevant station/hospital and estimate the arrival time using user-provided location or browser geolocation.
- ETA Updates: Inform the user help is on the way, displaying language-localized messages and provide estimated time to arrival of assistance. ETA updates should only be triggered if requested by user. Present updates audibly, in user's language.
- Agentic Assistant: Contextual emergency assistance: If requested, the bot uses a tool to offers brief, empathetic advice (under 40 words, under 10 second audio) based on the emergency and user's language, without redirecting them to other services.

## Style Guidelines:

- Primary color: Khaki (#F0E68C), for a familiar, official feel. Based on the brownish-yellow color (popularly known as KHAKI) suggested by the user.
- Background color: Light beige (#F5F5DC), a desaturated version of khaki to create a neutral backdrop.
- Accent color: Light gold (#E6BE8A), an analogous color to khaki with increased brightness for highlighting interactive elements.
- Body and headline font: 'Inter' sans-serif for clean readability in a chatbot interface.
- Simple, clear icons for primary functions (record, play, location sharing).
- Chatbot layout with visible record button and message history.
- Subtle animations on button presses and loading indicators.