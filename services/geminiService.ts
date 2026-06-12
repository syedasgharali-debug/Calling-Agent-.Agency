

export interface LiveCallbacks {
  onopen: () => void;
  onmessage: (message: any) => void;
  onerror: (error: any) => void;
  onclose: () => void;
}

export class GeminiService {
  // Backwards compatibility for Live connect if ever invoked
  async connectLive(systemInstruction: string, callbacks: LiveCallbacks, voiceName: string = 'Zephyr') {
    console.warn("Live WebSocket connection called. Reverting to secure HTTPS endpoint.");
    setTimeout(() => {
      callbacks.onopen();
    }, 100);
    return {
      sendRealtimeInput: (input: any) => {
        console.log("Mock real-time input:", input);
      },
      close: () => {
        callbacks.onclose();
      }
    };
  }

  async getAgentResponse(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = [], systemInstruction?: string) {
    try {
      const response = await fetch('/api/demo/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message, history, systemInstruction })
      });
      const data = await response.json();
      return data.text || "I'm sorry, I couldn't process that request right now.";
    } catch (error) {
      console.error("Gemini Proxy API Error:", error);
      return "I'm having trouble connecting to my central brain. Please check your connection!";
    }
  }

  async generateSpeech(text: string, voiceName: string = 'Kore') {
    try {
      const response = await fetch('/api/demo/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text, voiceName })
      });
      const data = await response.json();
      if (data.audio) {
        return `data:audio/wav;base64,${data.audio}`;
      }
      return null;
    } catch (error) {
      console.error("TTS Proxy Error:", error);
      return null;
    }
  }

  async analyzeSentiment(transcript: string) {
    try {
      const response = await fetch('/api/demo/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Analyze the sentiment of this call transcript. Return ONLY one word: Positive, Neutral, or Negative.\n\nTranscript: ${transcript}`,
          systemInstruction: "Return ONLY Positive, Neutral, or Negative."
        })
      });
      const data = await response.json();
      return data.text?.trim() || "Neutral";
    } catch (error) {
      return "Neutral";
    }
  }

  async summarizeCall(transcript: string) {
    try {
      const response = await fetch('/api/demo/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Summarize this call transcript in 2-3 bullet points.\n\nTranscript: ${transcript}`,
          systemInstruction: "You are a professional call analytics assistant. Summarize the text concisely."
        })
      });
      const data = await response.json();
      return data.text || "No summary available.";
    } catch (error) {
      return "Summary failed.";
    }
  }
}

export const geminiService = new GeminiService();

