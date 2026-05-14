
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";

// Lazy initialization of GoogleGenAI
let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing. AI features will not work.");
    }
    aiInstance = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });
  }
  return aiInstance;
}

export interface LiveCallbacks {
  onopen: () => void;
  onmessage: (message: LiveServerMessage) => void;
  onerror: (error: any) => void;
  onclose: () => void;
}

export class GeminiService {
  async connectLive(systemInstruction: string, callbacks: LiveCallbacks, voiceName: string = 'Zephyr') {
    const ai = getAI();
    return ai.live.connect({
      model: "gemini-3.1-flash-live-preview",
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName } },
        },
        systemInstruction,
        outputAudioTranscription: {},
        inputAudioTranscription: {},
      },
      callbacks,
    });
  }

  async getAgentResponse(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = [], systemInstruction?: string) {
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
            ...history,
            { role: 'user', parts: [{ text: message }] }
        ],
        config: {
          systemInstruction: systemInstruction || "You are CallingAgent, a professional and helpful customer support agent for an AI Call Center platform. You are currently demonstrating your capabilities. Keep your responses concise, friendly, and helpful. You represent a high-tech solution that can handle millions of calls simultaneously.",
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
        },
      });

      return response.text || "I'm sorry, I couldn't process that request right now.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "I'm having trouble connecting to my central brain. Please try again!";
    }
  }

  async generateSpeech(text: string, voiceName: string = 'Kore') {
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        return `data:audio/wav;base64,${base64Audio}`;
      }
      return null;
    } catch (error) {
      console.error("TTS Error:", error);
      return null;
    }
  }

  async analyzeSentiment(transcript: string) {
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: `Analyze the sentiment of this call transcript. Return ONLY one word: Positive, Neutral, or Negative.\n\nTranscript: ${transcript}` }] }],
      });
      return response.text?.trim() || "Neutral";
    } catch (error) {
      return "Neutral";
    }
  }

  async summarizeCall(transcript: string) {
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: `Summarize this call transcript in 2-3 bullet points.\n\nTranscript: ${transcript}` }] }],
      });
      return response.text || "No summary available.";
    } catch (error) {
      return "Summary failed.";
    }
  }
}

export const geminiService = new GeminiService();
