# Contributing

Engineering Gallery is a release projection repository. Its contribution path follows information ownership rather than convenience.

## Where a change belongs

| Change | Correct owner |
| --- | --- |
| Product bug or source behavior | Original project repository |
| Test, engineering evidence, or exact project status | Original project repository |
| Export allowlist or release projection | Engineering Gallery |
| Gallery Quick Start or public release wording | Engineering Gallery, grounded in upstream facts |
| Stable identity or navigation | Profile repository |
| Long-form argument | Its essay source |

Do not repair a product bug only in its Gallery copy. Fix and qualify it in the original project first, then regenerate the projection from a new exact coordinate.

## Adding an exhibit

Start with the [Exhibit Construction Guide](docs/EXHIBIT_CONSTRUCTION_GUIDE.md). It defines the shared boundaries and the project-specific decisions that must be made before applying the checklist below.

An exhibit addition must:

1. bind an exact upstream commit or immutable tag;
2. define an explicit `PROJECTION_MANIFEST.txt` allowlist;
3. use the manifest-driven exporter against an exact upstream commit;
4. generate `PROJECTION_LOCK.json` and verify the exact file set and hashes;
5. write English public documentation from verified behavior;
6. preserve upstream license and notice obligations;
7. pass `npm test` and `npm run verify`;
8. pass the documented Quick Start from a fresh Gallery clone;
9. record the run evidence in the release pull request;
10. create a project-scoped release only after merge and exact-main readback;
11. add the catalog record after Release readback, using `chineseEdition: null` when no verified Chinese route exists;
12. after the independent edition passes readback, add its visible link through the normal Gallery release path and then bind that released route in the catalog.

Use the files under [`templates/`](templates/PROJECT_README.md) as the starting contract. A placeholder directory is not an exhibit and should not be committed.

The initial payload export is performed with:

```text
node scripts/export-project.mjs \
  --source-repo <local-git-checkout> \
  --source-url <canonical-repository-url> \
  --source-commit <exact-40-character-sha> \
  --project projects/<project-slug>
```

After editing only Gallery-owned documentation or visual assets, regenerate the lock with `scripts/build-projection-lock.mjs` against the same exact source coordinate.

## Updating an exhibit

Every update must change `ORIGIN.md` to the new upstream coordinate when source content changes, update `VERSION`, regenerate the projection lock, and add a `CHANGELOG.md` entry. Re-run the fresh-clone Quick Start whenever runtime content or run instructions change.

## Root documentation changes

Root policies should change rarely. They describe ownership and qualification, not the current milestone of every project. Avoid copying volatile project state into root documents.
