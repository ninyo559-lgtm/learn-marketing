import fs from "fs";
import path from "path";
import matter from "gray-matter";

const LESSONS_DIR = path.join(process.cwd(), "content", "lessons");

export interface LessonSource {
  title: string;
  url?: string;
}

export interface LessonFrontmatter {
  title?: string;
  /** ISO date of the last content update, e.g. "2026-07-05" */
  updatedAt?: string;
  /** Whether the topic changes frequently (ads policies, algorithms, AI tools) */
  changesFrequently?: boolean;
  /** Sources the lesson content is based on */
  sources?: LessonSource[];
  /** "draft" = placeholder / not yet source-checked, "final" = verified content */
  status?: "draft" | "final";
}

export interface LessonContent {
  frontmatter: LessonFrontmatter;
  /** Raw markdown body of the lesson */
  markdown: string;
}

/**
 * Loads a lesson markdown file from content/lessons/<moduleSlug>/<lessonSlug>.md.
 * Returns null when the lesson has not been written yet.
 */
export function getLessonContent(
  moduleSlug: string,
  lessonSlug: string
): LessonContent | null {
  const filePath = path.join(LESSONS_DIR, moduleSlug, `${lessonSlug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  return {
    frontmatter: data as LessonFrontmatter,
    markdown: content,
  };
}

/**
 * Returns the Markdown body of a lesson's practical task.
 * A missing lesson or task is represented by null so callers can keep
 * rendering the rest of the course.
 */
export function getLessonPracticalTask(
  moduleSlug: string,
  lessonSlug: string
): string | null {
  const lesson = getLessonContent(moduleSlug, lessonSlug);
  if (!lesson) return null;

  const taskHeading = /^##\s+משימה מעשית\s*$/m;
  const headingMatch = taskHeading.exec(lesson.markdown);
  if (!headingMatch || headingMatch.index === undefined) return null;

  const contentAfterHeading = lesson.markdown.slice(
    headingMatch.index + headingMatch[0].length
  );
  const nextSectionIndex = contentAfterHeading.search(/\r?\n##\s+/);
  const task = contentAfterHeading
    .slice(0, nextSectionIndex === -1 ? undefined : nextSectionIndex)
    .trim();

  return task || null;
}
