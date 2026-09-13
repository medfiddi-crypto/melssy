import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const collectSourceFiles = (directory) => readdirSync(directory).flatMap((entry) => {
  const file = join(directory, entry);
  return statSync(file).isDirectory() ? collectSourceFiles(file) : /\.(ts|tsx|js|jsx)$/.test(file) ? [file] : [];
});
const sourceFiles = collectSourceFiles("src");
const temporaryReferences = sourceFiles.filter((file) => readFileSync(file, "utf8").includes("/images/temp/"));

if (temporaryReferences.length) {
  console.error(`Temporary preview assets are still referenced:\n${temporaryReferences.join("\n")}`);
  process.exit(1);
}
