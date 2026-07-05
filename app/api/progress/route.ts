import { NextResponse } from "next/server";
import { readProgress, writeProgress } from "@/lib/progressStore";
import type { LessonProgress } from "@/lib/progressTypes";

// Progress is runtime data — never prerender this route at build time.
export const dynamic = "force-dynamic";

const LESSON_FIELDS = ["completed", "quizPassed", "taskDone"] as const;
type LessonField = (typeof LESSON_FIELDS)[number];

type UpdateBody =
  | { type: "lesson"; lessonId: string; field: LessonField; value: boolean }
  | { type: "visit"; moduleSlug: string; lessonSlug: string }
  | { type: "time"; seconds: number };

export async function GET() {
  return NextResponse.json(readProgress());
}

export async function POST(request: Request) {
  let body: UpdateBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const progress = readProgress();

  switch (body.type) {
    case "lesson": {
      if (
        typeof body.lessonId !== "string" ||
        !LESSON_FIELDS.includes(body.field)
      ) {
        return NextResponse.json({ error: "invalid lesson update" }, { status: 400 });
      }
      const lesson: LessonProgress = progress.lessons[body.lessonId] ?? {};
      lesson[body.field] = Boolean(body.value);
      if (body.field === "completed") {
        lesson.completedAt = body.value ? new Date().toISOString() : undefined;
      }
      progress.lessons[body.lessonId] = lesson;
      break;
    }
    case "visit": {
      if (
        typeof body.moduleSlug !== "string" ||
        typeof body.lessonSlug !== "string"
      ) {
        return NextResponse.json({ error: "invalid visit" }, { status: 400 });
      }
      progress.lastVisited = {
        moduleSlug: body.moduleSlug,
        lessonSlug: body.lessonSlug,
      };
      break;
    }
    case "time": {
      // Cap a single report to 10 minutes to keep totals sane.
      const seconds = Math.max(0, Math.min(600, Number(body.seconds) || 0));
      progress.totalLearningSeconds += seconds;
      break;
    }
    default:
      return NextResponse.json({ error: "unknown update type" }, { status: 400 });
  }

  writeProgress(progress);
  return NextResponse.json(progress);
}
