import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-lg font-bold hover:opacity-80">
          לומדים שיווק דיגיטלי
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="font-medium hover:underline">
            הקורס
          </Link>
          <Link href="/project" className="font-medium hover:underline">
            הפרויקט שלי
          </Link>
        </nav>
      </div>
    </header>
  );
}
