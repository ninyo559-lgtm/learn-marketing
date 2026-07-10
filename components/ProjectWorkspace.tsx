"use client";

import { useEffect, useState } from "react";
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

  const statusText =
    status === "loading"
      ? "טוען את העבודה שלך…"
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
                <h2 className="font-bold">{stage.title}</h2>
                <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{stage.explanation}</p>
              </div>
            </div>
            <label className="grid gap-1.5 text-sm font-medium">
              מה לכתוב
              <span className="font-normal text-zinc-500 dark:text-zinc-400">{stage.prompt}</span>
              <textarea
                value={workspace.stages[stage.id]?.text ?? ""}
                onChange={(event) => updateStage(stage.id, event.target.value)}
                rows={6}
                placeholder="כתבו כאן את העבודה שלכם"
                className="mt-1 resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2.5 font-normal leading-6 outline-none focus:border-zinc-600 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>
          </article>
        ))}
      </section>
    </>
  );
}
