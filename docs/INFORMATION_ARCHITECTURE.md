# Information Architecture

## Why these surfaces are separate

A personal engineering profile can quietly accumulate several incompatible jobs: identity page, project catalog, package registry, engineering notebook, evidence store, essay collection, download center, and historical archive.

Those jobs serve different readers, use different vocabulary, and change at different rates. When one project update forces edits across a profile, diagrams, essays, downloads, and status summaries, the problem is not page length. It is change propagation across the wrong ownership boundaries.

Engineering Gallery exists to separate those responsibilities.

## Canonical owners

| Surface | Audience | Change rate | Owns |
| --- | --- | ---: | --- |
| English Profile | First-time visitors, recruiters, developers | Low | Canonical public structure, identity, stable project roles, navigation, selected thinking |
| Chinese edition | Chinese readers | Low | Chinese profile and essays at an explicit edition revision, not a live mirror |
| Gallery | Users and evaluators | Low to medium | Clean projections, downloads, run instructions, release scope |
| Project laboratories | Builders and reviewers | High | Development, exact state, tests, failures, evidence, milestone history |
| Essays | Readers | Very low | Complete arguments and their revisions |
| Releases | Users and maintainers | Medium | Versioned changes, compatibility, and fixes |
| History | Future maintainers and researchers | Append-only | Why the work reached its current shape |

## Propagation rules

### Routine product maintenance

```text
Project laboratory changes
        -> Gallery projection changes
        -> Gallery release changes

Profile unchanged
Essay unchanged
Other projects unchanged
```

### Stable role change

If a project changes what it fundamentally is, not merely what version it has, its laboratory and Gallery change first. The Profile may then update its stable description or route after the new public role is established.

### New engineering argument

An essay may be created or revised from accumulated practice. That does not make the essay the authority for project state, and it does not require a Gallery release.

## Design test

The architecture is healthy when a routine project maintenance event forces changes in only one or two explicit owners.

If a small fix again requires searching the Profile, diagrams, essay copies, download instructions, bilingual summaries, and unrelated projects, the public surface has become coupled again.

## Stable links, volatile facts

The Profile should prefer durable project roles and links over duplicated milestone counts, test totals, active branch names, or current release coordinates. Exact state belongs to the project that can verify it. Distributable state belongs to the Gallery exhibit that can reproduce it.

This keeps navigation stable without hiding the engineering record.

## Language editions

Language boundaries are repository boundaries, not duplicated sections inside one page.

- The English Profile is the canonical international public structure.
- The Chinese edition has its own revision cadence and links back to its source edition.
- Engineering Gallery is English-only.
- Project laboratories may use whichever language best preserves engineering truth.
- Technical identifiers and protocol literals such as `CI`, `CLI`, `PR`, `SHA`, `main`, `PASS`, `FAIL`, and `NOT_PROVEN` are not translated.

A language edition records the exact source revision on which it is based. It may remain at that revision until an intentional translation update is made. The model is provenance-bound eventual consistency, not strong consistency.

An older but accurately labeled edition is a valid stale read view. An edition that claims the current source revision while still describing older facts is invalid. The important property is not simultaneous updates; it is the ability to observe exactly which source Release each edition represents.

The remaining links are deliberate provenance coupling:

```text
Gallery release -> exact project origin
language edition -> exact source edition revision
Profile route -> canonical Gallery or laboratory URL
```

## G3 public-surface workstreams

G3 keeps language, navigation, and discovery separate:

- **G3A — Language and Profile Split:** establish the canonical English Profile and the independently revisioned Chinese edition.
- **G3B — Project Route Migration:** switch one project at a time only after its Gallery exhibit becomes `PROFILE_ROUTABLE`.
- **G3C — Discoverability Metadata:** align repository descriptions, GitHub Topics, and stable search vocabulary through the surface that owns each value.

G3C may run before the first real exhibit, but it does not qualify a project or authorize a Gallery route. Project laboratories own their descriptions and Topics; the Profile owns stable role wording; the Gallery owns its repository metadata and release-facing exhibit wording.

The detailed project-specific procedure and stopping rules are in [Discoverability Metadata](DISCOVERABILITY_METADATA.md).

The architectural principle is simple: **decouple ownership; preserve provenance.**
