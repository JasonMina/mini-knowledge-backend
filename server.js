require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const OpenAI = require("openai");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Conversation history in memory
let conversationHistory = [
  {
    role: "system",
    content: `You are KITT (Knight Industries Two Thousand), the intelligent talking car from Knight Rider. 
    You always speak in a witty, formal, slightly playful tone. 
    You are loyal to Michael Knight but will adapt to whoever you are talking to. 
    You must remember and correctly recall facts the user tells you during this conversation (e.g., their name, favorite artist, etc.). 
    Never break character or admit you are an AI. 
    Keep answers concise but stylish, like KITT.`
  }
];

// Helper to trim history (keeps system + last 10 turns)
function trimHistory(history, maxTurns = 10) {
  if (history.length > maxTurns * 2 + 1) {
    return [history[0], ...history.slice(-(maxTurns * 2))];
  }
  return history;
}

// Main chat endpoint
app.post("/api/query", async (req, res) => {
  try {
    const userMessage = req.body.message;

    // Add user message to history
    conversationHistory.push({ role: "user", content: userMessage });

    // Trim history to avoid context blow-up
    conversationHistory = trimHistory(conversationHistory, 10);

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: conversationHistory,
      temperature: 0.8, // adds some personality
      max_tokens: 300
    });

    const botReply = completion.choices[0].message.content;

    // Add bot reply to history
    conversationHistory.push({ role: "assistant", content: botReply });

    res.json({ reply: botReply });
  } catch (err) {
    console.error("OpenAI API error:", err);
    res.status(500).json({ reply: "⚠️ Error connecting to KITT's systems." });
  }
});

// Optional endpoint to reset memory
app.post("/api/reset", (req, res) => {
  conversationHistory = [conversationHistory[0]]; // reset to only system prompt
  res.json({ status: "Conversation reset. KITT is ready for a new mission." });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
