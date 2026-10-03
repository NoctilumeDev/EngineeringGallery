import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { readCatalogRecords } from "./lib/gallery-contract.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDirectory, "..");
const repository = process.env.GITHUB_REPOSITORY;
const token = process.env.GITHUB_TOKEN;

async function githubApi(apiPath) {
  const response = await fetch(`https://api.github.com${apiPath}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "EngineeringGallery-catalog-verifier",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) {
    throw new Error(`GitHub API ${apiPath} returned ${response.status}`);
  }
  return response.json();
}

function decodeContent(payload, label) {
  if (payload.encoding !== "base64" || typeof payload.content !== "string") {
    throw new Error(`${label} did not return base64 file content`);
  }
  return Buffer.from(payload.content.replace(/\n/gu, ""), "base64").toString("utf8");
}

if ((!repository || !token) && process.env.GITHUB_ACTIONS === "true") {
  console.error("Online catalog verification failed: GitHub Actions context is incomplete.");
  process.exit(1);
}

if (!repository || !token) {
  console.log("Online catalog verification skipped: GITHUB_REPOSITORY or GITHUB_TOKEN is unavailable.");
  process.exit(0);
}

try {
  const records = readCatalogRecords(root);
  for (const { fileName, record } of records) {
    const run = await githubApi(`/repos/${repository}/actions/runs/${record.qualification.runId}`);
    if (
      run.head_sha !== record.gallery.commit ||
      run.conclusion !== "success" ||
      run.name !== record.qualification.workflow ||
      run.head_branch !== "main" ||
      !["push", "workflow_dispatch"].includes(run.event)
    ) {
      throw new Error(
        `${fileName}: qualification run is not a successful exact-main project qualification`,
      );
    }

    const release = await githubApi(
      `/repos/${repository}/releases/tags/${encodeURIComponent(record.gallery.tag)}`,
    );
    if (release.draft || release.tag_name !== record.gallery.tag || release.html_url !== record.gallery.releaseUrl) {
      throw new Error(`${fileName}: published Release does not match the catalog record`);
    }

    const chineseReadme = await githubApi(
      `/repos/NoctilumeDev/NoctilumeDev-ZH/contents/projects/${encodeURIComponent(record.slug)}/README.md?ref=main`,
    );
    const chineseText = decodeContent(chineseReadme, `${fileName} Chinese edition`).replace(
      /[*`]/gu,
      "",
    );
    for (const expected of [
      `Source Gallery Release: ${record.chineseEdition.basedOnRelease}`,
      `Source Gallery commit: ${record.chineseEdition.sourceGalleryCommit}`,
      `Edition revision: ${record.chineseEdition.editionRevision}`,
      `Last synchronized: ${record.chineseEdition.lastSynchronized}`,
    ]) {
      if (!chineseText.includes(expected)) {
        throw new Error(`${fileName}: Chinese edition does not declare ${expected}`);
      }
    }
  }

  console.log(`Online catalog verification passed: ${records.length} cataloged exhibit(s).`);
} catch (error) {
  console.error(`Online catalog verification failed: ${error.message}`);
  process.exit(1);
}
