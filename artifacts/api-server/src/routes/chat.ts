import { Router } from "express";
import { callGroq } from "../lib/groq.js";
import { SendChatMessageBody } from "@workspace/api-zod";

const router = Router();

// POST /api/chat/message
router.post("/message", async (req, res) => {
  const parsed = SendChatMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { message, context } = parsed.data;

  const systemPrompt = `You are a knowledgeable, honest career advisor for teenagers and young adults. You give direct, practical, personalized advice without being preachy or overly motivational. You draw on real labor market data, education options, and career paths worldwide.

Guidelines:
- Be direct and specific, not vague
- Give real options with pros and cons
- Mention specific resources, platforms, or programs when relevant
- Don't sugarcoat difficult realities (like competitive fields or AI risk)
- Keep responses focused and actionable — usually 2-4 paragraphs max
- Do not use generic motivational phrases
${context ? `\nContext about this user from their career analysis: ${context}` : ""}`;

  try {
    const reply = await callGroq(message, systemPrompt);
    res.json({ reply });
  } catch (err) {
    console.error({ err }, "Chat message failed");
    res.status(500).json({ error: "Failed to get AI response. Please try again." });
  }
});

export default router;
