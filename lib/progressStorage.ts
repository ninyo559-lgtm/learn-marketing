import {
  emptyProgress,
  type LessonProgress,
  type ProgressData,
} from "@/lib/progressTypes";

export const PROGRESS_STORAGE_KEY = "digital-marketing-course:progress:v1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizeProgress(value: unknown): ProgressData {
  if (!isRecord(value)) return emptyProgress();

  const lessons: Record<string, LessonProgress> = {};
  if (isRecord(value.lessons)) {
    for (const [lessonId, rawLesson] of Object.entries(value.lessons)) {
      if (!isRecord(rawLesson)) continue;

      const lesson: LessonProgress = {};
      if (typeof rawLesson.completed === "boolean") {
        lesson.completed = rawLesson.completed;
      }
      if (typeof rawLesson.completedAt === "string") {
        lesson.completedAt = rawLesson.completedAt;
      }
      if (typeof rawLesson.quizPassed === "boolean") {
        lesson.quizPassed = rawLesson.quizPassed;
      }
      if (typeof rawLesson.taskDone === "boolean") {
        lesson.taskDone = rawLesson.taskDone;
      }
      lessons[lessonId] = lesson;
    }
  }

  const totalLearningSeconds = Number(value.totalLearningSeconds);
  const progress: ProgressData = {
    version: 1,
    lessons,
    totalLearningSeconds:
      Number.isFinite(totalLearningSeconds) && totalLearningSeconds > 0
        ? Math.floor(totalLearningSeconds)
        : 0,
  };

  if (
    isRecord(value.lastVisited) &&
    typeof value.lastVisited.moduleSlug === "string" &&
    typeof value.lastVisited.lessonSlug === "string"
  ) {
    progress.lastVisited = {
      moduleSlug: value.lastVisited.moduleSlug,
      lessonSlug: value.lastVisited.lessonSlug,
    };
  }

  return progress;
}

function parseProgress(raw: string): ProgressData {
  try {
    return normalizeProgress(JSON.parse(raw));
  } catch {
    return emptyProgress();
  }
}

function getStoredProgress(): string | null {
  try {
    return window.localStorage.getItem(PROGRESS_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function readProgressFromStorage(): ProgressData {
  if (typeof window === "undefined") return emptyProgress();

  const raw = getStoredProgress();
  return raw === null ? emptyProgress() : parseProgress(raw);
}

export function saveProgressToStorage(progress: ProgressData): ProgressData {
  const normalized = normalizeProgress(progress);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(
        PROGRESS_STORAGE_KEY,
        JSON.stringify(normalized)
      );
    } catch {
      // Keep the in-memory state usable when browser storage is unavailable.
    }
  }
  return normalized;
}

function hasMeaningfulProgress(progress: ProgressData): boolean {
  return (
    Object.values(progress.lessons).some(
      (lesson) => Object.keys(lesson).length > 0
    ) ||
    progress.totalLearningSeconds > 0 ||
    progress.lastVisited !== undefined
  );
}

export async function loadProgressWithApiImport(): Promise<ProgressData> {
  if (typeof window === "undefined") return emptyProgress();

  const stored = getStoredProgress();
  if (stored !== null) return parseProgress(stored);

  let progress = emptyProgress();
  try {
    const response = await fetch("/api/progress", { method: "GET" });
    if (response.ok) {
      const imported = normalizeProgress(await response.json());
      if (hasMeaningfulProgress(imported)) progress = imported;
    }
  } catch {
    // The API is optional and is used only for this one-time import.
  }

  return saveProgressToStorage(progress);
}

export function updateLessonProgress(
  lessonId: string,
  field: "completed" | "quizPassed" | "taskDone",
  value: boolean
): ProgressData {
  const progress = readProgressFromStorage();
  const lesson = { ...progress.lessons[lessonId], [field]: value };

  if (field === "completed") {
    lesson.completedAt = value ? new Date().toISOString() : undefined;
  }

  return saveProgressToStorage({
    ...progress,
    lessons: { ...progress.lessons, [lessonId]: lesson },
  });
}

export function updateLastVisited(
  moduleSlug: string,
  lessonSlug: string
): ProgressData {
  const progress = readProgressFromStorage();
  return saveProgressToStorage({
    ...progress,
    lastVisited: { moduleSlug, lessonSlug },
  });
}

export function addLearningTime(seconds: number): ProgressData {
  const progress = readProgressFromStorage();
  const safeSeconds = Math.max(0, Math.min(600, Number(seconds) || 0));

  return saveProgressToStorage({
    ...progress,
    totalLearningSeconds: progress.totalLearningSeconds + safeSeconds,
  });
}
