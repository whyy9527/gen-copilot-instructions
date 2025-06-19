import * as path from "path";
import { scanCoreDirs } from "./scanCoreDirs";
import {
  countFilesAndFindEntry,
  detectPrimaryLanguage,
  detectFramework,
} from "./fileCounterAndEntryFinder";

export async function generateProjectSummary(
  rootDir: string = process.cwd()
): Promise<{
  repoName: string;
  language: string;
  folders: string[];
  fileCount: number;
  framework: string | null;
  mainEntry: string | null;
}> {
  const repoName = path.basename(rootDir);
  const { folders } = await scanCoreDirs(rootDir);
  const { fileCount, mainEntry } = await countFilesAndFindEntry(rootDir);
  const { language } = await detectPrimaryLanguage(rootDir);
  const { framework } = await detectFramework(rootDir);
  return {
    repoName,
    language,
    folders,
    fileCount,
    framework,
    mainEntry,
  };
}

if (require.main === module) {
  generateProjectSummary().then((summary) => {
    console.log(JSON.stringify(summary, null, 2));
  });
}
