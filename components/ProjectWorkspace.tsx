"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ProjectStage } from "@/lib/projectWorkspace";
import {
  emptyProjectWorkspace,
  loadProjectWorkspace,
  saveProjectWorkspace,
  type ProjectWorkspaceData,
} from "@/lib/projectStorage";

interface Props {
  stages: ProjectStage[];
}

type SaveStatus = "loading" | "saved" | "error";

export default function ProjectWorkspace({ stages }: Props) {
  const [workspace, setWorkspace] = useState<ProjectWorkspaceData>(emptyProjectWorkspace);
  const [status, setStatus] = useState<SaveStatus>("loading");

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      setWorkspace(loadProjectWorkspace());
      setStatus("saved");
    }, 0);
    return () => window.clearTimeout(loadTimer);
  }, []);

  function persist(next: ProjectWorkspaceData) {
    setWorkspace(next);
    setStatus(saveProjectWorkspace(next) ? "saved" : "error");
  }

  function updateBusiness(field: "name" | "description" | "audience", value: string) {
    persist({
      ...workspace,
      updatedAt: new Date().toISOString(),
      business: { ...workspace.business, [field]: value },
    });
  }

  function updateStage(id: string, text: string) {
    persist({
      ...workspace,
      updatedAt: new Date().toISOString(),
      stages: {
        ...workspace.stages,
        [id]: { text, updatedAt: new Date().toISOString() },
      },
    });
  }

  function updateLessonTask(id: string, text: string) {
    const updatedAt = new Date().toISOString();
    const existing = workspace.lessonTasks?.[id];

    persist({
      ...workspace,
      updatedAt,
      lessonTasks: {
        ...workspace.lessonTasks,
        [id]: {
          text,
          completed: existing?.completed ?? false,
          updatedAt,
          completedAt: existing?.completedAt,
        },
      },
    });
  }

  function updateLessonTaskCompletion(id: string, completed: boolean) {
    const updatedAt = new Date().toISOString();
    const existing = workspace.lessonTasks?.[id];

    persist({
      ...workspace,
      updatedAt,
      lessonTasks: {
        ...workspace.lessonTasks,
        [id]: {
          text: existing?.text ?? "",
          completed,
          updatedAt,
          completedAt: completed ? updatedAt : undefined,
        },
      },
    });
  }

  const statusText =
    status === "loading"
      ? "טוען את העבודה שלך..."
      : status === "error"
        ? "לא הצלחנו לשמור בדפדפן הזה"
        : "נשמר בדפדפן הזה";

  return (
    <>
      <header className="mb-8">
        <p className="mb-2 text-sm text-zinc-500 dark:text-zinc-400">המסלול שלי</p>
        <h1 className="text-3xl font-bold">הפרויקט שלי</h1>
        <p className="mt-3 leading-7 text-zinc-600 dark:text-zinc-400">
          כאן בונים תוכנית שיווק דיגיטלי מלאה לעסק אחד, שלב אחר שלב לאורך המסלול.
        </p>
      </header>

      <section className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
        העבודה נשמרת רק בדפדפן ובמכשיר הנוכחי. מומלץ לגבות ידנית בהמשך.
      </section>

      <section className="mb-8 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold">העסק שאני מלווה</h2>
          <span aria-live="polite" className={`text-xs ${status === "error" ? "text-rose-600 dark:text-rose-400" : "text-zinc-500 dark:text-zinc-400"}`}>
            {statusText}
          </span>
        </div>
        <div className="grid gap-4">
          <label className="grid gap-1.5 text-sm font-medium">
            שם העסק
            <input
              value={workspace.business.name}
              onChange={(event) => updateBusiness("name", event.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-zinc-600 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            תיאור קצר
            <textarea
              value={workspace.business.description}
              onChange={(event) => updateBusiness("description", event.target.value)}
              rows={3}
              className="resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-zinc-600 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            קהל יעד
            <textarea
              value={workspace.business.audience}
              onChange={(event) => updateBusiness("audience", event.target.value)}
              rows={3}
              className="resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-zinc-600 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        {stages.map((stage) => (
          <article key={stage.id} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-3 flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                {stage.number}
              </span>
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  מודול {stage.number}: {stage.moduleTitle}
                </p>
                <h2 className="mt-1 font-bold">{stage.title}</h2>
                <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{stage.explanation}</p>
              </div>
            </div>

            <p className="mb-4 rounded-lg bg-zinc-50 px-3 py-2 text-sm leading-6 text-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300">
              <span className="font-bold">פרויקט המודול: </span>
              {stage.projectTitle}
            </p>

            <label className="grid gap-1.5 text-sm font-medium">
              סיכום ותוצר המודול
              <span className="font-normal text-zinc-500 dark:text-zinc-400">{stage.prompt}</span>
              <textarea
                value={workspace.stages[stage.id]?.text ?? ""}
                onChange={(event) => updateStage(stage.id, event.target.value)}
                rows={6}
                placeholder="כתבו כאן את העבודה שלכם"
                className="mt-1 resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2.5 font-normal leading-6 outline-none focus:border-zinc-600 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>

            <section className="mt-6 border-t border-zinc-200 pt-5 dark:border-zinc-800" aria-labelledby={`lesson-tasks-${stage.id}`}>
              <h3 id={`lesson-tasks-${stage.id}`} className="text-lg font-bold">משימות השיעורים</h3>
              <div className="mt-3 flex flex-col gap-3">
                {stage.lessons.map((lesson) => {
                  const taskEntry = workspace.lessonTasks?.[lesson.id];
                  const completed = taskEntry?.completed ?? false;

                  return (
                    <details key={lesson.id} className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/40">
                      <summary className="cursor-pointer list-none font-medium marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500">
                        <span className="flex items-center gap-2">
                          <span className="text-zinc-500 dark:text-zinc-400">{stage.number}.{lesson.number}</span>
                          <span>{lesson.title}</span>
                          {completed && <span className="mr-auto text-xs text-emerald-700 dark:text-emerald-400">הושלמה</span>}
                        </span>
                      </summary>

                      <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
                        <Link href={lesson.href} className="text-sm font-medium text-blue-700 underline underline-offset-2 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                          פתיחת השיעור
                        </Link>

                        {lesson.taskMissing || !lesson.taskMarkdown ? (
                          <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                            המשימה המעשית לא נמצאה. אפשר לפתוח את השיעור המקורי כדי לעיין בו.
                          </p>
                        ) : (
                          <div className="prose prose-sm mt-4 max-w-none prose-zinc dark:prose-invert prose-a:text-blue-700 dark:prose-a:text-blue-400">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{lesson.taskMarkdown}</ReactMarkdown>
                          </div>
                        )}

                        <label className="mt-5 grid gap-1.5 text-sm font-medium">
                          התיעוד שלי למשימה
                          <textarea
                            value={taskEntry?.text ?? ""}
                            onChange={(event) => updateLessonTask(lesson.id, event.target.value)}
                            rows={5}
                            placeholder="כתבו כאן את התיעוד, התוצאה או הקישור לתוצר שלכם"
                            className="resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2.5 font-normal leading-6 outline-none focus:border-zinc-600 dark:border-zinc-700 dark:bg-zinc-950"
                          />
                        </label>

                        <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm font-medium">
                          <input
                            type="checkbox"
                            checked={completed}
                            onChange={(event) => updateLessonTaskCompletion(lesson.id, event.target.checked)}
                            className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                          />
                          המשימה הושלמה
                        </label>
                      </div>
                    </details>
                  );
                })}
              </div>
            </section>
          </article>
        ))}
      </section>
    </>
  );
}
