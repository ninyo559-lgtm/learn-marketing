import ProjectWorkspace from "@/components/ProjectWorkspace";
import { getProjectStages } from "@/lib/projectWorkspace";

export const metadata = {
  title: "הפרויקט שלי | לומדים שיווק דיגיטלי",
};

export default function ProjectPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
      <ProjectWorkspace stages={getProjectStages()} />
    </main>
  );
}
