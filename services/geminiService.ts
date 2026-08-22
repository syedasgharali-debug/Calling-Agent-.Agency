

export interface LiveCallbacks {
  onopen: () => void;
  onmessage: (message: any) => void;
  onerror: (error: any) => void;
  onclose: () => void;
}

export class GeminiService {
  private getHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...extraHeaders
    };
    try {
      const key = localStorage.getItem('gemini_api_key');
      if (key) {
        headers['x-gemini-api-key'] = key;
      }
    } catch (e) {}
    return headers;
  }

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

  async callGeminiDirectly(
    message: string, 
    history: { role: 'user' | 'model', parts: { text: string }[] }[] = [], 
    systemInstruction?: string,
    apiKey?: string
  ): Promise<string> {
    if (!apiKey) {
      throw new Error("No Gemini API key available for client-side generation.");
    }

    const contents = [...history];
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const formattedContents = contents.map(item => ({
      role: item.role === 'model' ? 'model' : 'user',
      parts: item.parts.map(p => ({ text: p.text }))
    }));

    const body: any = {
      contents: formattedContents
    };

    if (systemInstruction) {
      body.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Gemini REST API failed with status ${response.status}`);
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (candidateText) {
      return candidateText;
    }

    throw new Error("Empty response from Gemini REST API.");
  }

  async getAgentResponse(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = [], systemInstruction?: string) {
    let localKey = '';
    try {
      localKey = localStorage.getItem('gemini_api_key') || '';
    } catch (e) {}

    if (localKey) {
      try {
        console.log("Using custom Gemini API key for direct client-side generation...");
        return await this.callGeminiDirectly(message, history, systemInstruction, localKey);
      } catch (err: any) {
        console.warn("Direct client-side Gemini API call failed, falling back to server proxy...", err);
      }
    }

    try {
      const response = await fetch('/api/demo/chat', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ message, history, systemInstruction })
      });
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }
      const data = await response.json();
      return data.text || "I'm sorry, I couldn't process that request right now.";
    } catch (error) {
      console.error("Gemini Proxy API Error:", error);
      if (!localKey) {
        return "I'm having trouble connecting to my central brain. If you are on a custom domain, please go to the Integrations tab and save your own Gemini API Key to enable instant client-side AI processing!";
      }
      return "I'm having trouble connecting to my central brain. Please check your connection!";
    }
  }

  cleanHtml(rawText: string): string {
    let text = rawText;
    // Strip scripts
    text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
    // Strip styles
    text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
    // Strip head/nav/footer if present to focus on body context
    text = text.replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, "");
    text = text.replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, "");
    
    // Convert some blocks to line breaks
    text = text.replace(/<\/p>|<\/div>|<br\s*\/?>|<\/h[1-6]>/gi, "\n");
    // Strip all remaining tags
    text = text.replace(/<[^>]*>/g, " ");
    // Decode common HTML entities
    text = text
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    
    // Remove excessive empty lines
    text = text.replace(/\n\s*\n+/g, "\n\n").trim();

    // Limit length to keep prompt sizes healthy
    if (text.length > 12000) {
      text = text.slice(0, 12000) + "\n... [Content truncated for optimal AI processing]";
    }
    return text;
  }

  async fetchUrl(url: string): Promise<string> {
    let formattedUrl = url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = "https://" + formattedUrl;
    }

    // Try the local backend API first
    try {
      const response = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ url: formattedUrl })
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.text) {
          return data.text;
        }
      }
    } catch (e) {
      console.warn("Backend fetch-url failed, trying client-side CORS proxy...", e);
    }

    // Fallback: Client-side fetch via reliable public CORS proxies
    const corsProxies = [
      `https://corsproxy.io/?${encodeURIComponent(formattedUrl)}`,
      `https://api.allorigins.win/get?url=${encodeURIComponent(formattedUrl)}`
    ];

    for (const proxyUrl of corsProxies) {
      try {
        const response = await fetch(proxyUrl, {
          signal: AbortSignal.timeout ? AbortSignal.timeout(8000) : undefined
        } as any);
        if (response.ok) {
          if (proxyUrl.includes('allorigins.win')) {
            const data = await response.json();
            if (data && data.contents) {
              return this.cleanHtml(data.contents);
            }
          } else {
            const text = await response.text();
            return this.cleanHtml(text);
          }
        }
      } catch (err) {
        console.warn(`CORS Proxy ${proxyUrl} failed:`, err);
      }
    }

    throw new Error("Failed to fetch page content through both backend and client CORS proxies.");
  }

  async generateSpeech(text: string, voiceName: string = 'Kore') {
    try {
      let elevenlabsKey = '';
      try {
        elevenlabsKey = localStorage.getItem('elevenlabs_api_key') || '';
      } catch (e) {}

      const response = await fetch('/api/demo/tts', {
        method: 'POST',
        headers: this.getHeaders({
          'xi-api-key': elevenlabsKey
        }),
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
      const message = `Analyze the sentiment of this call transcript. Return ONLY one word: Positive, Neutral, or Negative.\n\nTranscript: ${transcript}`;
      const systemInstruction = "Return ONLY Positive, Neutral, or Negative.";
      const res = await this.getAgentResponse(message, [], systemInstruction);
      return res.trim() || "Neutral";
    } catch (error) {
      return "Neutral";
    }
  }

  async summarizeCall(transcript: string) {
    try {
      const message = `Summarize this call transcript in 2-3 bullet points.\n\nTranscript: ${transcript}`;
      const systemInstruction = "You are a professional call analytics assistant. Summarize the text concisely.";
      const res = await this.getAgentResponse(message, [], systemInstruction);
      return res || "No summary available.";
    } catch (error) {
      return "Summary failed.";
    }
  }
}

export const geminiService = new GeminiService();

