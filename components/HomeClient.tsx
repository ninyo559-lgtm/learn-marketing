"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Module } from "@/lib/curriculum";
import { emptyProgress, type ProgressData } from "@/lib/progressTypes";

interface Props {
  modules: Module[];
}

function formatLearningTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.round((totalSeconds % 3600) / 60);
  if (hours === 0) return `${minutes} דק׳`;
  return `${hours} שע׳ ${minutes} דק׳`;
}

export default function HomeClient({ modules }: Props) {
  const [progress, setProgress] = useState<ProgressData | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/progress")
      .then((res) => res.json())
      .then((data: ProgressData) => {
        if (!cancelled) setProgress(data);
      })
      .catch(() => {
        if (!cancelled) setProgress(emptyProgress());
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const allLessons = useMemo(
    () =>
      modules.flatMap((m) =>
        m.lessons.map((l) => ({ ...l, moduleSlug: m.slug }))
      ),
    [modules]
  );

  const stats = useMemo(() => {
    const p = progress ?? emptyProgress();
    const completed = allLessons.filter((l) => p.lessons[l.id]?.completed);
    const quizzes = allLessons.filter((l) => p.lessons[l.id]?.quizPassed).length;
    const tasks = allLessons.filter((l) => p.lessons[l.id]?.taskDone).length;
    const percent = Math.round((completed.length / allLessons.length) * 100);

    // "Continue" target: last visited lesson, otherwise first uncompleted one.
    const lastVisited =
      p.lastVisited &&
      allLessons.find(
        (l) =>
          l.moduleSlug === p.lastVisited!.moduleSlug &&
          l.slug === p.lastVisited!.lessonSlug
      );
    const firstUncompleted = allLessons.find((l) => !p.lessons[l.id]?.completed);
    const continueTarget = lastVisited ?? firstUncompleted ?? allLessons[0];

    return {
      completedCount: completed.length,
      quizzes,
      tasks,
      percent,
      time: formatLearningTime(p.totalLearningSeconds),
      continueTarget,
    };
  }, [progress, allLessons]);

  const loaded = progress !== null;

  return (
    <>
      {/* Progress dashboard */}
      <section className="mb-10 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">ההתקדמות שלי</h2>
          <span className="text-2xl font-bold tabular-nums">
            {loaded ? `${stats.percent}%` : "—"}
          </span>
        </div>

        <div
          className="h-3 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"
          role="progressbar"
          aria-valuenow={stats.percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${loaded ? stats.percent : 0}%` }}
          />
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div className="rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800/60">
            <dt className="text-zinc-500 dark:text-zinc-400">שיעורים שהושלמו</dt>
            <dd className="text-lg font-bold tabular-nums">
              {loaded ? `${stats.completedCount}/${allLessons.length}` : "—"}
            </dd>
          </div>
          <div className="rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800/60">
            <dt className="text-zinc-500 dark:text-zinc-400">מבחנים שעברתי</dt>
            <dd className="text-lg font-bold tabular-nums">
              {loaded ? stats.quizzes : "—"}
            </dd>
          </div>
          <div className="rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800/60">
            <dt className="text-zinc-500 dark:text-zinc-400">משימות שבוצעו</dt>
            <dd className="text-lg font-bold tabular-nums">
              {loaded ? stats.tasks : "—"}
            </dd>
          </div>
          <div className="rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800/60">
            <dt className="text-zinc-500 dark:text-zinc-400">זמן למידה</dt>
            <dd className="text-lg font-bold tabular-nums">
              {loaded ? stats.time : "—"}
            </dd>
          </div>
        </dl>

        {loaded && stats.continueTarget && (
          <Link
            href={`/lessons/${stats.continueTarget.moduleSlug}/${stats.continueTarget.slug}`}
            className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 font-medium text-white transition-opacity hover:opacity-90 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {stats.completedCount > 0 || progress?.lastVisited
              ? "המשך מאיפה שהפסקתי"
              : "התחל ללמוד"}
            <span aria-hidden>←</span>
          </Link>
        )}
      </section>

      {/* Curriculum map */}
      <section className="flex flex-col gap-6">
        {modules.map((module, i) => {
          const done = module.lessons.filter(
            (l) => progress?.lessons[l.id]?.completed
          ).length;
          return (
            <div
              key={module.id}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="mb-1 flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                  {i + 1}
                </span>
                <h2 className="text-xl font-bold">{module.title}</h2>
                <span className="mr-auto shrink-0 text-sm tabular-nums text-zinc-400 dark:text-zinc-500">
                  {loaded ? `${done}/${module.lessons.length}` : ""}
                </span>
              </div>
              <p className="mb-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {module.description}
              </p>
              {module.changesFrequently && (
                <p className="mb-3 text-xs text-amber-700 dark:text-amber-400">
                  ⚠️ נושא משתנה תדיר
                </p>
              )}

              <ol className="mt-3 flex flex-col gap-1.5">
                {module.lessons.map((lesson, j) => {
                  const completed = Boolean(
                    progress?.lessons[lesson.id]?.completed
                  );
                  return (
                    <li key={lesson.id}>
                      <Link
                        href={`/lessons/${module.slug}/${lesson.slug}`}
                        className="group flex items-baseline gap-2 rounded-lg px-2 py-1.5 text-[15px] leading-6 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        <span
                          className={`text-sm tabular-nums ${
                            completed
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-zinc-400 dark:text-zinc-500"
                          }`}
                        >
                          {completed ? "✓" : `${i + 1}.${j + 1}`}
                        </span>
                        <span
                          className={`group-hover:underline ${
                            completed ? "text-zinc-400 dark:text-zinc-500" : ""
                          }`}
                        >
                          {lesson.title}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ol>

              {module.project && (
                <p className="mt-4 rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-400">
                  🛠️ פרויקט מסכם: {module.project.title}
                </p>
              )}
            </div>
          );
        })}
      </section>
    </>
  );
}
