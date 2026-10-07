import { NextRequest, NextResponse } from "next/server";
import { aiPromptSchema } from "@/lib/validation";

function localPlan(prompt: string) {
  const focus = prompt.toLowerCase().includes("dbms") ? "DBMS" : "your selected subject";
  return {
    title: `${focus} revision plan`,
    summary: "A balanced plan with short concept reviews, practice, recall checks, and one timed assessment.",
    days: [
      "Diagnose weak topics and collect notes, slides, and previous papers.",
      "Review fundamentals, write flashcards, and solve 15 objective questions.",
      "Practice medium problems with explanations and bookmark missed patterns.",
      "Complete one lab or applied task and record blockers.",
      "Take a timed quiz with negative marking enabled.",
      "Revise incorrect answers, create a one-page cheat sheet, and ask for help in the study room.",
      "Run a final mock test and convert weak areas into next-week missions."
    ]
  };
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await request.json()
    : Object.fromEntries((await request.formData()).entries());

  const parsed = aiPromptSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Prompt must be between 10 and 2000 characters." }, { status: 400 });
  }

  return NextResponse.json(localPlan(parsed.data.prompt));
}
