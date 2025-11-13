"use client";
import { useMemo, useState } from "react";

const ALL_PLATFORMS = [
  { id: "youtube", label: "YouTube" },
  { id: "facebook", label: "Facebook" },
  { id: "pinterest", label: "Pinterest" },
  { id: "twitter", label: "Twitter/X" },
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "threads", label: "Threads" }
];

function PlatformSelector({ selected, onToggle }) {
  return (
    <div className="checkbox-grid">
      {ALL_PLATFORMS.map((p) => (
        <label key={p.id} className="checkbox">
          <input
            type="checkbox"
            checked={selected.includes(p.id)}
            onChange={() => onToggle(p.id)}
          />
          <span>{p.label}</span>
        </label>
      ))}
    </div>
  );
}

function useClipboard() {
  const [copied, setCopied] = useState("");
  const copy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 1200);
    } catch {}
  };
  return { copied, copy };
}

function buildShareUrl(platform, text) {
  const enc = encodeURIComponent(text);
  switch (platform) {
    case "twitter":
      return `https://twitter.com/intent/tweet?text=${enc}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?quote=${enc}`;
    case "linkedin":
      return `https://www.linkedin.com/shareArticle?mini=true&summary=${enc}`;
    default:
      return null;
  }
}

export default function Page() {
  const [selectedPlatforms, setSelectedPlatforms] = useState(["twitter", "facebook", "instagram"]);
  const [topic, setTopic] = useState("");
  const [goal, setGoal] = useState("Drive awareness and engagement");
  const [audience, setAudience] = useState("Creators and small businesses");
  const [tone, setTone] = useState("friendly, expert, concise");
  const [hashtags, setHashtags] = useState(true);
  const [cta, setCta] = useState("Try it now");
  const [keywords, setKeywords] = useState("AI, automation, content strategy");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const { copied, copy } = useClipboard();

  const canGenerate = useMemo(() => selectedPlatforms.length > 0 && (topic.trim().length > 0), [selectedPlatforms, topic]);

  const togglePlatform = (id) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  async function onGenerate() {
    if (!canGenerate) return;
    setLoading(true);
    setResults([]);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platforms: selectedPlatforms,
          topic,
          goal,
          audience,
          tone,
          hashtags,
          cta,
          keywords
        })
      });
      if (!res.ok) throw new Error("Failed to generate");
      const data = await res.json();
      setResults(data.items || []);
    } catch (e) {
      setResults([]);
      alert("Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function download(kind) {
    if (!results.length) return;
    if (kind === "json") {
      const blob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "agent-content.json";
      a.click();
      URL.revokeObjectURL(url);
    } else if (kind === "csv") {
      const header = ["platform", "text"].join(",");
      const rows = results.map((r) => [r.platform, r.text.replaceAll("\n", " ").replaceAll('"','""')]).map((cols) => `"${cols[0]}","${cols[1]}"`);
      const blob = new Blob([header + "\n" + rows.join("\n")], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "agent-content.csv";
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  return (
    <div className="container">
      <header className="header">
        <div className="title">Social AI Agent</div>
        <span className="badge">Multi-platform</span>
      </header>

      <div className="grid" style={{ marginTop: 16 }}>
        <div className="card">
          <h3>Platforms</h3>
          <p className="hint">Choose where to publish</p>
          <PlatformSelector selected={selectedPlatforms} onToggle={togglePlatform} />
        </div>

        <div className="card">
          <h3>Guidance</h3>
          <p className="hint">Audience, tone, and objectives</p>
          <div className="row" style={{ marginTop: 8 }}>
            <div>
              <label>Audience</label>
              <input type="text" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="Who are we speaking to?" />
            </div>
            <div>
              <label>Tone</label>
              <input type="text" value={tone} onChange={(e) => setTone(e.target.value)} placeholder="e.g., friendly, expert, concise" />
            </div>
          </div>
          <div className="row" style={{ marginTop: 8 }}>
            <div>
              <label>Goal</label>
              <input type="text" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="What should this content achieve?" />
            </div>
            <div>
              <label>Call-to-Action</label>
              <input type="text" value={cta} onChange={(e) => setCta(e.target.value)} placeholder="What should readers do?" />
            </div>
          </div>
          <div className="row" style={{ marginTop: 8 }}>
            <div>
              <label>Keywords</label>
              <input type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="Comma-separated keywords" />
            </div>
            <div>
              <label>Hashtags</label>
              <select value={hashtags ? "yes" : "no"} onChange={(e) => setHashtags(e.target.value === "yes") }>
                <option value="yes">Include</option>
                <option value="no">Exclude</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card" style={{ gridColumn: "1 / -1" }}>
          <h3>Topic</h3>
          <p className="hint">Describe the product, idea, or post subject</p>
          <textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Describe the topic to create content for..." />
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button className="btn" onClick={onGenerate} disabled={!canGenerate || loading}>
              {loading ? "Generating..." : "Generate content"}
            </button>
            <button className="btn secondary" onClick={() => download("csv")} disabled={!results.length}>Download CSV</button>
            <button className="btn secondary" onClick={() => download("json")} disabled={!results.length}>Download JSON</button>
          </div>
        </div>

        <div className="card" style={{ gridColumn: "1 / -1" }}>
          <h3>Results</h3>
          <p className="hint">Copy, refine, and publish per platform</p>
          <div className="results" style={{ marginTop: 10 }}>
            {results.length === 0 && <div className="small">No content yet. Generate above.</div>}
            {results.map((r) => {
              const shareUrl = buildShareUrl(r.platform, r.text);
              return (
                <div key={r.platform} className="result-card">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <strong style={{ textTransform: "capitalize" }}>{r.platform}</strong>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn secondary" onClick={() => copy(r.text, r.platform)}>
                        {copied === r.platform ? "Copied" : "Copy"}
                      </button>
                      {shareUrl && (
                        <a className="btn secondary" href={shareUrl} target="_blank" rel="noreferrer">
                          Open Compose
                        </a>
                      )}
                    </div>
                  </div>
                  <pre style={{ whiteSpace: "pre-wrap", margin: 8 }}>{r.text}</pre>
                  {r.meta?.hashtags?.length ? (
                    <div className="small">Hashtags: {r.meta.hashtags.map((h) => `#${h}`).join(" ")}</div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <footer>
        Tip: Press <span className="kbd">Ctrl</span> + <span className="kbd">C</span> after copying to paste directly into your platform composer.
      </footer>
    </div>
  );
}
