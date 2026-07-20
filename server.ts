import express from "express";
import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from 'stripe';
import paypal from '@paypal/checkout-server-sdk';
import { GoogleGenAI, Modality } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lazy initialization of GoogleGenAI
let aiInstance: GoogleGenAI | null = null;
function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    aiInstance = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });
  }
  return aiInstance;
}

// Simulated responses database for CallingAgent voice scenarios
function getSimulatedAgentResponse(message: string, systemInstruction: string): string {
  const msg = (message || "").toLowerCase();
  const instruct = (systemInstruction || "").toLowerCase();

  if (instruct.includes("sarah") || instruct.includes("real estate") || instruct.includes("loft")) {
    if (msg.includes("hello") || msg.includes("hi") || msg.includes("assistance")) {
      return "Hello! This is Sarah from CallingAgent Loft Realty. I see you're interested in booking a viewing for our beautiful downtown loft. How can I assist you today?";
    }
    if (msg.includes("saturday") || msg.includes("weekend") || msg.includes("time") || msg.includes("schedule") || msg.includes("book") || msg.includes("viewing")) {
      return "Excellent! I have an opening this Saturday at 2:00 PM for the loft viewing. Would that block work for you, or do you prefer a weekdays slot?";
    }
    if (msg.includes("price") || msg.includes("cost") || msg.includes("million")) {
      return "The downtown loft is currently listed at $1.2 million. It includes top-tier custom brick finishes, 2 custom bedrooms, and gorgeous terrace skylights. Shall we reserve a tour?";
    }
    return "Perfect, I've noted that. I will send a customized calendar invitation to your registered email address shortly. Is there any other detail about the downtown loft I can share?";
  }

  if (instruct.includes("david") || instruct.includes("health") || instruct.includes("medical") || instruct.includes("specialist")) {
    if (msg.includes("insurance") || msg.includes("yes") || msg.includes("have")) {
      return "Wonderful, thank you! I have confirmed your insurance verification is active. Dr. Aris is open next Tuesday at 10:00 AM or Thursday at 2:00 PM. Which premium slot fits your calendar?";
    }
    if (msg.includes("tuesday") || msg.includes("thursday") || msg.includes("date") || msg.includes("appointment")) {
      return "Superb, I've reserved your cardiologist follow-up with Dr. Aris. It's scheduled at our central clinic, Suite 410. Shall I notify you of any pre-appointment requirements?";
    }
    if (msg.includes("no") || msg.includes("don't have")) {
      return "No problem. We can set you up as a self-pay patient, and our office can establish a regular monthly installment plan. Let's find a slot first—would Tuesday at 10:00 AM work?";
    }
    return "Great! I have fully logged your follow-up appointment. Be sure to arrive about 10 minutes early with your photo ID. Let me know if any other support is needed!";
  }

  if (instruct.includes("marco") || instruct.includes("bistro") || instruct.includes("restaurant") || instruct.includes("dinner")) {
    if (msg.includes("allergy") || msg.includes("gluten") || msg.includes("celiac")) {
      return "Ah, yes! At CallingAgent Bistro, we take allergies extremely seriously. We offer a dedicated gluten-free preparation workspace, delicious gluten-free pastas, and crust options. You are in safe hands! How many guests will be in your party?";
    }
    if (msg.includes("reservation") || msg.includes("guest") || msg.includes("seat") || msg.includes("table") || msg.includes("people") || msg.includes("4")) {
      return "Bellissimo! A premium table for 4 guests. What time would you prefer this Saturday? We have delightful open tables at 6:30 PM and 8:30 PM.";
    }
    if (msg.includes("6") || msg.includes("7") || msg.includes("8") || msg.includes("pm") || msg.includes("time")) {
      return "Splendid! I have locked in that time frame for you. We will arrange a cozy table and flag your gluten allergies with the kitchen. Under what name should I secure the booking?";
    }
    return "Fantastic! Your reservation at CallingAgent Bistro is fully confirmed. We're situated at 15 Osteria Way. We look forward to treating you to an exceptional dining experience!";
  }

  if (instruct.includes("logistics") || instruct.includes("tracking") || instruct.includes("shipment") || instruct.includes("international")) {
    if (msg.includes("status") || msg.includes("where") || msg.includes("tracking") || msg.includes("number") || msg.includes("package")) {
      return "Scanning international registry... Yes! Your shipment SG-NY-39049 left the Singapore hub on June 8th. It has cleared customs in New York and is on route for final mile courier delivery this Friday by 5:00 PM.";
    }
    if (msg.includes("delay") || msg.includes("customs") || msg.includes("stuck")) {
      return "No worries, this is standard clearance flow and no custom flags or holds are raised. The package is fully moving. Shall I activate automated SMS updates for you?";
    }
    return "Confirmed! Shipment status SG-NY-39049 has been pinned to high-priority alert. You can check again anytime. Thank you for choosing CallingAgent Logistics!";
  }

  if (instruct.includes("chloe") || instruct.includes("support") || instruct.includes("billing") || instruct.includes("saas")) {
    if (msg.includes("billing") || msg.includes("charge") || msg.includes("invoice") || msg.includes("refund")) {
      return "I can absolutely assist you with your Pro billing. To verify safety logs, could you confirm the corporate email address connected with your active CallingAgent account?";
    }
    if (msg.includes("@") || msg.includes("email") || msg.includes(".com")) {
      return "Got it! I see your invoice of $49 for the Pro subscription plan issued on the first. Would you like me to process a credit refund or assign a new payment method?";
    }
    if (msg.includes("cancel") || msg.includes("stop")) {
      return "I'm sorry to see you go. I can apply an exclusive 50% discount to your account for the next 3 billing cycles if you'd like to continue testing. Shall we apply this now?";
    }
    return "Great! I've updated your billing service logs. Ticket ID is #9842. Our financial branch will email you the full summary. Is there any other SaaS inquiry I can resolve?";
  }

  if (instruct.includes("john") || instruct.includes("finance") || instruct.includes("banking") || instruct.includes("dispute") || instruct.includes("capital")) {
    if (msg.includes("block") || msg.includes("unauthorized") || msg.includes("charge") || msg.includes("dispute")) {
      return "Understood. I have initiated a dispute ticket for the $45.00 transaction and temporarily locked your active debit card. Shall we issue a brand-new secure virtual card to your mobile app right now?";
    }
    if (msg.includes("compromised") || msg.includes("hack") || msg.includes("safe")) {
      return "Rest assured, your core checking and savings remain 100% secure in our bank-grade vault. This was an isolated online card charge. Once we cycle the card token, you will be completely protected. Do you want to do that now?";
    }
    if (msg.includes("balance") || msg.includes("money") || msg.includes("available")) {
      return "Your active checking account holds $4,821.50, and your offline high-yield savings holds $25,000.00. Both are fully secure. Shall I proceed with unlocking the virtual card generator?";
    }
    return "Superb, I have logged the dispute and issued a new virtual card with complete zero-liability protection. The new card token is active in your mobile wallet now! Anything else I can assist you with today?";
  }

  return "Hello! I am your CallingAgent intelligent voice assistant. I am listening live with sub-150ms response speed. How can I guide your request today?";
}

// Mu-law decoding and encoding helpers
function decodeMuLaw(payload: string): string {
  const buffer = Buffer.from(payload, 'base64');
  const pcm = new Int16Array(buffer.length);
  for (let i = 0; i < buffer.length; i++) {
    let byte = buffer[i];
    byte = ~byte;
    const sign = (byte & 0x80) ? -1 : 1;
    const exponent = (byte & 0x70) >> 4;
    const mantissa = byte & 0x0F;
    let sample = (mantissa << 3) + 132;
    sample <<= exponent;
    pcm[i] = sign * (sample - 132);
  }
  return Buffer.from(pcm.buffer).toString('base64');
}

function encodeMuLaw(payload: string): string {
  const buffer = Buffer.from(payload, 'base64');
  const pcm = new Int16Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / 2);
  const muLaw = new Uint8Array(pcm.length);
  for (let i = 0; i < pcm.length; i++) {
    let sample = pcm[i];
    const sign = (sample < 0) ? 0x80 : 0x00;
    if (sample < 0) sample = -sample;
    sample += 132;
    if (sample > 32767) sample = 32767;
    let exponent = 7;
    for (let exp = 0; exp < 7; exp++) {
      if (sample < (256 << (exp + 1))) {
        exponent = exp;
        break;
      }
    }
    const mantissa = (sample >> (exponent + 3)) & 0x0F;
    muLaw[i] = ~(sign | (exponent << 4) | mantissa);
  }
  return Buffer.from(muLaw).toString('base64');
}

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });
  const PORT = 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Stripe Checkout
  app.post("/api/payments/stripe/create-session", async (req, res) => {
    const { amount, currency, stripeSecretKey } = req.body;
    const key = stripeSecretKey || process.env.STRIPE_SECRET_KEY;
    
    if (!key) return res.status(400).json({ error: "Stripe key missing" });
    
    const stripe = new Stripe(key, { apiVersion: '2023-10-16' as any });
    
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: currency || 'usd',
            product_data: { name: 'CallingAgent.agency Credits' },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${req.headers.origin}/dashboard?payment=success`,
        cancel_url: `${req.headers.origin}/dashboard?payment=cancel`,
      });
      res.json({ id: session.id, url: session.url });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // PayPal Order
  app.post("/api/payments/paypal/create-order", async (req, res) => {
    const { amount, clientId, secret } = req.body;
    const cid = clientId || process.env.PAYPAL_CLIENT_ID;
    const sec = secret || process.env.PAYPAL_CLIENT_SECRET;
    
    if (!cid || !sec) return res.status(400).json({ error: "PayPal credentials missing" });
    
    const environment = new paypal.core.SandboxEnvironment(cid, sec);
    const client = new paypal.core.PayPalHttpClient(environment);
    
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: amount.toString()
        }
      }]
    });
    
    try {
      const order = await client.execute(request);
      res.json({ id: order.result.id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Outbound Call API
  app.post("/api/outbound", async (req, res) => {
    const { phoneNumber, agentId, provider, vapiAssistantId, vapiApiKey } = req.body;
    
    if (provider === 'Vapi') {
      try {
        const response = await fetch('https://api.vapi.ai/call/phone', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${vapiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            assistantId: vapiAssistantId,
            phoneNumberId: req.body.vapiPhoneNumberId, // Optional
            customer: {
              number: phoneNumber,
            },
          }),
        });

        let data: any;
        try {
          data = await response.json();
        } catch (e) {
          console.error("Vapi Response Parse Error:", e);
          const text = await response.text();
          console.error("Vapi raw response:", text);
          return res.status(500).json({ error: "Invalid response from Vapi", details: text });
        }
        return res.json(data);
      } catch (error) {
        console.error("Vapi Outbound Error:", error);
        return res.status(500).json({ error: "Failed to initiate Vapi call" });
      }
    }

    // CallingAgent.agency (Twilio) Outbound
    const twilio = (await import('twilio')).default;
    const sid = req.body.twilioSid || process.env.TWILIO_ACCOUNT_SID;
    const token = req.body.twilioToken || process.env.TWILIO_AUTH_TOKEN;
    const from = req.body.twilioNumber || process.env.TWILIO_PHONE_NUMBER;

    if (!sid || !token || !from) {
      return res.status(400).json({ error: "Twilio credentials missing. Please configure them in Integrations." });
    }

    const client = twilio(sid, token);

    try {
      const call = await client.calls.create({
        url: `https://${req.headers.host}/api/voice?agentId=${agentId}`,
        to: phoneNumber,
        from: from,
      });
      res.json({ sid: call.sid });
    } catch (error) {
      console.error("Twilio Outbound Error:", error);
      res.status(500).json({ error: "Failed to initiate Twilio call" });
    }
  });

  // Twilio Voice Webhook
  app.post("/api/voice", (req, res) => {
    const agentId = req.query.agentId || '1';
    res.type('text/xml');
    res.send(`
      <Response>
        <Say>Connecting you to your CallingAgent.agency agent.</Say>
        <Connect>
          <Stream url="wss://${req.headers.host}/streams">
            <Parameter name="agentId" value="${agentId}" />
          </Stream>
        </Connect>
      </Response>
    `);
  });

  // WebSocket handling for Twilio Media Streams
  const streams = new Map<string, WebSocket>();

  wss.on("connection", (ws, req) => {
    console.log("New WebSocket connection", req.url);

    if (req.url === '/frontend-relay') {
      (ws as any).isFrontend = true;
      console.log("Frontend relay connected");
      
      ws.on("message", (message) => {
        try {
          const msgStr = message?.toString().trim();
          if (!msgStr || msgStr === 'undefined' || msgStr === 'null') return;
          
          let data;
          try {
            data = JSON.parse(msgStr);
          } catch (e) {
            return;
          }

          if (data.type === 'AGENT_AUDIO') {
            // Send audio back to Twilio
            const targetStream = streams.get(data.streamSid);
            if (targetStream && targetStream.readyState === WebSocket.OPEN) {
              targetStream.send(JSON.stringify({
                event: 'media',
                streamSid: data.streamSid,
                media: {
                  payload: encodeMuLaw(data.payload)
                }
              }));
            }
          }
        } catch (error) {
          console.error("Relay message error:", error);
        }
      });
      return;
    }

    // Twilio Stream Handling
    let streamSid: string;
    let agentId: string;

    ws.on("message", (message) => {
      try {
        const msgStr = message?.toString().trim();
        if (!msgStr || msgStr === 'undefined' || msgStr === 'null') return;
        
        let data;
        try {
          data = JSON.parse(msgStr);
        } catch (e) {
          return;
        }

        switch (data.event) {
          case "start":
            streamSid = data.start.streamSid;
            agentId = data.start.customParameters?.agentId;
            streams.set(streamSid, ws);
            console.log(`Stream started: ${streamSid} for agent: ${agentId}`);
            
            broadcastToFrontend({
              type: 'CALL_STARTED',
              streamSid,
              agentId
            });
            break;
          case "media":
            broadcastToFrontend({
              type: 'TWILIO_AUDIO',
              payload: decodeMuLaw(data.media.payload),
              streamSid,
              agentId
            });
            break;
          case "stop":
            console.log(`Stream stopped: ${streamSid}`);
            streams.delete(streamSid);
            broadcastToFrontend({ type: 'CALL_ENDED', streamSid, agentId });
            break;
        }
      } catch (error) {
        console.error("Twilio stream message error:", error);
      }
    });

    ws.on("close", () => {
      if (streamSid) streams.delete(streamSid);
      console.log("WebSocket closed");
    });
  });

  // Helper to broadcast to connected frontends
  function broadcastToFrontend(data: any) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN && (client as any).isFrontend) {
        client.send(JSON.stringify(data));
      }
    });
  }

  // Helper to map our preset IDs to real ElevenLabs voice IDs
  function mapToRealElevenLabsVoiceId(voiceId: string): string {
    const mapping: Record<string, string> = {
      'el_rachel': '21m00Tcm4TlvDq8ikWAM',
      'el_drew': '29vD33N1CtxCmqQRPOHJ',
      'el_clyde': '2EiwXgQa2bkXSDBadgTv',
      'el_paul': '5Q0t7uMcgvnag6noC1Yy',
      'el_nicole': 'piTKgcLEGmPEe242C3v0',
      'el_michael': 'flq6Z7Unb4JH8FaiZAXL',
      'el_adam': 'pNInz6obpg7Id37T1IQi',
      'el_antoni': 'ErXwobaYiN019vkySvjV',
      'el_bella': 'EXAVITQu4vr4xnSDxMaL',
      'el_elli': 'MF3mGyEYCl7XYWbV9V6O',
      'el_gigi': 'jBpfuIE2acCO8zHdMsCs',
      'el_giovanni': 'zcAHLhcZORdnv0AYZGPm',
      'el_harry': 'SOYHLrjzK2X1EBg6UrZ6',
      'el_mimi': 'zrHiDhgYpIDee2S4Xf9U',
      'el_serena': 'pMs2g85c0Bv7NIPrZ916',
      'el_glinda': 'z9fAnlkFmt1Frg96ljS6',
      'el_charlie': 'IKne3meq5aSn9XLyUdCD',
      'el_liam': 'TX3800X977c0D63pt9cf',
      'el_priya': 'OdT5FHF6Xz6itX0B26aZ',
      'el_matilda': 'XrExE9yKIg1WjnnlVkGX',
      'el_freya': 'jsCqZswC476cr61q42JA',
      'el_conor': '5Z3266O8Vv8nPl3d1mG9',
      'el_samantha': 'EXAVITQu4vr4xnSDxMaL',
      'el_george': 'JBF2zCBvXqSj9GgwsFdF',
      'el_will': 'bVMe3CgSg77bT6B7S3uA',
      'el_clara': 'pMs2g85c0Bv7NIPrZ916',
      'el_sofia': 'EXAVITQu4vr4xnSDxMaL',
    };
    return mapping[voiceId] || voiceId;
  }

  // Get real ElevenLabs voices
  app.get("/api/elevenlabs/voices", async (req, res) => {
    const apiKey = req.headers['xi-api-key'] || process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ error: "ElevenLabs API Key is required" });
    }
    try {
      const response = await fetch("https://api.elevenlabs.io/v1/voices", {
        headers: { "xi-api-key": apiKey as string }
      });
      if (!response.ok) {
        const errText = await response.text();
        return res.status(response.status).json({ error: "ElevenLabs API error", details: errText });
      }
      const data: any = await response.json();
      const mappedVoices = (data.voices || []).map((v: any) => ({
        id: v.voice_id,
        name: v.name,
        gender: v.labels?.gender || (v.labels?.gender === 'female' ? 'Female' : v.labels?.gender === 'male' ? 'Male' : 'Female'),
        accent: v.labels?.accent || 'American',
        age: v.labels?.age || 'Young',
        category: v.category || 'premade',
        description: v.description || `ElevenLabs ${v.category} voice`,
        engine: 'ElevenLabs',
        previewUrl: v.preview_url
      }));
      res.json({ voices: mappedVoices });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create custom ElevenLabs instant voice clone
  app.post("/api/elevenlabs/clone", async (req, res) => {
    const { name, description, audioBase64 } = req.body;
    const apiKey = req.headers['xi-api-key'] || process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ error: "ElevenLabs API Key is required" });
    }
    if (!name || !audioBase64) {
      return res.status(400).json({ error: "Name and audioBase64 are required" });
    }
    try {
      const formData = new FormData();
      formData.append("name", name);
      if (description) formData.append("description", description);
      
      const audioBuffer = Buffer.from(audioBase64, 'base64');
      const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      formData.append("files", blob, "sample.mp3");
      
      const response = await fetch("https://api.elevenlabs.io/v1/voices/add", {
        method: "POST",
        headers: {
          "xi-api-key": apiKey as string
        },
        body: formData
      });
      if (!response.ok) {
        const errText = await response.text();
        return res.status(response.status).json({ error: "ElevenLabs API error", details: errText });
      }
      const result = await response.json();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Interactive Live Demo Chat Proxy
  app.post("/api/demo/chat", async (req, res) => {
    const { message, history, systemInstruction } = req.body;
    try {
      const ai = getAI();

      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'dummy-key') {
        const fallbackResponse = getSimulatedAgentResponse(message, systemInstruction);
        return res.json({ text: fallbackResponse });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          ...(history || []),
          { role: 'user', parts: [{ text: message }] }
        ],
        config: {
          systemInstruction: systemInstruction || "You are CallingAgent, a professional customer support agent.",
          temperature: 0.7,
        }
      });
      res.json({ text: response.text || "I'm sorry, I couldn't process that request right now." });
    } catch (error: any) {
      console.error("Server /api/demo/chat error:", error);
      const fallbackResponse = getSimulatedAgentResponse(message, systemInstruction);
      res.json({ text: fallbackResponse });
    }
  });

  // Interactive Live Demo TTS Proxy
  app.post("/api/demo/tts", async (req, res) => {
    try {
      const { text, voiceName } = req.body;
      const elevenlabsKey = req.headers['xi-api-key'] || process.env.ELEVENLABS_API_KEY;

      const geminiVoices = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr', 'Aoede'];
      const isElevenLabs = voiceName && !geminiVoices.includes(voiceName);

      // If ElevenLabs API Key is available and it is a custom/ElevenLabs voice, call the ElevenLabs TTS API
      if (elevenlabsKey && isElevenLabs) {
        try {
          const realVoiceId = mapToRealElevenLabsVoiceId(voiceName);
          const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${realVoiceId}`, {
            method: "POST",
            headers: {
              "xi-api-key": elevenlabsKey as string,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              text: text,
              model_id: "eleven_monolingual_v1",
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75
              }
            })
          });
          if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            const base64Audio = Buffer.from(arrayBuffer).toString('base64');
            return res.json({ audio: base64Audio });
          } else {
            const errText = await response.text();
            console.error("ElevenLabs TTS endpoint failure:", errText);
          }
        } catch (elevenErr) {
          console.error("Error communicating with ElevenLabs TTS:", elevenErr);
        }
      }

      // Fallback to Gemini Native Voice TTS
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'dummy-key') {
        return res.json({ audio: null });
      }

      const ai = getAI();
      let selectedVoice = voiceName || 'Aoede';
      const allowedVoices = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Aoede'];
      if (!allowedVoices.includes(selectedVoice)) {
        selectedVoice = 'Aoede';
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: selectedVoice },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      res.json({ audio: base64Audio || null });
    } catch (error: any) {
      console.error("Server /api/demo/tts error:", error);
      res.json({ audio: null });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
