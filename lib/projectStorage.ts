export const PROJECT_STORAGE_KEY = "digital-marketing-course:my-project:v1";

export interface ProjectBusiness {
  name: string;
  description: string;
  audience: string;
}

export interface ProjectStageEntry {
  text: string;
  updatedAt?: string;
}

export interface ProjectWorkspaceData {
  version: 1;
  updatedAt?: string;
  business: ProjectBusiness;
  stages: Record<string, ProjectStageEntry>;
}

export function emptyProjectWorkspace(): ProjectWorkspaceData {
  return {
    version: 1,
    business: { name: "", description: "", audience: "" },
    stages: {},
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function validateProjectWorkspace(value: unknown): ProjectWorkspaceData | null {
  if (!isRecord(value) || value.version !== 1 || !isRecord(value.business) || !isRecord(value.stages)) {
    return null;
  }

  const stages: Record<string, ProjectStageEntry> = {};
  for (const [id, stage] of Object.entries(value.stages)) {
    if (isRecord(stage)) {
      stages[id] = {
        text: readText(stage.text),
        updatedAt: typeof stage.updatedAt === "string" ? stage.updatedAt : undefined,
      };
    }
  }

  return {
    version: 1,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : undefined,
    business: {
      name: readText(value.business.name),
      description: readText(value.business.description),
      audience: readText(value.business.audience),
    },
    stages,
  };
}

export function loadProjectWorkspace(): ProjectWorkspaceData {
  if (typeof window === "undefined") return emptyProjectWorkspace();

  try {
    const raw = window.localStorage.getItem(PROJECT_STORAGE_KEY);
    if (!raw) return emptyProjectWorkspace();
    return validateProjectWorkspace(JSON.parse(raw)) ?? emptyProjectWorkspace();
  } catch {
    return emptyProjectWorkspace();
  }
}

export function saveProjectWorkspace(data: ProjectWorkspaceData): boolean {
  if (typeof window === "undefined") return false;

  try {
    window.localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}
