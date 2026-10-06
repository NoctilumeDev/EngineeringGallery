import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { verifyGalleryStructure } from "./lib/gallery-contract.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDirectory, "..");
const specimenRoot = path.join(root, "reference", "hello-gallery");
const expectedStatus = "REFERENCE_SPECIMEN";
const expectedVersion = "0.0.0-reference";
const requiredFiles = [
  "README.md",
  "REFERENCE_STATUS",
  "VERSION",
  "CHANGELOG.md",
  "ORIGIN.md",
  "LICENSE.example.md",
  "NOTICE.example.md",
  "demo/index.html",
  "demo/styles.css",
  "assets/preview.svg",
  "assets/diagrams/feature-map.svg",
  "assets/diagrams/architecture.svg",
  "docs/getting-started.md",
  "docs/release-scope.md",
  "docs/architecture.md",
  "docs/evolution.md",
  "zh/README.md",
];
const englishSections = [
  "Overview",
  "Demo / Preview",
  "Current Release Scope",
  "Quick Start",
  "Feature & Architecture Views",
  "Project Evolution",
  "Release Artifacts",
  "Origin / Provenance",
  "License / Notices",
  "Engineering History",
];
const errors = [];

function read(relativePath) {
  const filePath = path.join(specimenRoot, relativePath);
  if (!fs.existsSync(filePath)) {
    errors.push(`missing reference specimen file: ${relativePath}`);
    return "";
  }
  return fs.readFileSync(filePath, "utf8");
}

for (const relativePath of requiredFiles) read(relativePath);

if (read("REFERENCE_STATUS").trim() !== expectedStatus) {
  errors.push(`REFERENCE_STATUS must be exactly ${expectedStatus}`);
}
if (read("VERSION").trim() !== expectedVersion) {
  errors.push(`VERSION must be exactly ${expectedVersion}`);
}

const showroom = read("README.md");
let previousIndex = -1;
for (const section of englishSections) {
  const heading = `## ${section}`;
  const index = showroom.indexOf(heading);
  if (index < 0) {
    errors.push(`README.md is missing showroom section: ${heading}`);
  } else if (index <= previousIndex) {
    errors.push(`README.md showroom sections are out of order at: ${heading}`);
  }
  previousIndex = index;
}

for (const requiredClaim of [
  "A specimen exercises the Gallery. An exhibit represents a project.",
  "0 project projections",
  "0 cataloged exhibits",
  "REFERENCE_SPECIMEN",
  "EN_PROFILE_ROUTABLE",
  "ZH_PROFILE_ROUTABLE",
]) {
  if (!showroom.includes(requiredClaim)) {
    errors.push(`README.md is missing required boundary text: ${requiredClaim}`);
  }
}

const demoHtml = read("demo/index.html");
for (const requiredText of [
  "Hello, Engineering Gallery.",
  "REFERENCE_SPECIMEN",
  "Showroom",
  "Distribution",
  "Control",
]) {
  if (!demoHtml.includes(requiredText)) {
    errors.push(`demo/index.html is missing required text: ${requiredText}`);
  }
}
if (/<script(?:\s|>)/iu.test(demoHtml)) {
  errors.push("demo/index.html must remain a script-free static reference page");
}
for (const match of demoHtml.matchAll(/(?:href|src)="([^"]+)"/giu)) {
  const target = match[1];
  if (target.startsWith("#") || /^(?:https?:|data:)/iu.test(target)) continue;
  const resolved = path.resolve(specimenRoot, "demo", target.split("#", 1)[0]);
  if (!fs.existsSync(resolved)) {
    errors.push(`demo/index.html contains a broken local resource: ${target}`);
  }
}

for (const svgPath of [
  "assets/preview.svg",
  "assets/diagrams/feature-map.svg",
  "assets/diagrams/architecture.svg",
]) {
  const svg = read(svgPath);
  if (
    !/<svg\b/iu.test(svg) ||
    !/<title(?:\s[^>]*)?>/iu.test(svg) ||
    !/<desc(?:\s[^>]*)?>/iu.test(svg)
  ) {
    errors.push(`${svgPath} must contain an accessible SVG title and description`);
  }
  if (/<script(?:\s|>)/iu.test(svg)) {
    errors.push(`${svgPath} must not contain scripts`);
  }
  if (/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9a-f]+;)/iu.test(svg)) {
    errors.push(`${svgPath} contains an unescaped XML entity marker`);
  }
}

const chineseFixture = read("zh/README.md");
for (const requiredText of [
  "REFERENCE_SPECIMEN",
  "Source Gallery specimen: REFERENCE_SPECIMEN",
  "Edition revision: zh-reference-r1",
  "Last synchronized: 2026-10-04",
]) {
  if (!chineseFixture.includes(requiredText)) {
    errors.push(`zh/README.md is missing required provenance text: ${requiredText}`);
  }
}

for (const forbiddenPath of [
  "projects/hello-gallery",
  "catalog/exhibits/hello-gallery.json",
]) {
  if (fs.existsSync(path.join(root, forbiddenPath))) {
    errors.push(`reference specimen must not create ${forbiddenPath}`);
  }
}
for (const forbiddenFile of ["PROJECTION_LOCK.json", "PROJECTION_MANIFEST.txt"]) {
  if (fs.existsSync(path.join(specimenRoot, forbiddenFile))) {
    errors.push(`reference specimen must not impersonate a projection with ${forbiddenFile}`);
  }
}

try {
  const state = verifyGalleryStructure(root);
  if (
    state.projectionCount !== 0 ||
    state.candidateCount !== 0 ||
    state.catalogedCount !== 0
  ) {
    errors.push(
      "reference verification requires 0 project projections, 0 active candidates, and " +
        "0 cataloged exhibits",
    );
  }
} catch (error) {
  errors.push(error.message);
}

if (errors.length > 0) {
  console.error("Reference specimen verification failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  "Reference specimen verification passed: REFERENCE_SPECIMEN, 0 project projections, " +
    "0 active candidates, 0 cataloged exhibits.",
);
