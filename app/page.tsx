"use client";

import { useState } from "react";

export default function Home() {
  const [topic, setTopic] = useState("Eastern wellness for seniors (Tai Chi, Qigong, Yoga, mindfulness)");
  const [audience, setAudience] = useState("60+ adults, sedentary to lightly active, concerned about pain, sleep, balance");
  const [bookType, setBookType] = useState("Non-fiction guide");
  const [length, setLength] = useState("Long (50k+ words)");
  const [language, setLanguage] = useState("English");

  const [task, setTask] = useState("full_plan");

  const [chapterTitle, setChapterTitle] = useState("Chapter 8: Chair-Based Qigong for Beginners");
  const [chapterOutline, setChapterOutline] = useState(`- Why chair exercises are the best entry point for seniors.
- Routine A: Morning Energy Boost (5–10 mins).
- Routine B: Afternoon Circulation Flow.
- Detailed breakdown of 5 core movements: Waving Hands Like Clouds, Plucking Fruit, Holding the Moon, etc.
Include:
- Step-by-step instructions
- Safety notes
- Simple cues for breath and posture
- Short recap at the end`);

  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!topic.trim() || loading) return;

    setLoading(true);
    setOutput("");

    try {
      const res = await fetch("/api/kdp-full", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task,
          topic,
          audience,
          bookType,
          length,
          language,
          chapterTitle,
          chapterOutline,
        }),
      });
      const data = await res.json();
      setOutput(data.answer || "No output.");
    } catch {
      setOutput("Error calling KDP API.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">KDP Full Generator</h1>

      <div className="grid gap-3 mb-4">
        <input
          className="border rounded-md px-3 py-2 text-black"
          placeholder="Topic / niche"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <input
          className="border rounded-md px-3 py-2 text-black"
          placeholder="Target audience"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
        />

        <div className="grid grid-cols-3 gap-3">
          <select
            className="border rounded-md px-3 py-2 text-black"
            value={bookType}
            onChange={(e) => setBookType(e.target.value)}
          >
            <option>Non-fiction guide</option>
            <option>Workbook / journal</option>
            <option>Short story collection</option>
            <option>Children's book</option>
            <option>Other</option>
          </select>

          <select
            className="border rounded-md px-3 py-2 text-black"
            value={length}
            onChange={(e) => setLength(e.target.value)}
          >
            <option>Short (5k–15k words)</option>
            <option>Medium (20k–40k words)</option>
            <option>Long (50k+ words)</option>
          </select>

          <select
            className="border rounded-md px-3 py-2 text-black"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option>English</option>
            <option>French</option>
            <option>Arabic</option>
            <option>Bilingual (EN/FR)</option>
          </select>
        </div>

        <select
          className="border rounded-md px-3 py-2 text-black"
          value={task}
          onChange={(e) => setTask(e.target.value)}
        >
          <option value="full_plan">Full book plan (title, outline, metadata, design)</option>
          <option value="write_chapter">Write full chapter (from outline)</option>
          <option value="metadata">KDP description, keywords, categories</option>
          <option value="cover_design">Cover & interior design brief (+ image prompts)</option>
        </select>
      </div>

      {task === "write_chapter" && (
        <div className="grid gap-3 mb-4">
          <input
            className="border rounded-md px-3 py-2 text-black"
            placeholder="Chapter title"
            value={chapterTitle}
            onChange={(e) => setChapterTitle(e.target.value)}
          />
          <textarea
            className="border rounded-md px-3 py-2 text-black"
            rows={8}
            placeholder="Chapter outline / key points"
            value={chapterOutline}
            onChange={(e) => setChapterOutline(e.target.value)}
          />
        </div>
      )}

      <button
        onClick={generate}
        disabled={loading || !topic.trim()}
        className="mb-4 px-4 py-2 rounded-md bg-blue-600 text-white disabled:opacity-50"
      >
        Generate
      </button>

      {loading && <div className="mb-4 text-gray-500">Generating…</div>}

      <div className="border rounded-lg p-4 whitespace-pre-wrap text-black bg-gray-50">
        {output || "Your KDP book content will appear here."}
      </div>
    </div>
  );
}
