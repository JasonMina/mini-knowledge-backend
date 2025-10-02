require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { OpenAI } = require("openai");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Query route
app.post("/api/query", async (req, res) => {
  try {
    const userMessage = req.body.message;
    console.log("Frontend said:", userMessage);

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are KITT, the intelligent talking car from Knight Rider. Speak in a witty,         formal, and slightly playful tone. Always refer to Michael Knight occasionally. Keep responses concise but stylish.",
        },
        { role: "user", content: userMessage },
      ],
    });


    const botReply = completion.choices[0].message.content;
    res.json({ reply: botReply });
  } catch (error) {
    console.error("OpenAI error:", error);
    res.status(500).json({ error: "Something went wrong with OpenAI" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
