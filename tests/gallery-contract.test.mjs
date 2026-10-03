import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import {
  LOCK_FILE,
  exportProjection,
  sha256,
  verifyGalleryStructure,
  verifyProjectProjection,
} from "../scripts/lib/gallery-contract.mjs";

const SOURCE_URL = "https://example.invalid/synthetic-project";

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

function git(repository, args) {
  const result = spawnSync("git", ["-C", repository, ...args], {
    encoding: "utf8",
    windowsHide: true,
  });
  if (result.status !== 0) {
    throw new Error(`git ${args.join(" ")} failed: ${result.stderr}`);
  }
  return result.stdout.trim();
}

function createFixture(t) {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "engineering-gallery-fixture-"));
  t.after(() => {
    const resolved = path.resolve(fixtureRoot);
    const temporaryRoot = path.resolve(os.tmpdir());
    assert.ok(resolved.startsWith(`${temporaryRoot}${path.sep}`));
    assert.match(path.basename(resolved), /^engineering-gallery-fixture-/u);
    fs.rmSync(resolved, { recursive: true, force: true });
  });

  const sourceRepositoryPath = path.join(fixtureRoot, "source");
  fs.mkdirSync(sourceRepositoryPath);
  git(sourceRepositoryPath, ["init", "-b", "main"]);
  git(sourceRepositoryPath, ["config", "user.name", "Gallery Fixture"]);
  git(sourceRepositoryPath, ["config", "user.email", "fixture@example.invalid"]);
  write(path.join(sourceRepositoryPath, "src", "app.txt"), "synthetic application\n");
  write(path.join(sourceRepositoryPath, "src", "config.json"), "{\"mode\":\"fixture\"}\n");
  write(path.join(sourceRepositoryPath, "history", "notes.txt"), "not for export\n");
  git(sourceRepositoryPath, ["add", "--all"]);
  git(sourceRepositoryPath, ["commit", "-m", "fixture source"]);
  const sourceCommit = git(sourceRepositoryPath, ["rev-parse", "HEAD"]);

  const galleryRoot = path.join(fixtureRoot, "gallery");
  const projectDirectory = path.join(galleryRoot, "projects", "synthetic-project");
  fs.mkdirSync(projectDirectory, { recursive: true });
  fs.mkdirSync(path.join(galleryRoot, "catalog", "exhibits"), { recursive: true });
  write(path.join(projectDirectory, "README.md"), "# Synthetic Project\n");
  write(
    path.join(projectDirectory, "ORIGIN.md"),
    `# Origin\n\n- **Original repository:** \`${SOURCE_URL}\`\n` +
      `- **Source commit:** \`${sourceCommit}\`\n` +
      "- **Source tag:** `not-applicable`\n" +
      "- **Export date:** `2000-01-01`\n" +
      "- **Gallery release:** `synthetic-project-v1.0.0`\n" +
      "- **Projection policy:** `fixture`\n",
  );
  write(path.join(projectDirectory, "VERSION"), "1.0.0\n");
  write(path.join(projectDirectory, "CHANGELOG.md"), "# Changelog\n");
  write(path.join(projectDirectory, "PROJECTION_MANIFEST.txt"), "src\n");

  const lock = exportProjection({
    sourceRepositoryPath,
    sourceRepository: SOURCE_URL,
    sourceCommit,
    projectDirectory,
  });

  return {
    fixtureRoot,
    sourceRepositoryPath,
    sourceCommit,
    galleryRoot,
    projectDirectory,
    lock,
  };
}

test("manifest-driven export copies only declared upstream paths and verifies the lock", (t) => {
  const fixture = createFixture(t);
  const verified = verifyProjectProjection(fixture.projectDirectory);

  assert.equal(verified.payload.length, 2);
  assert.equal(verified.control.length, 5);
  assert.ok(fs.existsSync(path.join(fixture.projectDirectory, "src", "app.txt")));
  assert.ok(!fs.existsSync(path.join(fixture.projectDirectory, "history", "notes.txt")));
});

test("an undeclared actual file fails projection verification", (t) => {
  const fixture = createFixture(t);
  write(path.join(fixture.projectDirectory, "rogue.txt"), "not locked\n");

  assert.throws(
    () => verifyProjectProjection(fixture.projectDirectory),
    /unlocked actual files: rogue\.txt/u,
  );
});

test("a missing locked file fails projection verification", (t) => {
  const fixture = createFixture(t);
  fs.unlinkSync(path.join(fixture.projectDirectory, "src", "app.txt"));

  assert.throws(
    () => verifyProjectProjection(fixture.projectDirectory),
    /locked files missing from projection: src\/app\.txt/u,
  );
});

test("payload hash drift fails projection verification", (t) => {
  const fixture = createFixture(t);
  write(path.join(fixture.projectDirectory, "src", "app.txt"), "mutated projection\n");

  assert.throws(
    () => verifyProjectProjection(fixture.projectDirectory),
    /src\/app\.txt: SHA-256 drift/u,
  );
});

test("the projection lock cannot record its own digest", (t) => {
  const fixture = createFixture(t);
  const lockPath = path.join(fixture.projectDirectory, LOCK_FILE);
  const lock = JSON.parse(fs.readFileSync(lockPath, "utf8"));
  lock.control.push({ path: LOCK_FILE, sha256: "0".repeat(64) });
  write(lockPath, `${JSON.stringify(lock, null, 2)}\n`);

  assert.throws(
    () => verifyProjectProjection(fixture.projectDirectory),
    /must not record its own hash/u,
  );
});

test("a lock cannot claim that a manifest entry matched an outside path", (t) => {
  const fixture = createFixture(t);
  const lockPath = path.join(fixture.projectDirectory, LOCK_FILE);
  const lock = JSON.parse(fs.readFileSync(lockPath, "utf8"));
  lock.manifest[0].matchedSourcePaths = ["history/notes.txt"];
  write(lockPath, `${JSON.stringify(lock, null, 2)}\n`);

  assert.throws(
    () => verifyProjectProjection(fixture.projectDirectory),
    /matched source path is outside its allowlist entry/u,
  );
});

test("a manifest entry that matches no upstream file fails export", (t) => {
  const fixture = createFixture(t);
  const secondProject = path.join(fixture.galleryRoot, "projects", "missing-manifest-target");
  fs.mkdirSync(secondProject);
  for (const fileName of ["README.md", "ORIGIN.md", "VERSION", "CHANGELOG.md"]) {
    fs.copyFileSync(path.join(fixture.projectDirectory, fileName), path.join(secondProject, fileName));
  }
  write(path.join(secondProject, "PROJECTION_MANIFEST.txt"), "does-not-exist\n");

  assert.throws(
    () =>
      exportProjection({
        sourceRepositoryPath: fixture.sourceRepositoryPath,
        sourceRepository: SOURCE_URL,
        sourceCommit: fixture.sourceCommit,
        projectDirectory: secondProject,
      }),
    /manifest entry matches no upstream file/u,
  );
});

test("a valid project directory is a candidate, not a cataloged exhibit", (t) => {
  const fixture = createFixture(t);
  const state = verifyGalleryStructure(fixture.galleryRoot, { verifyGitRefs: false });

  assert.deepEqual(
    {
      projectionCount: state.projectionCount,
      candidateCount: state.candidateCount,
      catalogedCount: state.catalogedCount,
    },
    { projectionCount: 1, candidateCount: 1, catalogedCount: 0 },
  );
});

test("a committed projection preserves upstream payload Git identities", (t) => {
  const fixture = createFixture(t);
  git(fixture.galleryRoot, ["init", "-b", "main"]);
  git(fixture.galleryRoot, ["config", "user.name", "Gallery Fixture"]);
  git(fixture.galleryRoot, ["config", "user.email", "fixture@example.invalid"]);
  git(fixture.galleryRoot, ["add", "--all"]);
  git(fixture.galleryRoot, ["commit", "-m", "fixture projection"]);

  const state = verifyGalleryStructure(fixture.galleryRoot, { verifyGitRefs: false });
  assert.equal(state.projectionCount, 1);
});

test("a reference specimen never enters projection or catalog counts", (t) => {
  const fixture = createFixture(t);
  write(
    path.join(fixture.galleryRoot, "reference", "hello-gallery", "index.html"),
    "<!doctype html><title>Reference specimen</title>\n",
  );

  const state = verifyGalleryStructure(fixture.galleryRoot, { verifyGitRefs: false });
  assert.deepEqual(
    {
      projectionCount: state.projectionCount,
      candidateCount: state.candidateCount,
      catalogedCount: state.catalogedCount,
    },
    { projectionCount: 1, candidateCount: 1, catalogedCount: 0 },
  );
});

test("a catalog record may expose an honestly lagging Chinese edition", (t) => {
  const fixture = createFixture(t);
  const lockBytes = fs.readFileSync(path.join(fixture.projectDirectory, LOCK_FILE));
  const galleryCommit = "2".repeat(40);
  write(
    path.join(fixture.galleryRoot, "catalog", "exhibits", "synthetic-project.json"),
    `${JSON.stringify(
      {
        schemaVersion: 1,
        slug: "synthetic-project",
        displayName: "Synthetic Project",
        version: "1.0.0",
        projectPath: "projects/synthetic-project",
        projectionLockSha256: sha256(lockBytes),
        source: {
          repository: SOURCE_URL,
          commit: fixture.sourceCommit,
        },
        gallery: {
          commit: galleryCommit,
          tag: "synthetic-project-v1.0.0",
          releaseUrl:
            "https://github.com/NoctilumeDev/EngineeringGallery/releases/tag/synthetic-project-v1.0.0",
        },
        qualification: {
          workflow: "Qualify Synthetic Exhibit",
          runId: 1,
          headSha: galleryCommit,
          conclusion: "success",
        },
        chineseEdition: {
          url: "https://github.com/NoctilumeDev/NoctilumeDev-ZH/tree/main/projects/synthetic-project",
          basedOnRelease: "synthetic-project-v0.9.0",
          sourceGalleryCommit: "1".repeat(40),
          editionRevision: "zh-v0.9.0-r1",
          lastSynchronized: "2000-01-01",
        },
      },
      null,
      2,
    )}\n`,
  );

  const state = verifyGalleryStructure(fixture.galleryRoot, { verifyGitRefs: false });
  assert.equal(state.catalogedCount, 1);
  assert.equal(state.candidateCount, 0);
});

test("a structurally forged catalog record does not qualify a candidate", (t) => {
  const fixture = createFixture(t);
  const lockBytes = fs.readFileSync(path.join(fixture.projectDirectory, LOCK_FILE));
  write(
    path.join(fixture.galleryRoot, "catalog", "exhibits", "synthetic-project.json"),
    `${JSON.stringify(
      {
        schemaVersion: 1,
        slug: "synthetic-project",
        version: "1.0.0",
        projectionLockSha256: lockBytes.toString("hex").slice(0, 64),
      },
      null,
      2,
    )}\n`,
  );

  assert.throws(
    () => verifyGalleryStructure(fixture.galleryRoot, { verifyGitRefs: false }),
    /keys must be exactly/u,
  );
});
