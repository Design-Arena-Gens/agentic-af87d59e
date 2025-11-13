function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function toHashtags(keywords, max = 6) {
  const clean = (keywords || "")
    .split(/[,\n]/)
    .map((s) => s.trim().replace(/\s+/g, ""))
    .filter(Boolean);
  const base = ["AI", "Content", "Marketing", "Creator", "Growth", "Tips", "Strategy"]; 
  const pool = Array.from(new Set([...clean, ...base])).slice(0, 24);
  const count = Math.min(max, pool.length);
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map((h) => h.replace(/[^a-z0-9]/gi, "")).filter(Boolean);
}

function softLimit(text, limit) {
  if (!limit || text.length <= limit) return text;
  const truncated = text.slice(0, limit - 1);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + "?";
}

function platformConstraints(platform) {
  switch (platform) {
    case "twitter": return { limit: 240, emojis: true };
    case "instagram": return { limit: 2200, emojis: true };
    case "tiktok": return { limit: 2200, emojis: true };
    case "linkedin": return { limit: 3000, emojis: false };
    case "facebook": return { limit: 63206, emojis: true };
    case "pinterest": return { limit: 500, emojis: false };
    case "youtube": return { limit: 5000, emojis: false };
    case "threads": return { limit: 500, emojis: true };
    default: return { limit: 1000, emojis: false };
  }
}

function addEmojis(text) {
  const emojis = ["?", "??", "??", "??", "??", "??", "??", "?", "??", "???"];
  const spots = ["start", "end"];
  const spot = pick(spots);
  if (spot === "start") return `${pick(emojis)} ${text}`;
  return `${text} ${pick(emojis)}`;
}

export function generateForPlatform({ platform, topic, goal, audience, tone, cta, keywords, includeHashtags }) {
  const constraints = platformConstraints(platform);
  const kws = (keywords || "").split(/[,\n]/).map((k) => k.trim()).filter(Boolean).slice(0, 6);
  const hash = includeHashtags ? toHashtags(keywords, platform === "twitter" ? 4 : 6) : [];

  const base = [
    `${topic}`,
    goal ? `Goal: ${goal}.` : "",
    audience ? `For ${audience}.` : "",
    tone ? `Tone: ${tone}.` : "",
    kws.length ? `Keywords: ${kws.join(", ")}.` : "",
  ].filter(Boolean).join(" \n");

  let text = base + (cta ? `\n\n${cta}.` : "");
  if (constraints.emojis) text = addEmojis(text);
  if (hash.length) text += `\n\n${hash.map((h) => `#${h}`).join(" ")}`;

  text = softLimit(text, constraints.limit);

  return {
    platform,
    text,
    meta: { hashtags: hash, limit: constraints.limit }
  };
}

export function generateAll(input) {
  const { platforms, ...rest } = input;
  const items = platforms.map((platform) => generateForPlatform({ platform, ...rest }));
  return { items };
}
