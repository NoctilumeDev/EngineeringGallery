import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDirectory, "..");
const projectsRoot = path.join(root, "projects");

const requiredRootFiles = [
  "README.md",
  "CONTRIBUTING.md",
  "PROJECTION_POLICY.md",
  "RELEASE_POLICY.md",
  "docs/EXHIBIT_CONSTRUCTION_GUIDE.md",
  "docs/INFORMATION_ARCHITECTURE.md",
  "docs/ENGLISH_DOCUMENTATION.md",
  "projects/README.md",
  "templates/PROJECT_README.md",
  "templates/ORIGIN.md",
  "templates/CHANGELOG.md",
  "templates/PROJECTION_MANIFEST.txt",
];

const requiredProjectFiles = [
  "README.md",
  "ORIGIN.md",
  "VERSION",
  "CHANGELOG.md",
  "PROJECTION_MANIFEST.txt",
];

const errors = [];

function relative(filePath) {
  return path.relative(root, filePath).replaceAll(path.sep, "/");
}

function walk(directory) {
  if (!fs.existsSync(directory)) return [];

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.name === ".git") return [];
    return entry.isDirectory() ? walk(entryPath) : [entryPath];
  });
}

function containsGitMetadata(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).some((entry) => {
    if (entry.name === ".git") return true;
    return entry.isDirectory() && containsGitMetadata(path.join(directory, entry.name));
  });
}

for (const requiredFile of requiredRootFiles) {
  if (!fs.existsSync(path.join(root, requiredFile))) {
    errors.push(`Missing required scaffold file: ${requiredFile}`);
  }
}

const textFiles = walk(root).filter((filePath) =>
  [".md", ".mjs", ".yml", ".yaml", ".txt"].includes(path.extname(filePath)),
);

for (const filePath of textFiles) {
  const content = fs.readFileSync(filePath, "utf8");
  const file = relative(filePath);

  if (content.length > 0 && !content.endsWith("\n")) {
    errors.push(`${file}: missing final newline`);
  }

  content.split("\n").forEach((line, index) => {
    if (/[ \t]+$/.test(line)) {
      errors.push(`${file}:${index + 1}: trailing whitespace`);
    }
  });
}

const markdownFiles = textFiles.filter((filePath) => path.extname(filePath) === ".md");
const cjkPattern = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/u;

for (const filePath of markdownFiles) {
  const content = fs.readFileSync(filePath, "utf8");
  const file = relative(filePath);

  if (cjkPattern.test(content)) {
    errors.push(`${file}: Gallery Markdown must be English-first and contains CJK text`);
  }

  const linkPattern = /!?\[[^\]]*\]\(([^)]+)\)/g;
  for (const match of content.matchAll(linkPattern)) {
    let target = match[1].trim();
    if (target.startsWith("<") && target.endsWith(">")) {
      target = target.slice(1, -1);
    }
    target = target.split(/\s+["']/u, 1)[0];

    if (
      target === "" ||
      target.startsWith("#") ||
      /^(?:https?:|mailto:)/iu.test(target) ||
      target.includes("<")
    ) {
      continue;
    }

    const fileTarget = decodeURIComponent(target.split("#", 1)[0]);
    const resolvedTarget = path.resolve(path.dirname(filePath), fileTarget);
    if (!fs.existsSync(resolvedTarget)) {
      errors.push(`${file}: broken relative link: ${target}`);
    }
  }
}

const projectDirectories = fs.existsSync(projectsRoot)
  ? fs
      .readdirSync(projectsRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => path.join(projectsRoot, entry.name))
  : [];

for (const projectDirectory of projectDirectories) {
  const projectName = path.basename(projectDirectory);

  for (const requiredFile of requiredProjectFiles) {
    if (!fs.existsSync(path.join(projectDirectory, requiredFile))) {
      errors.push(`projects/${projectName}: missing ${requiredFile}`);
    }
  }

  const versionPath = path.join(projectDirectory, "VERSION");
  if (fs.existsSync(versionPath)) {
    const version = fs.readFileSync(versionPath, "utf8").trim();
    if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u.test(version)) {
      errors.push(`projects/${projectName}/VERSION: expected Semantic Versioning without a v prefix`);
    }
  }

  const originPath = path.join(projectDirectory, "ORIGIN.md");
  if (fs.existsSync(originPath)) {
    const origin = fs.readFileSync(originPath, "utf8");
    for (const label of [
      "Original repository",
      "Source commit",
      "Export date",
      "Gallery release",
      "Projection policy",
    ]) {
      if (!origin.includes(`**${label}:**`)) {
        errors.push(`projects/${projectName}/ORIGIN.md: missing ${label} field`);
      }
    }
  }

  if (containsGitMetadata(projectDirectory)) {
    errors.push(`projects/${projectName}: nested Git metadata is not allowed`);
  }

  const manifestPath = path.join(projectDirectory, "PROJECTION_MANIFEST.txt");
  if (fs.existsSync(manifestPath)) {
    const entries = fs
      .readFileSync(manifestPath, "utf8")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "" && !line.startsWith("#"));

    if (entries.length === 0) {
      errors.push(`projects/${projectName}/PROJECTION_MANIFEST.txt: allowlist is empty`);
    }

    for (const entry of entries) {
      if (
        path.isAbsolute(entry) ||
        entry.split(/[\\/]/u).includes("..") ||
        /[*?[\]]/u.test(entry)
      ) {
        errors.push(
          `projects/${projectName}/PROJECTION_MANIFEST.txt: expected an explicit relative path, got ${entry}`,
        );
      }
    }
  }
}

if (errors.length > 0) {
  console.error("Gallery verification failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Gallery structure verification passed: ${projectDirectories.length} project projection(s). ` +
    "Qualification is not inferred from directory presence.",
);
