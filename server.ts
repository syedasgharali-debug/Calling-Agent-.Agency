import express from "express";
import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from 'stripe';
import paypal from '@paypal/checkout-server-sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        const data = await response.json();
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
        const data = JSON.parse(message.toString());
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
      });
      return;
    }

    // Twilio Stream Handling
    let streamSid: string;
    let agentId: string;

    ws.on("message", (message) => {
      const data = JSON.parse(message.toString());

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
