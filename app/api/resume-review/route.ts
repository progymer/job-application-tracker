import { getSession } from "@/lib/auth/auth";
import connectDB from "@/lib/db";
import userProfile from "@/lib/models/user-profile";
import { rateLimit } from "@/lib/rate-limit";
import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });


export async function POST(req: NextRequest) {
  try {
    // 1. get session, return 401 if not authed
    const session = await getSession();

    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // check rate limit
    const { allowed, remaining } = rateLimit(session.user.id);

    if (!allowed) {
      return NextResponse.json(
        {
          error: "Too many requests. You can review up to 5 resumes per day.",
        },
        { status: 429 },
      );
    }

    // 2. parse req.json() to get job details

    const job = await req.json();

    // 3. fetch UserProfile from MongoDB to get resumeText
    //    if no resumeText return 400 "No resume uploaded"

    await connectDB();

    const profile = await userProfile.findOne({ userId: session.user.id });

    if (!profile?.resumeText)
      return NextResponse.json(
        { error: "No resume uploaded" },
        { status: 400 },
      );

    const SYSTEM_PROMPT = `
        You are an expert resume reviewer and career coach.

        Analyze the resume below against the job details and return a JSON object only. No markdown, no backticks, no explanation — just raw JSON.

        JOB DETAILS:
        - Position: ${job.position}
        - Company: ${job.company}
        - Location: ${job.location || "Not specified"}
        - Salary: ${job.salary || "Not specified"}
        - Tags/Skills: ${job.tags?.join(", ") || "Not specified"}
        - Description: ${job.description || "Not specified"}

        RESUME:
        ${profile.resumeText}

        Return this exact JSON shape:
        {
        "matchScore": number between 0 and 100,
        "summary": "2-3 sentence overall assessment",
        "strengths": ["strength 1", "strength 2"],
        "gaps": ["gap 1", "gap 2"],
        "suggestions": [
            { "area": "Skills section", "fix": "specific actionable advice" }
        ],
        "matchedKeywords": ["keyword1", "keyword2"],
        "missingKeywords": ["keyword1", "keyword2"]
        }`;

    // 4. call Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: SYSTEM_PROMPT,
    });

    // 5. get the text back
    const text = response.text;
    const clean = text?.replace(/```json|```/g, "").trim();

    if (!clean) {
      return NextResponse.json(
        { error: "Empty response from AI" },
        { status: 500 },
      );
    }

    const feedback = JSON.parse(clean);
    return NextResponse.json({ ...feedback, remaining });

    // 6. JSON.parse(text) and return it
  } catch (err) {
    console.error("review-resume error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

