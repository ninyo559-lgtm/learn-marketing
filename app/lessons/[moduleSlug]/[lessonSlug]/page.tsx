import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAdjacentLessons,
  getAllLessonRefs,
  getLesson,
} from "@/lib/curriculum";
import { getLessonContent } from "@/lib/lessons";
import LessonBody from "@/components/LessonBody";
import LessonProgressPanel from "@/components/LessonProgressPanel";

export function generateStaticParams() {
  return getAllLessonRefs().map((ref) => ({
    moduleSlug: ref.moduleSlug,
    lessonSlug: ref.lessonSlug,
  }));
}

interface PageProps {
  params: Promise<{ moduleSlug: string; lessonSlug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { moduleSlug, lessonSlug } = await params;
  const found = getLesson(moduleSlug, lessonSlug);
  return { title: found ? `${found.lesson.title} | לומדים שיווק דיגיטלי` : "שיעור" };
}

export default async function LessonPage({ params }: PageProps) {
  const { moduleSlug, lessonSlug } = await params;
  const found = getLesson(moduleSlug, lessonSlug);
  if (!found) notFound();

  const { module, lesson } = found;
  const content = getLessonContent(moduleSlug, lessonSlug);
  const { prev, next } = getAdjacentLessons(moduleSlug, lessonSlug);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/" className="hover:underline">
          המסלול
        </Link>
        <span className="mx-2">←</span>
        <span>{module.title}</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold leading-snug">{lesson.title}</h1>
        {content?.frontmatter.status === "draft" && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            ⚠️ טיוטה (תוכן דמה) — השיעור טרם עבר בדיקת מקורות ואינו סופי.
          </p>
        )}
      </header>

      {content ? (
        <>
          <LessonBody markdown={content.markdown} />

          {/* Sources & metadata footer — required by the lesson template */}
          <footer className="mt-12 rounded-xl border border-zinc-200 bg-zinc-50 p-5 text-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-2 font-bold">מקורות ועדכניות</h2>
            {content.frontmatter.sources?.length ? (
              <ul className="mb-3 list-inside list-disc space-y-1 text-zinc-700 dark:text-zinc-300">
                {content.frontmatter.sources.map((s, i) => (
                  <li key={i}>
                    {s.url ? (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {s.title}
                      </a>
                    ) : (
                      s.title
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mb-3 text-zinc-500">טרם צורפו מקורות לשיעור זה.</p>
            )}
            <p className="text-zinc-500 dark:text-zinc-400">
              עדכון אחרון: {content.frontmatter.updatedAt ?? "לא צוין"}
              {content.frontmatter.changesFrequently && (
                <span className="mr-2">
                  · ⚠️ נושא שמשתנה לעיתים קרובות — מומלץ לוודא עדכניות מול המקורות.
                </span>
              )}
            </p>
          </footer>

          <LessonProgressPanel
            lessonId={lesson.id}
            moduleSlug={module.slug}
            lessonSlug={lesson.slug}
          />
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-300 p-10 text-center text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          <p className="text-lg font-medium">השיעור עדיין לא נכתב 📝</p>
          <p className="mt-2 text-sm">
            השיעורים נכתבים לפי סדר המסלול, כל אחד עם בדיקת מקורות מלאה.
          </p>
        </div>
      )}

      {/* Prev / Next navigation */}
      <nav className="mt-10 flex flex-col gap-3 border-t border-zinc-200 pt-6 sm:flex-row sm:justify-between dark:border-zinc-800">
        {prev ? (
          <Link
            href={`/lessons/${prev.moduleSlug}/${prev.lessonSlug}`}
            className="group flex-1 rounded-xl border border-zinc-200 p-4 hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
          >
            <span className="text-xs text-zinc-500">→ השיעור הקודם</span>
            <span className="mt-1 block text-sm font-medium group-hover:underline">
              {prev.lessonTitle}
            </span>
          </Link>
        ) : (
          <span className="flex-1" />
        )}
        {next ? (
          <Link
            href={`/lessons/${next.moduleSlug}/${next.lessonSlug}`}
            className="group flex-1 rounded-xl border border-zinc-200 p-4 text-left hover:border-zinc-400 sm:text-left dark:border-zinc-800 dark:hover:border-zinc-600"
          >
            <span className="text-xs text-zinc-500">השיעור הבא ←</span>
            <span className="mt-1 block text-sm font-medium group-hover:underline">
              {next.lessonTitle}
            </span>
          </Link>
        ) : (
          <span className="flex-1" />
        )}
      </nav>
    </main>
  );
}
