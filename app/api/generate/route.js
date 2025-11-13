import { NextResponse } from "next/server";
import { generateAll } from "@/lib/generate";

async function tryOpenAI(payload) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return null;

    const system = `You generate concise, high-performing social media copy across YouTube, Facebook, Pinterest, Twitter/X, Instagram, TikTok, LinkedIn, Threads. Always return JSON with {items:[{platform,text,meta:{hashtags:[]}}]}.`;

    const user = {
      role: "user",
      content: [
        { type: "text", text: `Platforms: ${payload.platforms.join(", ")}` },
        { type: "text", text: `Topic: ${payload.topic}` },
        { type: "text", text: `Goal: ${payload.goal}` },
        { type: "text", text: `Audience: ${payload.audience}` },
        { type: "text", text: `Tone: ${payload.tone}` },
        { type: "text", text: `Include hashtags: ${payload.hashtags}` },
        { type: "text", text: `CTA: ${payload.cta}` },
        { type: "text", text: `Keywords: ${payload.keywords}` }
      ]
    };

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          user
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    if (!resp.ok) return null;
    const json = await resp.json();
    const content = json?.choices?.[0]?.message?.content;
    if (!content) return null;
    const parsed = JSON.parse(content);
    if (!parsed?.items) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function POST(req) {
  try {
    const payload = await req.json();

    // Validate minimal input
    const platforms = Array.isArray(payload.platforms) && payload.platforms.length ? payload.platforms : [];
    const topic = (payload.topic || "").toString().slice(0, 4000);
    if (!platforms.length || !topic) {
      return NextResponse.json({ error: "Missing platforms or topic" }, { status: 400 });
    }

    const input = {
      platforms,
      topic,
      goal: (payload.goal || "").toString().slice(0, 400),
      audience: (payload.audience || "").toString().slice(0, 200),
      tone: (payload.tone || "").toString().slice(0, 120),
      cta: (payload.cta || "").toString().slice(0, 160),
      keywords: (payload.keywords || "").toString().slice(0, 400),
      includeHashtags: !!payload.hashtags
    };

    // Try OpenAI first if available, else fallback
    const ai = await tryOpenAI(input);
    const result = ai || generateAll(input);

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
