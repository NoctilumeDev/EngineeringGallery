# Release Policy

## Version scope

Engineering Gallery has no single product version. Each exhibit is versioned independently with Semantic Versioning:

```text
MAJOR.MINOR.PATCH
```

- `MAJOR` marks an intentionally incompatible public change.
- `MINOR` adds backward-compatible capability.
- `PATCH` repairs behavior, compatibility, packaging, or public documentation without changing the supported contract incompatibly.

Laboratory milestone names, evidence coordinates, and qualification stages remain in the original repositories. Gallery versions describe public releases.

## Tag names

Tags are project-scoped:

```text
<project-slug>-v<major>.<minor>.<patch>
```

Examples:

```text
qixu-v1.0.0
plain-journal-v1.0.1
mini-linux-v1.1.0
```

These examples define naming only; they do not claim that those releases exist.

## Release qualification

A release requires all of the following:

1. the source project has completed its own qualification at an exact commit or immutable tag;
2. `ORIGIN.md` binds that coordinate;
3. the manifest-driven export and `PROJECTION_LOCK.json` prove the projection file set and hashes;
4. required English documentation is complete and factually bounded;
5. licensing and notices are resolved;
6. the Gallery verifier passes;
7. the documented Quick Start succeeds from a fresh clone;
8. the release contents are read back from exact Gallery `main` after merge;
9. the exact-main qualification run establishes `QUALIFIED_FOR_RELEASE`;
10. the project-scoped tag and GitHub Release are created and read back;
11. a usable Chinese edition exposes the exact Gallery Release on which it is based;
12. a catalog record binds those identities and makes the exhibit public.

A successful file copy or repository CI run is not, by itself, release qualification.

The lifecycle remains explicit:

```text
PROJECTION_CANDIDATE
        -> QUALIFIED_FOR_RELEASE
        -> RELEASED
        -> CHINESE_EDITION_AVAILABLE
        -> CATALOGED
        -> PROFILE_ROUTABLE
```

The Chinese edition may intentionally lag behind the current English Release. Its catalog binding records the older source tag and commit honestly; it is not forced to pretend that eventual consistency is strong consistency.

The current project directory may also move ahead as the next candidate while the catalog remains bound to the last immutable Release. Public links follow the cataloged tag or Release until the newer candidate completes the lifecycle.

## Maintenance propagation

A routine defect follows this direction:

```text
original project fix
        -> original project qualification
        -> new exact origin coordinate
        -> regenerated Gallery projection
        -> fresh-clone Quick Start
        -> patch release
```

The Profile does not change for routine maintenance. It changes only when the project's stable public role or navigation genuinely changes.

## Release notes

Release notes should answer:

- What changed for a user?
- Are setup, data, or compatibility steps required?
- What remains intentionally unsupported?
- Which exact upstream coordinate produced this release?

Evidence history belongs upstream and may be linked when useful; it is not duplicated wholesale into release notes.
