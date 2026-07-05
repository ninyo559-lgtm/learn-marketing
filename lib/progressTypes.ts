// Shared progress types — safe to import from both server and client code.

export interface LessonProgress {
  completed?: boolean;
  completedAt?: string;
  quizPassed?: boolean;
  taskDone?: boolean;
}

export interface LastVisited {
  moduleSlug: string;
  lessonSlug: string;
}

export interface ProgressData {
  version: 1;
  /** Keyed by lesson id, e.g. "m01-l01" */
  lessons: Record<string, LessonProgress>;
  lastVisited?: LastVisited;
  /** Accumulated learning time in seconds (approximate, heartbeat-based) */
  totalLearningSeconds: number;
}

export function emptyProgress(): ProgressData {
  return { version: 1, lessons: {}, totalLearningSeconds: 0 };
}
