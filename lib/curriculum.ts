import curriculumData from "@/content/curriculum.json";

export interface Lesson {
  id: string;
  slug: string;
  title: string;
}

export interface ModuleProject {
  title: string;
}

export interface Module {
  id: string;
  slug: string;
  title: string;
  description: string;
  changesFrequently?: boolean;
  lessons: Lesson[];
  project?: ModuleProject;
}

export interface Curriculum {
  version: number;
  updatedAt: string;
  title: string;
  modules: Module[];
}

const curriculum = curriculumData as Curriculum;

export function getCurriculum(): Curriculum {
  return curriculum;
}

export function getModule(moduleSlug: string): Module | undefined {
  return curriculum.modules.find((m) => m.slug === moduleSlug);
}

export function getLesson(
  moduleSlug: string,
  lessonSlug: string
): { module: Module; lesson: Lesson } | undefined {
  const module = getModule(moduleSlug);
  const lesson = module?.lessons.find((l) => l.slug === lessonSlug);
  if (!module || !lesson) return undefined;
  return { module, lesson };
}

export interface LessonRef {
  moduleSlug: string;
  moduleTitle: string;
  lessonSlug: string;
  lessonTitle: string;
}

/** All lessons flattened in learning order — used for prev/next navigation. */
export function getAllLessonRefs(): LessonRef[] {
  return curriculum.modules.flatMap((m) =>
    m.lessons.map((l) => ({
      moduleSlug: m.slug,
      moduleTitle: m.title,
      lessonSlug: l.slug,
      lessonTitle: l.title,
    }))
  );
}

export function getAdjacentLessons(moduleSlug: string, lessonSlug: string): {
  prev?: LessonRef;
  next?: LessonRef;
} {
  const all = getAllLessonRefs();
  const index = all.findIndex(
    (l) => l.moduleSlug === moduleSlug && l.lessonSlug === lessonSlug
  );
  if (index === -1) return {};
  return {
    prev: index > 0 ? all[index - 1] : undefined,
    next: index < all.length - 1 ? all[index + 1] : undefined,
  };
}
