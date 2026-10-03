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

An exhibit addition must:

1. bind an exact upstream commit or immutable tag;
2. define an explicit `PROJECTION_MANIFEST.txt` allowlist;
3. export ordinary files without nested Git metadata or submodules;
4. write English public documentation from verified behavior;
5. preserve upstream license and notice obligations;
6. pass `node scripts/verify-gallery.mjs`;
7. pass the documented Quick Start from a fresh Gallery clone;
8. record the run evidence in the release pull request;
9. create a project-scoped release only after merge and exact-main readback.

Use the files under [`templates/`](templates/PROJECT_README.md) as the starting contract. A placeholder directory is not an exhibit and should not be committed.

## Updating an exhibit

Every update must change `ORIGIN.md` to the new upstream coordinate when source content changes, update `VERSION`, and add a `CHANGELOG.md` entry. Re-run the fresh-clone Quick Start whenever runtime content or run instructions change.

## Root documentation changes

Root policies should change rarely. They describe ownership and qualification, not the current milestone of every project. Avoid copying volatile project state into root documents.
