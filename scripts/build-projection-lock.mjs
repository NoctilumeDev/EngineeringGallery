import path from "node:path";
import process from "node:process";
import { buildProjectionLock } from "./lib/gallery-contract.mjs";

function usage() {
  return `Usage:
  node scripts/build-projection-lock.mjs \\
    --source-repo <local-git-checkout> \\
    --source-url <canonical-repository-url> \\
    --source-commit <exact-40-character-sha> \\
    --project <projects/project-slug>

Use this after editing Gallery-owned documentation or visual assets. Payload
bytes must still match the exact upstream commit.`;
}

function parseArguments(argv) {
  const values = new Map();
  for (let index = 0; index < argv.length; index += 2) {
    const name = argv[index];
    const value = argv[index + 1];
    if (!name?.startsWith("--") || value === undefined) throw new Error(usage());
    if (values.has(name)) throw new Error(`Duplicate argument: ${name}`);
    values.set(name, value);
  }

  const required = ["--source-repo", "--source-url", "--source-commit", "--project"];
  for (const name of required) {
    if (!values.has(name)) throw new Error(`Missing ${name}\n\n${usage()}`);
  }
  for (const name of values.keys()) {
    if (!required.includes(name)) throw new Error(`Unknown argument: ${name}\n\n${usage()}`);
  }
  return values;
}

try {
  const values = parseArguments(process.argv.slice(2));
  const lock = buildProjectionLock({
    sourceRepositoryPath: path.resolve(values.get("--source-repo")),
    sourceRepository: values.get("--source-url"),
    sourceCommit: values.get("--source-commit"),
    projectDirectory: path.resolve(values.get("--project")),
  });

  console.log(
    `Projection lock written for ${lock.project.slug} ${lock.project.version}: ` +
      `${lock.payload.length} payload file(s), ${lock.control.length} control file(s).`,
  );
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
