import HomeClient from "@/components/HomeClient";
import { getCurriculum } from "@/lib/curriculum";

export default function Home() {
  const curriculum = getCurriculum();
  const totalLessons = curriculum.modules.reduce(
    (sum, m) => sum + m.lessons.length,
    0
  );

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
      <section className="mb-10 text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">{curriculum.title}</h1>
        <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
          {curriculum.modules.length} מודולים · {totalLessons} שיעורים · מהיסודות ועד עבודה עם לקוחות
        </p>
      </section>

      <HomeClient modules={curriculum.modules} />
    </main>
  );
}
