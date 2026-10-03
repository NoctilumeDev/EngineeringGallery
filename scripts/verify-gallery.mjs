import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { verifyGalleryStructure } from "./lib/gallery-contract.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDirectory, "..");
const requiredRootFiles = [
  "package.json",
  "README.md",
  "CONTRIBUTING.md",
  "PROJECTION_POLICY.md",
  "RELEASE_POLICY.md",
  "catalog/README.md",
  "catalog/exhibits/README.md",
  "docs/EXHIBIT_CONSTRUCTION_GUIDE.md",
  "docs/INFORMATION_ARCHITECTURE.md",
  "docs/ENGLISH_DOCUMENTATION.md",
  "projects/README.md",
  "templates/PROJECT_README.md",
  "templates/ORIGIN.md",
  "templates/CHANGELOG.md",
  "templates/PROJECTION_MANIFEST.txt",
  "templates/PROJECTION_LOCK.json",
  "templates/CATALOG_ENTRY.json",
  "scripts/export-project.mjs",
  "scripts/build-projection-lock.mjs",
  "scripts/verify-catalog-online.mjs",
  "scripts/lib/gallery-contract.mjs",
  "tests/gallery-contract.test.mjs",
];

const errors = [];

function relative(filePath) {
  return path.relative(root, filePath).replaceAll(path.sep, "/");
}

function walk(directory) {
  if (!fs.existsSync(directory)) return [];

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if ([".git", "node_modules"].includes(entry.name)) return [];
    return entry.isDirectory() ? walk(entryPath) : [entryPath];
  });
}

for (const requiredFile of requiredRootFiles) {
  if (!fs.existsSync(path.join(root, requiredFile))) {
    errors.push(`Missing required scaffold file: ${requiredFile}`);
  }
}

const textFiles = walk(root).filter((filePath) =>
  [".json", ".md", ".mjs", ".yml", ".yaml", ".txt"].includes(path.extname(filePath)),
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

for (const filePath of textFiles.filter((candidate) => path.extname(candidate) === ".json")) {
  try {
    JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    errors.push(`${relative(filePath)}: invalid JSON: ${error.message}`);
  }
}

const markdownFiles = textFiles.filter((filePath) => path.extname(filePath) === ".md");
const cjkPattern = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/u;
const allowedCjkLiterals = ["中文说明"];

for (const filePath of markdownFiles) {
  const content = fs.readFileSync(filePath, "utf8");
  const file = relative(filePath);
  const cjkCheckedContent = allowedCjkLiterals.reduce(
    (current, literal) => current.replaceAll(literal, ""),
    content,
  );

  if (cjkPattern.test(cjkCheckedContent)) {
    errors.push(
      `${file}: Gallery Markdown contains CJK text outside the approved Chinese-edition link label`,
    );
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

let galleryState;
try {
  galleryState = verifyGalleryStructure(root);
} catch (error) {
  errors.push(error.message);
}

if (errors.length > 0) {
  console.error("Gallery verification failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Gallery structure verification passed: ${galleryState.projectionCount} projection(s), ` +
    `${galleryState.candidateCount} active candidate(s), ` +
    `${galleryState.catalogedCount} cataloged exhibit(s).`,
);
