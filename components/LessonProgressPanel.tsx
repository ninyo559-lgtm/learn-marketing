"use client";

import { useEffect, useState } from "react";
import type { LessonProgress } from "@/lib/progressTypes";
import {
  addLearningTime,
  loadProgressWithApiImport,
  updateLastVisited,
  updateLessonProgress,
} from "@/lib/progressStorage";

const HEARTBEAT_SECONDS = 30;

interface Props {
  lessonId: string;
  moduleSlug: string;
  lessonSlug: string;
}

const TOGGLES: { field: "completed" | "quizPassed" | "taskDone"; label: string }[] = [
  { field: "completed", label: "סיימתי את השיעור" },
  { field: "quizPassed", label: "עברתי את המבחן" },
  { field: "taskDone", label: "ביצעתי את המשימה המעשית" },
];

export default function LessonProgressPanel({
  lessonId,
  moduleSlug,
  lessonSlug,
}: Props) {
  const [lesson, setLesson] = useState<LessonProgress | null>(null);
  const [saving, setSaving] = useState(false);

  // Load once on the client, then record visits and visible learning time locally.
  useEffect(() => {
    let cancelled = false;
    let heartbeat: ReturnType<typeof setInterval> | undefined;

    void loadProgressWithApiImport().then((data) => {
      if (cancelled) return;

      setLesson(data.lessons[lessonId] ?? {});
      updateLastVisited(moduleSlug, lessonSlug);
      heartbeat = setInterval(() => {
        if (document.visibilityState === "visible") {
          addLearningTime(HEARTBEAT_SECONDS);
        }
      }, HEARTBEAT_SECONDS * 1000);
    });

    return () => {
      cancelled = true;
      if (heartbeat) clearInterval(heartbeat);
    };
  }, [lessonId, moduleSlug, lessonSlug]);

  function toggle(field: "completed" | "quizPassed" | "taskDone") {
    if (!lesson || saving) return;
    const value = !lesson[field];
    setSaving(true);
    try {
      const data = updateLessonProgress(lessonId, field, value);
      setLesson(data.lessons[lessonId] ?? {});
    } catch {
      // Keep the last successfully loaded state when browser storage is unavailable.
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-8 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-3 font-bold">ההתקדמות שלי בשיעור</h2>
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
        {TOGGLES.map(({ field, label }) => {
          const checked = Boolean(lesson?.[field]);
          return (
            <button
              key={field}
              onClick={() => toggle(field)}
              disabled={lesson === null}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${
                checked
                  ? "border-emerald-600 bg-emerald-50 text-emerald-800 dark:border-emerald-500 dark:bg-emerald-950 dark:text-emerald-300"
                  : "border-zinc-300 text-zinc-600 hover:border-zinc-500 dark:border-zinc-700 dark:text-zinc-300"
              }`}
            >
              <span
                aria-hidden
                className={`flex h-5 w-5 items-center justify-center rounded-full border text-xs ${
                  checked
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-zinc-400"
                }`}
              >
                {checked ? "✓" : ""}
              </span>
              {label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
