import Groq from "groq-sdk";

if (!process.env["GROQ_API_KEY"]) {
  throw new Error("GROQ_API_KEY environment variable is required");
}

export const groq = new Groq({
  apiKey: process.env["GROQ_API_KEY"],
});

export const GROQ_MODEL = "llama-3.3-70b-versatile";

export async function callGroq(prompt: string, systemPrompt: string): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 8000,
  });

  return completion.choices[0]?.message?.content ?? "";
}

export async function callGroqJson<T>(prompt: string, systemPrompt: string): Promise<T> {
  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 8000,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  return JSON.parse(raw) as T;
}
