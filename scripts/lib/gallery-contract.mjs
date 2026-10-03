import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

export const LOCK_FILE = "PROJECTION_LOCK.json";
export const MANIFEST_FILE = "PROJECTION_MANIFEST.txt";
export const REQUIRED_PROJECT_FILES = [
  "README.md",
  "ORIGIN.md",
  "VERSION",
  "CHANGELOG.md",
  MANIFEST_FILE,
  LOCK_FILE,
];

const SHA_PATTERN = /^[0-9a-f]{40}$/u;
const SHA256_PATTERN = /^[0-9a-f]{64}$/u;
const SEMVER_PATTERN = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u;

export class ContractError extends Error {
  constructor(message) {
    super(message);
    this.name = "ContractError";
  }
}

function fail(message) {
  throw new ContractError(message);
}

export function toPosix(relativePath) {
  return relativePath.split(path.sep).join("/");
}

export function sha256(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

function canonicalRepositoryUrl(value) {
  return value.trim().replace(/\/+$/u, "").replace(/\.git$/u, "");
}

export function assertSafeRelativePath(value, label = "path") {
  if (typeof value !== "string" || value.trim() === "") {
    fail(`${label} must be a non-empty string`);
  }

  if (value.includes("\\")) {
    fail(`${label} must use forward slashes: ${value}`);
  }

  const normalized = value.replace(/^\.\//u, "").replace(/\/+$/u, "");
  if (
    normalized === "" ||
    path.posix.isAbsolute(normalized) ||
    /^[A-Za-z]:/u.test(normalized) ||
    normalized.split("/").some((part) => part === "" || part === "." || part === "..") ||
    /[*?[\]\0]/u.test(normalized)
  ) {
    fail(`${label} must be an explicit safe relative path: ${value}`);
  }

  return normalized;
}

function resolveInside(root, relativePath, label) {
  const rootPath = path.resolve(root);
  const resolved = path.resolve(rootPath, ...relativePath.split("/"));
  const prefix = `${rootPath}${path.sep}`;
  if (resolved !== rootPath && !resolved.startsWith(prefix)) {
    fail(`${label} escapes its declared root: ${relativePath}`);
  }
  return resolved;
}

function readUtf8(filePath, label = filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    fail(`${label} could not be read: ${error.message}`);
  }
}

function readJson(filePath, label = filePath) {
  try {
    return JSON.parse(readUtf8(filePath, label));
  } catch (error) {
    if (error instanceof ContractError) throw error;
    fail(`${label} is not valid JSON: ${error.message}`);
  }
}

function runGit(repository, args, { binary = false, allowFailure = false } = {}) {
  const result = spawnSync("git", ["-C", repository, ...args], {
    encoding: binary ? null : "utf8",
    maxBuffer: 128 * 1024 * 1024,
    windowsHide: true,
  });

  if (result.error) {
    fail(`git ${args.join(" ")} could not run: ${result.error.message}`);
  }

  if (result.status !== 0 && !allowFailure) {
    const stderr = binary ? result.stderr.toString("utf8") : result.stderr;
    fail(`git ${args.join(" ")} failed: ${stderr.trim() || `exit ${result.status}`}`);
  }

  return result;
}

function listFiles(root) {
  const files = [];
  const forbidden = [];

  function visit(directory, prefix = "") {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const relativePath = prefix === "" ? entry.name : `${prefix}/${entry.name}`;
      const absolutePath = path.join(directory, entry.name);

      if (entry.name === ".git") {
        forbidden.push(`${relativePath}: nested Git metadata is not allowed`);
        continue;
      }

      if (entry.isSymbolicLink()) {
        forbidden.push(`${relativePath}: symbolic links require an explicit project-specific design`);
        continue;
      }

      if (entry.isDirectory()) {
        visit(absolutePath, relativePath);
      } else if (entry.isFile()) {
        files.push(relativePath);
      } else {
        forbidden.push(`${relativePath}: unsupported filesystem entry type`);
      }
    }
  }

  visit(root);
  return { files: files.sort(), forbidden };
}

export function readManifest(manifestPath) {
  const entries = readUtf8(manifestPath, MANIFEST_FILE)
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line !== "" && !line.startsWith("#"))
    .map((entry, index) => assertSafeRelativePath(entry, `manifest entry ${index + 1}`));

  if (entries.length === 0) {
    fail(`${MANIFEST_FILE} allowlist is empty`);
  }

  const duplicates = entries.filter((entry, index) => entries.indexOf(entry) !== index);
  if (duplicates.length > 0) {
    fail(`${MANIFEST_FILE} contains duplicate entries: ${[...new Set(duplicates)].join(", ")}`);
  }

  return entries;
}

function parseLsTree(buffer, manifestEntry) {
  const records = buffer.toString("utf8").split("\0").filter(Boolean);
  return records.map((record) => {
    const tab = record.indexOf("\t");
    if (tab < 0) fail(`Unexpected git ls-tree output for manifest entry ${manifestEntry}`);
    const [mode, type, oid] = record.slice(0, tab).split(" ");
    const sourcePath = assertSafeRelativePath(record.slice(tab + 1), "upstream path");

    if (type !== "blob") {
      fail(`${sourcePath}: submodules and non-blob Git entries are not supported`);
    }
    if (mode === "120000") {
      fail(`${sourcePath}: symbolic links require an explicit project-specific design`);
    }

    return { sourcePath, gitMode: mode, gitBlob: oid };
  });
}

export function resolveExactCommit(sourceRepositoryPath, sourceCommit) {
  if (!SHA_PATTERN.test(sourceCommit)) {
    fail(`source commit must be an exact 40-character lowercase SHA: ${sourceCommit}`);
  }

  const resolved = runGit(sourceRepositoryPath, [
    "rev-parse",
    "--verify",
    `${sourceCommit}^{commit}`,
  ]).stdout.trim();

  if (resolved !== sourceCommit) {
    fail(`source commit resolved to a different identity: expected ${sourceCommit}, got ${resolved}`);
  }

  return resolved;
}

export function expandManifest(sourceRepositoryPath, sourceCommit, manifestEntries) {
  resolveExactCommit(sourceRepositoryPath, sourceCommit);

  const byPath = new Map();
  const manifest = manifestEntries.map((entry) => {
    const result = runGit(
      sourceRepositoryPath,
      ["ls-tree", "-r", "-z", "--full-tree", sourceCommit, "--", entry],
      { binary: true },
    );
    const matches = parseLsTree(result.stdout, entry);

    if (matches.length === 0) {
      fail(`manifest entry matches no upstream file at ${sourceCommit}: ${entry}`);
    }

    for (const match of matches) {
      const existing = byPath.get(match.sourcePath);
      if (
        existing &&
        (existing.gitBlob !== match.gitBlob || existing.gitMode !== match.gitMode)
      ) {
        fail(`upstream path resolved inconsistently: ${match.sourcePath}`);
      }
      byPath.set(match.sourcePath, match);
    }

    return {
      entry,
      matchedSourcePaths: matches.map((match) => match.sourcePath).sort(),
    };
  });

  return {
    manifest,
    sourceFiles: [...byPath.values()].sort((left, right) =>
      left.sourcePath.localeCompare(right.sourcePath),
    ),
  };
}

function sourceBlob(sourceRepositoryPath, sourceCommit, sourcePath) {
  return runGit(sourceRepositoryPath, ["show", `${sourceCommit}:${sourcePath}`], {
    binary: true,
  }).stdout;
}

function parseOrigin(projectDirectory) {
  const origin = readUtf8(path.join(projectDirectory, "ORIGIN.md"), "ORIGIN.md");
  const field = (name) => {
    const match = origin.match(new RegExp(`\\*\\*${name}:\\*\\*\\s*\\x60([^\\x60]+)\\x60`, "u"));
    if (!match) fail(`ORIGIN.md is missing a backtick-delimited ${name} field`);
    return match[1].trim();
  };

  return {
    repository: field("Original repository"),
    commit: field("Source commit"),
  };
}

function validateProjectMetadata(projectDirectory, sourceRepository, sourceCommit) {
  for (const requiredFile of REQUIRED_PROJECT_FILES.filter((file) => file !== LOCK_FILE)) {
    if (!fs.existsSync(path.join(projectDirectory, requiredFile))) {
      fail(`missing required project file: ${requiredFile}`);
    }
  }

  const version = readUtf8(path.join(projectDirectory, "VERSION"), "VERSION").trim();
  if (!SEMVER_PATTERN.test(version)) {
    fail(`VERSION must use Semantic Versioning without a v prefix: ${version}`);
  }

  const origin = parseOrigin(projectDirectory);
  if (canonicalRepositoryUrl(origin.repository) !== canonicalRepositoryUrl(sourceRepository)) {
    fail(
      `ORIGIN.md repository does not match the export source: ${origin.repository} != ${sourceRepository}`,
    );
  }
  if (origin.commit !== sourceCommit) {
    fail(`ORIGIN.md source commit does not match the export source: ${origin.commit} != ${sourceCommit}`);
  }

  return { version, origin };
}

function lockEntry(filePath, bytes, extra = {}) {
  return {
    path: filePath,
    sha256: sha256(bytes),
    ...extra,
  };
}

function writeJsonAtomic(filePath, value) {
  const temporaryPath = `${filePath}.tmp-${process.pid}`;
  const backupPath = `${filePath}.bak-${process.pid}`;
  fs.writeFileSync(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, { flag: "wx" });
  try {
    if (fs.existsSync(filePath)) {
      fs.renameSync(filePath, backupPath);
      try {
        fs.renameSync(temporaryPath, filePath);
        fs.unlinkSync(backupPath);
      } catch (error) {
        if (fs.existsSync(backupPath) && !fs.existsSync(filePath)) {
          fs.renameSync(backupPath, filePath);
        }
        throw error;
      }
    } else {
      fs.renameSync(temporaryPath, filePath);
    }
  } finally {
    if (fs.existsSync(temporaryPath)) fs.unlinkSync(temporaryPath);
  }
}

export function buildProjectionLock({
  sourceRepositoryPath,
  sourceRepository,
  sourceCommit,
  projectDirectory,
}) {
  const resolvedProjectDirectory = path.resolve(projectDirectory);
  if (!fs.existsSync(resolvedProjectDirectory) || !fs.statSync(resolvedProjectDirectory).isDirectory()) {
    fail(`project directory does not exist: ${resolvedProjectDirectory}`);
  }

  resolveExactCommit(sourceRepositoryPath, sourceCommit);
  const { version } = validateProjectMetadata(
    resolvedProjectDirectory,
    sourceRepository,
    sourceCommit,
  );
  const manifestEntries = readManifest(path.join(resolvedProjectDirectory, MANIFEST_FILE));
  const expanded = expandManifest(sourceRepositoryPath, sourceCommit, manifestEntries);
  const upstreamByPath = new Map(
    expanded.sourceFiles.map((sourceFile) => [sourceFile.sourcePath, sourceFile]),
  );

  const inventory = listFiles(resolvedProjectDirectory);
  if (inventory.forbidden.length > 0) fail(inventory.forbidden.join("\n"));

  const payload = [];
  const control = [];
  for (const filePath of inventory.files) {
    if (filePath === LOCK_FILE) continue;

    const absolutePath = resolveInside(resolvedProjectDirectory, filePath, "project file");
    const actual = fs.readFileSync(absolutePath);
    const sourceFile = upstreamByPath.get(filePath);

    if (!sourceFile) {
      control.push(lockEntry(filePath, actual));
      continue;
    }

    const upstream = sourceBlob(sourceRepositoryPath, sourceCommit, sourceFile.sourcePath);
    if (!actual.equals(upstream)) {
      fail(
        `${filePath}: exported payload differs from upstream ${sourceCommit}:${sourceFile.sourcePath}`,
      );
    }

    payload.push(
      lockEntry(filePath, actual, {
        sourcePath: sourceFile.sourcePath,
        gitMode: sourceFile.gitMode,
        gitBlob: sourceFile.gitBlob,
      }),
    );
  }

  const lock = {
    schemaVersion: 1,
    project: {
      slug: path.basename(resolvedProjectDirectory),
      version,
    },
    source: {
      repository: sourceRepository,
      commit: sourceCommit,
    },
    manifest: expanded.manifest,
    payload: payload.sort((left, right) => left.path.localeCompare(right.path)),
    control: control.sort((left, right) => left.path.localeCompare(right.path)),
  };

  const lockPath = path.join(resolvedProjectDirectory, LOCK_FILE);
  writeJsonAtomic(lockPath, lock);
  return lock;
}

export function exportProjection({
  sourceRepositoryPath,
  sourceRepository,
  sourceCommit,
  projectDirectory,
}) {
  const resolvedProjectDirectory = path.resolve(projectDirectory);
  if (!fs.existsSync(resolvedProjectDirectory) || !fs.statSync(resolvedProjectDirectory).isDirectory()) {
    fail(`project directory does not exist: ${resolvedProjectDirectory}`);
  }

  if (fs.existsSync(path.join(resolvedProjectDirectory, LOCK_FILE))) {
    fail(`${LOCK_FILE} already exists; export into a new candidate directory`);
  }

  validateProjectMetadata(resolvedProjectDirectory, sourceRepository, sourceCommit);
  const manifestEntries = readManifest(path.join(resolvedProjectDirectory, MANIFEST_FILE));
  const expanded = expandManifest(sourceRepositoryPath, sourceCommit, manifestEntries);

  const exportPlan = expanded.sourceFiles.map((sourceFile) => {
    const destinationPath = resolveInside(
      resolvedProjectDirectory,
      sourceFile.sourcePath,
      "export destination",
    );
    if (fs.existsSync(destinationPath)) {
      fail(`export would overwrite an existing control or payload file: ${sourceFile.sourcePath}`);
    }

    return {
      destinationPath,
      sourceFile,
      bytes: sourceBlob(sourceRepositoryPath, sourceCommit, sourceFile.sourcePath),
    };
  });

  for (const { destinationPath, bytes } of exportPlan) {
    fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
    fs.writeFileSync(destinationPath, bytes, { flag: "wx" });
  }

  return buildProjectionLock({
    sourceRepositoryPath,
    sourceRepository,
    sourceCommit,
    projectDirectory: resolvedProjectDirectory,
  });
}

function assertObject(value, label) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    fail(`${label} must be an object`);
  }
  return value;
}

function assertString(value, label) {
  if (typeof value !== "string" || value.trim() === "") fail(`${label} must be a non-empty string`);
  return value;
}

function assertExactKeys(object, requiredKeys, label) {
  const actual = Object.keys(object).sort();
  const expected = [...requiredKeys].sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    fail(`${label} keys must be exactly: ${expected.join(", ")}`);
  }
}

function validateDigestEntry(entry, label, { payload = false } = {}) {
  assertObject(entry, label);
  const keys = payload
    ? ["path", "sha256", "sourcePath", "gitMode", "gitBlob"]
    : ["path", "sha256"];
  assertExactKeys(entry, keys, label);
  entry.path = assertSafeRelativePath(entry.path, `${label}.path`);
  if (!SHA256_PATTERN.test(entry.sha256)) fail(`${label}.sha256 must be a lowercase SHA-256`);

  if (payload) {
    entry.sourcePath = assertSafeRelativePath(entry.sourcePath, `${label}.sourcePath`);
    if (entry.path !== entry.sourcePath) {
      fail(`${label}: payload path remapping is not supported by the current contract`);
    }
    if (!/^[0-7]{6}$/u.test(entry.gitMode)) fail(`${label}.gitMode is invalid`);
    if (!SHA_PATTERN.test(entry.gitBlob)) fail(`${label}.gitBlob must be a lowercase Git object ID`);
  }

  return entry;
}

function validateLockShape(lock, projectDirectory) {
  assertObject(lock, LOCK_FILE);
  assertExactKeys(
    lock,
    ["schemaVersion", "project", "source", "manifest", "payload", "control"],
    LOCK_FILE,
  );
  if (lock.schemaVersion !== 1) fail(`${LOCK_FILE}.schemaVersion must be 1`);

  assertObject(lock.project, `${LOCK_FILE}.project`);
  assertExactKeys(lock.project, ["slug", "version"], `${LOCK_FILE}.project`);
  if (lock.project.slug !== path.basename(projectDirectory)) {
    fail(`${LOCK_FILE}.project.slug must match the project directory name`);
  }
  if (!SEMVER_PATTERN.test(lock.project.version)) {
    fail(`${LOCK_FILE}.project.version must use Semantic Versioning`);
  }

  assertObject(lock.source, `${LOCK_FILE}.source`);
  assertExactKeys(lock.source, ["repository", "commit"], `${LOCK_FILE}.source`);
  assertString(lock.source.repository, `${LOCK_FILE}.source.repository`);
  if (!SHA_PATTERN.test(lock.source.commit)) {
    fail(`${LOCK_FILE}.source.commit must be an exact lowercase SHA`);
  }

  if (!Array.isArray(lock.manifest) || lock.manifest.length === 0) {
    fail(`${LOCK_FILE}.manifest must be a non-empty array`);
  }
  lock.manifest = lock.manifest.map((item, index) => {
    assertObject(item, `${LOCK_FILE}.manifest[${index}]`);
    assertExactKeys(item, ["entry", "matchedSourcePaths"], `${LOCK_FILE}.manifest[${index}]`);
    item.entry = assertSafeRelativePath(item.entry, `${LOCK_FILE}.manifest[${index}].entry`);
    if (!Array.isArray(item.matchedSourcePaths) || item.matchedSourcePaths.length === 0) {
      fail(`${LOCK_FILE}.manifest[${index}].matchedSourcePaths must be non-empty`);
    }
    item.matchedSourcePaths = item.matchedSourcePaths.map((sourcePath, sourceIndex) =>
      assertSafeRelativePath(
        sourcePath,
        `${LOCK_FILE}.manifest[${index}].matchedSourcePaths[${sourceIndex}]`,
      ),
    );
    for (const sourcePath of item.matchedSourcePaths) {
      if (sourcePath !== item.entry && !sourcePath.startsWith(`${item.entry}/`)) {
        fail(
          `${LOCK_FILE}.manifest[${index}]: matched source path is outside its allowlist entry: ` +
            sourcePath,
        );
      }
    }
    return item;
  });

  if (!Array.isArray(lock.payload)) fail(`${LOCK_FILE}.payload must be an array`);
  if (!Array.isArray(lock.control)) fail(`${LOCK_FILE}.control must be an array`);
  lock.payload = lock.payload.map((entry, index) =>
    validateDigestEntry(entry, `${LOCK_FILE}.payload[${index}]`, { payload: true }),
  );
  lock.control = lock.control.map((entry, index) =>
    validateDigestEntry(entry, `${LOCK_FILE}.control[${index}]`),
  );
  return lock;
}

export function verifyProjectProjection(projectDirectory) {
  const resolvedProjectDirectory = path.resolve(projectDirectory);
  if (!fs.existsSync(resolvedProjectDirectory) || !fs.statSync(resolvedProjectDirectory).isDirectory()) {
    fail(`project directory does not exist: ${resolvedProjectDirectory}`);
  }

  for (const requiredFile of REQUIRED_PROJECT_FILES) {
    if (!fs.existsSync(path.join(resolvedProjectDirectory, requiredFile))) {
      fail(`missing required project file: ${requiredFile}`);
    }
  }

  const inventory = listFiles(resolvedProjectDirectory);
  if (inventory.forbidden.length > 0) fail(inventory.forbidden.join("\n"));
  const lock = validateLockShape(
    readJson(path.join(resolvedProjectDirectory, LOCK_FILE), LOCK_FILE),
    resolvedProjectDirectory,
  );

  const version = readUtf8(path.join(resolvedProjectDirectory, "VERSION"), "VERSION").trim();
  if (lock.project.version !== version) fail(`${LOCK_FILE} version does not match VERSION`);
  validateProjectMetadata(
    resolvedProjectDirectory,
    lock.source.repository,
    lock.source.commit,
  );

  const manifestEntries = readManifest(path.join(resolvedProjectDirectory, MANIFEST_FILE));
  const lockedManifestEntries = lock.manifest.map((item) => item.entry);
  if (JSON.stringify(manifestEntries) !== JSON.stringify(lockedManifestEntries)) {
    fail(`${LOCK_FILE} manifest entries do not match ${MANIFEST_FILE}`);
  }

  const matchedSourcePaths = new Set(lock.manifest.flatMap((item) => item.matchedSourcePaths));
  const lockedPaths = new Set();
  for (const entry of [...lock.payload, ...lock.control]) {
    if (entry.path === LOCK_FILE) fail(`${LOCK_FILE} must not record its own hash`);
    if (lockedPaths.has(entry.path)) fail(`${LOCK_FILE} contains a duplicate path: ${entry.path}`);
    lockedPaths.add(entry.path);
  }

  for (const entry of lock.payload) {
    if (!matchedSourcePaths.has(entry.sourcePath)) {
      fail(`${entry.path}: exported payload is not justified by the manifest expansion`);
    }
  }

  for (const requiredControl of REQUIRED_PROJECT_FILES.filter((file) => file !== LOCK_FILE)) {
    if (!lock.control.some((entry) => entry.path === requiredControl)) {
      fail(`${requiredControl} must be classified as Gallery-owned control metadata`);
    }
  }

  const actualPaths = inventory.files;
  const expectedPaths = [...lockedPaths, LOCK_FILE].sort();
  if (JSON.stringify(actualPaths) !== JSON.stringify(expectedPaths)) {
    const actual = new Set(actualPaths);
    const expected = new Set(expectedPaths);
    const extra = actualPaths.filter((filePath) => !expected.has(filePath));
    const missing = expectedPaths.filter((filePath) => !actual.has(filePath));
    fail(
      [
        extra.length > 0 ? `unlocked actual files: ${extra.join(", ")}` : "",
        missing.length > 0 ? `locked files missing from projection: ${missing.join(", ")}` : "",
      ]
        .filter(Boolean)
        .join("; "),
    );
  }

  for (const entry of [...lock.payload, ...lock.control]) {
    const bytes = fs.readFileSync(resolveInside(resolvedProjectDirectory, entry.path, "locked file"));
    const actualHash = sha256(bytes);
    if (actualHash !== entry.sha256) {
      fail(`${entry.path}: SHA-256 drift; expected ${entry.sha256}, got ${actualHash}`);
    }
  }

  return lock;
}

function verifyTrackedProjectionIdentity(galleryRoot, projectDirectory, lock) {
  const repositoryCheck = runGit(galleryRoot, ["rev-parse", "--is-inside-work-tree"], {
    allowFailure: true,
  });
  if (repositoryCheck.status !== 0) return;

  const projectPath = toPosix(path.relative(galleryRoot, projectDirectory));
  const trackedResult = runGit(galleryRoot, ["ls-files", "-z", "--stage", "--", projectPath], {
    binary: true,
  });
  const records = trackedResult.stdout.toString("utf8").split("\0").filter(Boolean);
  if (records.length === 0) return;

  const tracked = new Map();
  for (const record of records) {
    const tab = record.indexOf("\t");
    if (tab < 0) fail(`unexpected git ls-files output for ${projectPath}`);
    const [mode, objectId, stage] = record.slice(0, tab).split(" ");
    const filePath = record.slice(tab + 1);
    if (stage !== "0") fail(`${filePath}: unmerged index entry is not allowed`);
    tracked.set(filePath, { mode, objectId });
  }

  for (const filePath of [...lock.payload, ...lock.control, { path: LOCK_FILE }].map(
    (entry) => `${projectPath}/${entry.path}`,
  )) {
    if (!tracked.has(filePath)) fail(`${filePath}: projection file is not tracked by Gallery Git`);
  }

  for (const payload of lock.payload) {
    const filePath = `${projectPath}/${payload.path}`;
    const identity = tracked.get(filePath);
    if (identity.mode !== payload.gitMode || identity.objectId !== payload.gitBlob) {
      fail(
        `${filePath}: Gallery Git identity ${identity.mode} ${identity.objectId} ` +
          `does not match upstream ${payload.gitMode} ${payload.gitBlob}`,
      );
    }
  }
}

function loadCatalogEntries(galleryRoot) {
  const catalogDirectory = path.join(galleryRoot, "catalog", "exhibits");
  if (!fs.existsSync(catalogDirectory)) return [];

  return fs
    .readdirSync(catalogDirectory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => ({
      fileName: entry.name,
      record: readJson(path.join(catalogDirectory, entry.name), `catalog/exhibits/${entry.name}`),
    }));
}

function assertHttpsUrl(value, label) {
  assertString(value, label);
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    fail(`${label} must be an absolute URL`);
  }
  if (parsed.protocol !== "https:") fail(`${label} must use HTTPS`);
  return parsed;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function isIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

export function validateCatalogRecord(record, fileName, { galleryRoot, projectsBySlug, verifyGitRefs }) {
  assertObject(record, fileName);
  assertExactKeys(
    record,
    [
      "schemaVersion",
      "slug",
      "displayName",
      "version",
      "projectPath",
      "projectionLockSha256",
      "source",
      "gallery",
      "qualification",
      "chineseEdition",
    ],
    fileName,
  );
  if (record.schemaVersion !== 1) fail(`${fileName}.schemaVersion must be 1`);
  const slug = assertSafeRelativePath(record.slug, `${fileName}.slug`);
  if (slug.includes("/")) fail(`${fileName}.slug must be one path segment`);
  if (fileName !== `${slug}.json`) fail(`${fileName}: file name must match slug ${slug}.json`);
  assertString(record.displayName, `${fileName}.displayName`);
  if (!SEMVER_PATTERN.test(record.version)) fail(`${fileName}.version must use Semantic Versioning`);
  if (record.projectPath !== `projects/${slug}`) {
    fail(`${fileName}.projectPath must be projects/${slug}`);
  }
  if (!SHA256_PATTERN.test(record.projectionLockSha256)) {
    fail(`${fileName}.projectionLockSha256 must be a lowercase SHA-256`);
  }

  assertObject(record.source, `${fileName}.source`);
  assertExactKeys(record.source, ["repository", "commit"], `${fileName}.source`);
  assertString(record.source.repository, `${fileName}.source.repository`);
  if (!SHA_PATTERN.test(record.source.commit)) fail(`${fileName}.source.commit must be an exact SHA`);

  assertObject(record.gallery, `${fileName}.gallery`);
  assertExactKeys(record.gallery, ["commit", "tag", "releaseUrl"], `${fileName}.gallery`);
  if (!SHA_PATTERN.test(record.gallery.commit)) fail(`${fileName}.gallery.commit must be an exact SHA`);
  const expectedTag = `${slug}-v${record.version}`;
  if (record.gallery.tag !== expectedTag) fail(`${fileName}.gallery.tag must be ${expectedTag}`);
  const releaseUrl = assertHttpsUrl(record.gallery.releaseUrl, `${fileName}.gallery.releaseUrl`);
  if (
    releaseUrl.hostname !== "github.com" ||
    releaseUrl.pathname !== `/NoctilumeDev/EngineeringGallery/releases/tag/${expectedTag}`
  ) {
    fail(`${fileName}.gallery.releaseUrl must be the canonical EngineeringGallery Release URL`);
  }

  assertObject(record.qualification, `${fileName}.qualification`);
  assertExactKeys(
    record.qualification,
    ["workflow", "runId", "headSha", "conclusion"],
    `${fileName}.qualification`,
  );
  assertString(record.qualification.workflow, `${fileName}.qualification.workflow`);
  if (!/^Qualify .+/u.test(record.qualification.workflow)) {
    fail(`${fileName}.qualification.workflow must name a project qualification workflow`);
  }
  if (!Number.isInteger(record.qualification.runId) || record.qualification.runId <= 0) {
    fail(`${fileName}.qualification.runId must be a positive integer`);
  }
  if (record.qualification.headSha !== record.gallery.commit) {
    fail(`${fileName}.qualification.headSha must equal gallery.commit`);
  }
  if (record.qualification.conclusion !== "success") {
    fail(`${fileName}.qualification.conclusion must be success`);
  }

  assertObject(record.chineseEdition, `${fileName}.chineseEdition`);
  assertExactKeys(
    record.chineseEdition,
    ["url", "basedOnRelease", "sourceGalleryCommit", "editionRevision", "lastSynchronized"],
    `${fileName}.chineseEdition`,
  );
  const chineseUrl = assertHttpsUrl(record.chineseEdition.url, `${fileName}.chineseEdition.url`);
  if (
    chineseUrl.hostname !== "github.com" ||
    chineseUrl.pathname.replace(/\/$/u, "") !==
      `/NoctilumeDev/NoctilumeDev-ZH/tree/main/projects/${slug}`
  ) {
    fail(`${fileName}.chineseEdition.url must use the stable NoctilumeDev-ZH project route`);
  }
  const chineseReleasePattern = new RegExp(
    `^${escapeRegExp(slug)}-v(\\d+\\.\\d+\\.\\d+(?:-[0-9A-Za-z.-]+)?)$`,
    "u",
  );
  const chineseReleaseMatch = record.chineseEdition.basedOnRelease.match(chineseReleasePattern);
  if (!chineseReleaseMatch) {
    fail(`${fileName}.chineseEdition.basedOnRelease must be a project-scoped Gallery tag`);
  }
  if (!SHA_PATTERN.test(record.chineseEdition.sourceGalleryCommit)) {
    fail(`${fileName}.chineseEdition.sourceGalleryCommit must be an exact SHA`);
  }
  if (
    !new RegExp(`^zh-v${escapeRegExp(chineseReleaseMatch[1])}-r[1-9]\\d*$`, "u").test(
      record.chineseEdition.editionRevision,
    )
  ) {
    fail(`${fileName}.chineseEdition.editionRevision does not match its source Release`);
  }
  if (!isIsoDate(record.chineseEdition.lastSynchronized)) {
    fail(`${fileName}.chineseEdition.lastSynchronized must use YYYY-MM-DD`);
  }

  const currentLock = projectsBySlug.get(slug);
  if (!currentLock) fail(`${fileName}: project directory ${record.projectPath} does not exist`);

  if (verifyGitRefs) {
    const tagResult = runGit(
      galleryRoot,
      ["rev-parse", "--verify", `refs/tags/${record.gallery.tag}^{commit}`],
      { allowFailure: true },
    );
    if (tagResult.status !== 0) fail(`${fileName}: release tag is not available locally`);
    const tagCommit = tagResult.stdout.trim();
    if (tagCommit !== record.gallery.commit) {
      fail(`${fileName}: release tag resolves to ${tagCommit}, not ${record.gallery.commit}`);
    }

    const lockAtTag = runGit(
      galleryRoot,
      ["show", `${record.gallery.tag}:${record.projectPath}/${LOCK_FILE}`],
      { binary: true, allowFailure: true },
    );
    if (lockAtTag.status !== 0) fail(`${fileName}: release tag does not contain the project lock`);
    if (sha256(lockAtTag.stdout) !== record.projectionLockSha256) {
      fail(`${fileName}: projection lock digest does not match the released tag`);
    }

    let releasedLock;
    try {
      releasedLock = JSON.parse(lockAtTag.stdout.toString("utf8"));
    } catch (error) {
      fail(`${fileName}: released projection lock is invalid JSON: ${error.message}`);
    }
    if (
      releasedLock.project?.slug !== slug ||
      releasedLock.project?.version !== record.version ||
      canonicalRepositoryUrl(releasedLock.source?.repository ?? "") !==
        canonicalRepositoryUrl(record.source.repository) ||
      releasedLock.source?.commit !== record.source.commit
    ) {
      fail(`${fileName}: catalog identity does not match the released projection lock`);
    }

    const chineseTagResult = runGit(
      galleryRoot,
      ["rev-parse", "--verify", `refs/tags/${record.chineseEdition.basedOnRelease}^{commit}`],
      { allowFailure: true },
    );
    if (chineseTagResult.status !== 0) {
      fail(`${fileName}: Chinese edition source tag is not available locally`);
    }
    const chineseSourceCommit = chineseTagResult.stdout.trim();
    if (chineseSourceCommit !== record.chineseEdition.sourceGalleryCommit) {
      fail(
        `${fileName}: Chinese edition source tag resolves to ${chineseSourceCommit}, ` +
          `not ${record.chineseEdition.sourceGalleryCommit}`,
      );
    }
  }

  return record;
}

export function verifyGalleryStructure(galleryRoot, { verifyGitRefs = true } = {}) {
  const root = path.resolve(galleryRoot);
  const projectsRoot = path.join(root, "projects");
  const projectDirectories = fs.existsSync(projectsRoot)
    ? fs
        .readdirSync(projectsRoot, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => path.join(projectsRoot, entry.name))
        .sort()
    : [];

  const projectsBySlug = new Map();
  for (const projectDirectory of projectDirectories) {
    const lock = verifyProjectProjection(projectDirectory);
    verifyTrackedProjectionIdentity(root, projectDirectory, lock);
    projectsBySlug.set(lock.project.slug, lock);
  }

  const catalogFiles = loadCatalogEntries(root);
  const catalogBySlug = new Map();
  for (const { fileName, record } of catalogFiles) {
    const validated = validateCatalogRecord(record, fileName, {
      galleryRoot: root,
      projectsBySlug,
      verifyGitRefs,
    });
    if (catalogBySlug.has(validated.slug)) fail(`duplicate catalog record for ${validated.slug}`);
    catalogBySlug.set(validated.slug, validated);
  }

  let candidateCount = 0;
  for (const [slug, lock] of projectsBySlug) {
    const catalog = catalogBySlug.get(slug);
    if (!catalog) {
      candidateCount += 1;
      continue;
    }
    const currentLockBytes = fs.readFileSync(path.join(projectsRoot, slug, LOCK_FILE));
    if (sha256(currentLockBytes) !== catalog.projectionLockSha256) candidateCount += 1;
  }

  return {
    projectionCount: projectsBySlug.size,
    candidateCount,
    catalogedCount: catalogBySlug.size,
    projectsBySlug,
    catalogBySlug,
  };
}

export function readCatalogRecords(galleryRoot) {
  return loadCatalogEntries(path.resolve(galleryRoot));
}
