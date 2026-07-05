import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Renders the markdown body of a lesson with the site's typography styles.
 * Section headings (##) inside the lesson get a numbered, card-like look via
 * the prose overrides below.
 */
export default function LessonBody({ markdown }: { markdown: string }) {
  return (
    <article
      className="prose prose-zinc max-w-none dark:prose-invert
        prose-headings:scroll-mt-20
        prose-h2:mt-10 prose-h2:border-b prose-h2:border-zinc-200 prose-h2:pb-2 prose-h2:text-2xl dark:prose-h2:border-zinc-800
        prose-a:text-blue-600 dark:prose-a:text-blue-400
        prose-strong:font-semibold"
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </article>
  );
}
