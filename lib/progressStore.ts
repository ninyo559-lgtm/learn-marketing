import fs from "fs";
import path from "path";
import { emptyProgress, type ProgressData } from "@/lib/progressTypes";

const PROGRESS_FILE = path.join(process.cwd(), "data", "progress.json");

/** Reads progress from data/progress.json, falling back to an empty state. */
export function readProgress(): ProgressData {
  if (!fs.existsSync(PROGRESS_FILE)) return emptyProgress();
  try {
    const raw = fs.readFileSync(PROGRESS_FILE, "utf8");
    return { ...emptyProgress(), ...(JSON.parse(raw) as ProgressData) };
  } catch {
    // Corrupt file — don't crash the app over progress data.
    return emptyProgress();
  }
}

export function writeProgress(progress: ProgressData): void {
  fs.mkdirSync(path.dirname(PROGRESS_FILE), { recursive: true });
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2), "utf8");
}
