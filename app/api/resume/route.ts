import { NextRequest, NextResponse } from "next/server";
import { extractText, getDocumentProxy } from "unpdf";
import { getSession } from "@/lib/auth/auth";
import connectDB from "@/lib/db";
import { UserProfile } from "@/lib/models";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const profile = await UserProfile.findOne({ userId: session.user.id });

    if (!profile) return NextResponse.json({ exists: false });

    return NextResponse.json({
      exists: true,
      fileName: profile.resumeFileName,
      updatedAt: profile.updatedAt,
    });
  } catch (err) {
    console.error("GET /api/resume error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file)
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (file.type !== "application/pdf")
    return NextResponse.json({ error: "PDF only" }, { status: 400 });
  if (file.size > 5 * 1024 * 1024)
    return NextResponse.json({ error: "Max 5MB" }, { status: 400 });

  const buffer = await file.arrayBuffer();
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text: resumeText } = await extractText(pdf, { mergePages: true });

  if (!resumeText) {
    return NextResponse.json(
      {
        error:
          "Could not extract text from PDF. Make sure it's not a scanned image.",
      },
      { status: 400 },
    );
  }

  await connectDB();

  await UserProfile.findOneAndUpdate(
    { userId: session.user.id },
    { resumeText, resumeFileName: file.name },
    { upsert: true, new: true },
  );

  return NextResponse.json({ success: true, fileName: file.name });
}