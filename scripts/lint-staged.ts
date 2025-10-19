import { spawnSync } from "node:child_process";
import { extname } from "node:path";

const lintableExtensions = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".json",
  ".jsonc",
  ".css",
  ".scss",
  ".md",
  ".mdx",
]);

const gitDiff = spawnSync(
  "git",
  ["diff", "--cached", "--name-only", "--diff-filter=ACMR"],
  {
    encoding: "utf-8",
  }
);

if (gitDiff.status !== 0) {
  console.error("Failed to read staged files from git.");
  process.exit(gitDiff.status ?? 1);
}

const stagedFiles = gitDiff.stdout
  .split("\n")
  .map((file) => file.trim())
  .filter(Boolean);

const lintTargets = stagedFiles.filter((file) =>
  lintableExtensions.has(extname(file))
);

const runCommand = (command: string, args: string[]) => {
  const result = spawnSync(command, args, {
    stdio: "inherit",
  });

  if (result.error) {
    console.error(`Failed to run ${command}:`, result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

if (lintTargets.length > 0) {
  // Biome: pass files directly as arguments (no --files flag)
  // runCommand("bun", [
  //   "x",
  //   "@biomejs/biome",
  //   "check",
  //   "--write",
  //   "--unsafe",
  //   "--no-errors-on-unmatched",
  //   "--files-ignore-unknown=true",
  //   ...lintTargets,
  // ]);

  // Ultracite: pass files directly as arguments (no --files flag)
  runCommand("bun", ["x", "ultracite", "fix", ...lintTargets]);
}

runCommand("git", ["add", ...stagedFiles]);
