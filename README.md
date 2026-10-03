# Engineering Gallery

Clean, English-first release projections of NoctilumeDev engineering projects.

> **Current status:** the gallery contract and verification scaffold are established. No project has qualified as an exhibit yet.

Engineering Gallery is the public distribution surface for projects that have reached a bounded, reproducible release state. It is designed for people who want to understand, download, and run a project without first reading its entire construction history.

This repository is not a monorepo for ongoing development and not a replacement for the original project repositories.

## What lives here

Each qualified exhibit will appear as an ordinary directory under [`projects/`](projects/README.md) and will contain:

- a clean source projection from an exact upstream coordinate;
- concise English documentation;
- a tested Quick Start;
- explicit release scope and limitations;
- origin and license provenance;
- a project-scoped version and changelog.

No Git submodules are used. A normal clone must contain the complete released projection.

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

## Qualification rule

Copying files into this repository does not make a project distributable.

A project becomes a Gallery exhibit only after this sequence is complete:

```text
exact upstream commit or tag
        -> explicit projection allowlist
        -> clean export
        -> English public documentation
        -> fresh clone
        -> actual Quick Start run
        -> project-scoped release
```

Until then, the project remains absent from `projects/` and is not listed as available here.

See [Projection Policy](PROJECTION_POLICY.md) and [Release Policy](RELEASE_POLICY.md) for the binding rules.

## Project catalog

There are currently **0 qualified exhibits**.

Projects will be added one at a time after their source coordinate, export allowlist, documentation, licensing, and fresh-clone run have been verified.

## Documentation language

Gallery-facing documentation is written in English. This is a release rewrite, not a literal translation: internal milestone language is converted into supported behavior, requirements, and limitations without upgrading unproven claims.

See [English Documentation](docs/ENGLISH_DOCUMENTATION.md).

## Repository guides

- [Information Architecture](docs/INFORMATION_ARCHITECTURE.md)
- [Projection Policy](PROJECTION_POLICY.md)
- [Release Policy](RELEASE_POLICY.md)
- [English Documentation](docs/ENGLISH_DOCUMENTATION.md)
- [Contributing](CONTRIBUTING.md)

## Licensing

There is intentionally no repository-wide software license at this stage. Each exhibit must preserve and declare its own licensing and notice requirements before qualification. The absence of a root license does not grant permission to reuse project contents.
