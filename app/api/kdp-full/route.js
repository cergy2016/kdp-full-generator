import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

const BASE_SYSTEM = `
You are an expert KDP book strategist, ghostwriter, and metadata specialist.
You help independent authors create complete Kindle Direct Publishing books.

You can:
- Propose strong titles and subtitles.
- Create detailed outlines and full chapter drafts.
- Write compelling KDP book descriptions (HTML-ready).
- Suggest 7 keywords and 2–3 categories optimized for discoverability.
- Provide cover concepts and detailed AI image prompts for cover generation.
- Suggest interior layout guidelines (fonts, spacing, headings) for readability.

Always:
- Be specific, practical, and market-aware.
- Optimize for KDP best practices and reader expectations.
- Write in the language requested by the user (default: English).
`;

export async function POST(req) {
  try {
    const {
      task,
      topic,
      audience,
      bookType,
      length,
      language = "English",
      chapterTitle,
      chapterOutline,
    } = await req.json();

    let userPrompt = "";

    if (task === "full_plan") {
      userPrompt = `
Task: Create a FULL KDP BOOK PLAN.

Book Topic/Niche: ${topic}
Target Audience: ${audience}
Book Type: ${bookType}
Target Length: ${length}
Language: ${language}

Deliver the following sections, clearly labeled:

1. TITLE & SUBTITLE
   - Provide 3 strong title + subtitle options.
   - Recommend the best one and explain why.

2. BOOK OUTLINE
   - Detailed table of contents (parts + chapters).
   - For each chapter: 3–6 bullet points describing what it covers.
   - Ensure the outline supports the target length.

3. KDP METADATA
   - Book description in HTML (ready to paste into KDP, with <p>, <b>, <ul>/<li> tags).
   - 7 keywords (comma-separated).
   - 2–3 suggested KDP categories (with paths if possible).

4. COVER & INTERIOR DESIGN BRIEF
   - Cover concept: style, colors, imagery, typography, mood.
   - 2–3 detailed AI image prompts that can be used in Midjourney/DALL·E to generate cover art.
   - Interior design notes: font sizes (especially for seniors if relevant), spacing, heading hierarchy, use of illustrations.

Write everything in ${language}.
`;
    } else if (task === "write_chapter") {
      userPrompt = `
Task: Write a FULL CHAPTER DRAFT.

Book Topic/Niche: ${topic}
Target Audience: ${audience}
Book Type: ${bookType}
Target Length: ${length}
Language: ${language}

Chapter Title: ${chapterTitle}

Chapter Outline / Key Points:
${chapterOutline}

Instructions:
- Write a complete, publication-ready chapter (around 2,000–3,000 words).
- Use clear subheadings that follow the outline.
- Include practical steps, examples, and safety notes where relevant.
- Do NOT mention that you are an AI.
- Keep tone consistent with a supportive, experienced coach/teacher for this audience.
`;
    } else if (task === "metadata") {
      userPrompt = `
Task: Generate KDP METADATA ONLY.

Book Topic/Niche: ${topic}
Target Audience: ${audience}
Book Type: ${bookType}
Target Length: ${length}
Language: ${language}

Deliver:
1. Book description in HTML (ready for KDP, with <p>, <b>, <ul>/<li> tags).
2. 7 keywords (comma-separated).
3. 2–3 suggested KDP categories (with paths if possible).

Write everything in ${language}.
`;
    } else if (task === "cover_design") {
      userPrompt = `
Task: Create a COVER & INTERIOR DESIGN BRIEF.

Book Topic/Niche: ${topic}
Target Audience: ${audience}
Book Type: ${bookType}
Target Length: ${length}
Language: ${language}

Deliver:
1. Cover concept: style, colors, imagery, typography, mood.
2. 2–3 detailed AI image prompts (for Midjourney/DALL·E) to generate cover art.
3. Interior design notes: font sizes, spacing, heading hierarchy, use of illustrations, special considerations for the audience (e.g. seniors).

Write everything in ${language}.
`;
    }

    const res = await client.chat.completions.create({
      model: "qwen/qwen3.8-27b",
      messages: [
        { role: "system", content: BASE_SYSTEM },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    });

    const answer = res.choices[0].message.content;
    return NextResponse.json({ answer });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Error generating KDP content" },
      { status: 500 }
    );
  }
}
