# Engineering Gallery

Clean, English-first release projections of NoctilumeDev engineering projects.

> **Current status:** the G1 Gallery infrastructure is established. No real project projection or cataloged exhibit exists yet.

Engineering Gallery is the public distribution surface for projects that have reached a bounded, reproducible release state. It is designed for people who want to understand, download, and run a project without first reading its entire construction history.

This repository is not a monorepo for ongoing development and not a replacement for the original project repositories.

## What lives here

Each project projection will appear as an ordinary directory under [`projects/`](projects/README.md) and will contain:

- a clean source projection from an exact upstream coordinate;
- concise English documentation;
- a tested Quick Start;
- explicit release scope and limitations;
- origin and license provenance;
- a project-scoped version and changelog.

No Git submodules are used. A normal clone must contain the complete projection. Directory presence alone does not make that projection a qualified or cataloged exhibit.

## Information ownership

| Surface | Canonical responsibility |
| --- | --- |
| Profile | Stable identity, navigation, and selected thinking |
| Engineering Gallery | Distributable project projections and public releases |
| Project laboratories | Source development, exact project state, engineering evidence, and history |
| Essays | Long-form arguments and their own revision history |

The Gallery does not copy rapidly changing laboratory status into its root documentation. A routine project fix should normally propagate only through:

```text
canonical project fix and qualification
              -> regenerated Gallery projection
              -> fresh-clone verification
              -> project-scoped Gallery release
```

The Profile and Essays remain unchanged unless a stable project role or an argument genuinely changes.

Read the full boundary model in [Information Architecture](docs/INFORMATION_ARCHITECTURE.md).

## Reference showroom

The [Hello Gallery reference specimen](reference/hello-gallery/README.md) exercises the public reading order, visual system, responsive demo, provenance display, and language-edition route before a real project is ready.

It is a synthetic room test, not a project projection or an exhibit. Its permanent state is `REFERENCE_SPECIMEN`; it cannot receive a product Release, enter the catalog, or authorize a Profile route. The catalog therefore remains empty.

## Qualification rule

Copying files into this repository does not make a project distributable.

A project becomes a Gallery exhibit only after this sequence is complete:

```text
exact upstream commit or tag
        -> explicit projection allowlist
        -> manifest-driven clean export
        -> generated projection lock
        -> exact file-set and SHA-256 verification
        -> English public documentation
        -> fresh clone
        -> actual Quick Start run
        -> QUALIFIED_FOR_RELEASE
        -> project-scoped tag and Release
        -> catalog record
        -> CATALOGED
        -> EN_PROFILE_ROUTABLE

CATALOGED + verified Chinese edition route
        -> release the visible Gallery link
        -> catalog localization binding
        -> ZH_PROFILE_ROUTABLE
```

Until the candidate path begins, the project remains absent from `projects/`. A complete candidate projection may be present during qualification, but it is not listed as available until its Release has been read back and its catalog record is effective.

See [Projection Policy](PROJECTION_POLICY.md) and [Release Policy](RELEASE_POLICY.md) for the binding rules.

## Project catalog

The qualification authority is the set of records under [`catalog/exhibits/`](catalog/exhibits/README.md), not the number of directories under `projects/`.

Projects will be added one at a time after their source coordinate, projection integrity, documentation, licensing, fresh-clone run, Release, and catalog binding have been verified. A Chinese edition is an independently qualified language route, not a prerequisite for the English exhibit.

## Documentation language

Gallery-facing documentation is written in English. This is a release rewrite, not a literal translation: internal milestone language is converted into supported behavior, requirements, and limitations without upgrading unproven claims.

When a Chinese edition exists, the exhibit links to its independently maintained route in `NoctilumeDev-ZH`. No placeholder or dead language link is created while that edition is absent.

See [English Documentation](docs/ENGLISH_DOCUMENTATION.md).

## Repository guides

- [Exhibit Construction Guide](docs/EXHIBIT_CONSTRUCTION_GUIDE.md)
- [Information Architecture](docs/INFORMATION_ARCHITECTURE.md)
- [Discoverability Metadata](docs/DISCOVERABILITY_METADATA.md)
- [Projection Policy](PROJECTION_POLICY.md)
- [Release Policy](RELEASE_POLICY.md)
- [English Documentation](docs/ENGLISH_DOCUMENTATION.md)
- [Reference specimens](reference/README.md)
- [Contributing](CONTRIBUTING.md)

## Licensing

There is intentionally no repository-wide software license at this stage. Each exhibit must preserve and declare its own licensing and notice requirements before qualification. The absence of a root license does not grant permission to reuse project contents.
