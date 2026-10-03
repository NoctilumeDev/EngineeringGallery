# Exhibit Construction Guide

> This is a working method, not a universal recipe.
>
> It defines the boundaries that keep Engineering Gallery truthful and maintainable. It does not require every project to use the same directory shape, build system, demo form, test matrix, or qualification depth.

## 1. Purpose

Engineering Gallery turns a qualified project state into a clean, English-first public release projection.

The construction problem is not merely copying source files. A useful exhibit must let a visitor:

1. understand what the project is;
2. see a representative result;
3. download and run the released projection;
4. understand its supported boundary;
5. trace it back to its engineering source.

This guide keeps those outcomes stable across long conversations, context compression, model changes, and different project types.

It is not the authority for a project's current state. Current state must be reconstructed from the exact source repository, the exact Gallery branch or commit, active pull requests, retained qualification evidence, and published releases.

## 2. What is fixed and what is adaptable

The guide constrains the decision process. It does not prescribe one project shape.

### Fixed boundaries

Every exhibit must preserve these invariants:

- the original project repository owns source development, exact engineering state, evidence, and history;
- the Gallery owns only the contents and public documentation of a named release projection;
- an exact source commit or immutable tag is bound before export;
- exported source begins from an explicit allowlist;
- actual projection contents are mechanically inventoried and checked;
- public documentation is English and does not strengthen upstream claims;
- secrets, private environment state, nested Git metadata, and submodules are excluded;
- license and notice obligations are resolved rather than inferred;
- the documented Quick Start is executed from a fresh Gallery clone;
- a directory, passing structural check, successful runtime check, published release, catalog entry, and Profile route remain different states;
- the Profile routes to an exhibit only after the exhibit has completed its Gallery release path.

These boundaries do not become optional because a project is small.

### Project-specific decisions

Each project decides, from its own facts and risks:

- which source paths belong in the public projection;
- whether the projection contains one application, several services, firmware, a kernel image, static content, or another shape;
- which operating systems, runtimes, databases, browsers, devices, or external services are required;
- whether the best preview is a live demo, screenshots, a short recording, a replay, or no visual demo at all;
- which diagrams help a reader understand the release;
- which upstream gates are required before export;
- which fresh-clone checks establish that the public Quick Start is true;
- which limitations must be visible near the top of the exhibit;
- which release artifact formats are appropriate;
- how much engineering history should be linked without copying the laboratory into the Gallery.

Risk determines gate strength. Do not copy a heavy qualification chain from one project merely because it exists. Do not weaken a gate when a project's actual integration or safety boundary requires it.

## 3. State must not be inferred from layout

The following statements are deliberately separate:

```text
projection directory present
!= projection integrity verified
!= qualified for release
!= release published
!= catalog entry effective
!= Profile routing authorized
```

A local verifier may prove structure and content integrity. It must not call a project qualified merely because a directory exists.

The lifecycle is:

```text
PROJECTION_CANDIDATE
        -> QUALIFIED_FOR_RELEASE
        -> RELEASED
        -> CHINESE_EDITION_AVAILABLE
        -> CATALOGED
        -> PROFILE_ROUTABLE
```

An exact-main qualification run can establish `QUALIFIED_FOR_RELEASE` for one exact Gallery commit. It cannot prove that a future tag or GitHub Release already exists.

After the tag and Release are created and read back, the independently versioned Chinese edition is bound to that released coordinate. A catalog record then binds the exact Gallery commit, exact upstream coordinate, successful qualification run, project-scoped tag, published Release, and stable Chinese-edition route. Only then does the exhibit become `CATALOGED`.

The Gallery should report separate counts for project projections and cataloged exhibits. It should not compress these states into a single `qualified: true` flag.

## 4. Rebind reality before each construction round

Before changing a candidate or continuing an interrupted task, record:

- Gallery remote `main` exact SHA;
- local branch and working-tree state;
- active Gallery pull requests and checks that can affect the same files;
- original repository remote `main` or selected release branch exact SHA;
- selected source commit or immutable tag;
- source repository working-tree state;
- current upstream release, license, and supported-scope statements;
- existing Gallery projection, tag, release, and catalog record, if any;
- the last retained failed and successful qualification attempts relevant to the candidate.

Conversation text, an earlier plan, a green check from another commit, or a plausible repository milestone is not a current coordinate.

If the coordinates cannot be reconstructed, stop before export.

## 5. Write the project-specific construction record

Before copying files, write a short construction record in the pull request or its retained working notes. It should answer:

```text
Project:
Original repository:
Selected source commit or tag:
Why this coordinate is eligible for consideration:
Intended public audience:
Release scope:
Explicit exclusions:
Required environment:
Preview form:
Chinese edition location and source release:
Quick Start command and expected result:
Project-specific qualification gates:
License and notice position:
Known limitations:
Adaptations from this guide:
Current blocking facts:
Next authorized action:
```

The `Adaptations from this guide` field is important. A deviation is not automatically a defect. It must be visible, justified by project facts, and checked against the fixed boundaries.

Do not permanently copy this construction record into the released project unless it helps a user understand or operate the release. The pull request preserves the construction discussion; the exhibit preserves the release result.

## 6. Design the exhibit as two reading layers

### Layer 1: the showroom page

`projects/<slug>/README.md` is a compact public landing page. Its recommended order is:

1. **Overview** — one sentence that identifies the project and its public role, plus a visible link to the Chinese edition.
2. **Demo / Preview** — a live link, screenshots, a short recording, a replay, or an honest statement that no public demo is provided.
3. **Current Release Scope** — supported behavior, exclusions, and known limitations.
4. **Quick Start** — requirements, minimal configuration, commands, and the expected successful result.
5. **Feature & Architecture Views** — feature map, module map, architecture, data flow, service flow, or workflow diagrams that materially help.
6. **Project Evolution** — a short explanation of why the project exists and its major public release changes.
7. **Release Artifacts** — current version, release page, downloads, packages, or checksums when applicable.
8. **Origin / Provenance** — exact upstream source and Gallery projection identity.
9. **License / Notices** — project license, third-party acknowledgements, and attribution requirements.
10. **Engineering History** — links to the original laboratory, evidence, and deeper design history.

This is an information order, not a demand for ten long sections. Related items may be combined when the result remains easy to scan.

### Layer 2: supporting release documents

Longer material belongs under `docs/`, for example:

```text
docs/
├─ getting-started.md
├─ release-scope.md
├─ architecture.md
└─ evolution.md
```

Only create documents that the project needs. A single executable with a five-line Quick Start should not receive four empty documents. A distributed system may require more detailed setup and architecture material.

### Visual assets

Visuals normally live under:

```text
assets/
├─ preview/
└─ diagrams/
```

SVG is a delivery format for a diagram, not a separate information category. Prefer scalable source for diagrams and provide a convenient full-size link. Add meaningful alternative text. A raster preview may be included when GitHub rendering, mobile reading, or compatibility benefits from it.

A screenshot or demo must represent the released projection closely enough that it does not advertise unreleased behavior. Visuals explain the product; they do not independently prove backend semantics, security, reliability, or qualification.

Avoid large recordings when a few representative images communicate the same result. Never place credentials, private data, or real user information in demo assets.

## 7. Define release scope before selecting files

Write the release boundary in user language before building the allowlist:

- what a user can do in this release;
- what environment the claim assumes;
- what integrations were actually verified;
- what is intentionally absent;
- what remains laboratory-only, planned, or unproven.

Then select files that serve that boundary.

Do not start from “copy everything and clean it later.” Start from the minimum runnable and understandable release surface, then add only material whose purpose is clear.

## 8. Build a mechanically bounded projection

The intended integrity chain is:

```text
exact upstream coordinate
        -> explicit projection manifest
        -> manifest-driven export
        -> generated projection lock
        -> exact file-set and hash verification
```

`PROJECTION_MANIFEST.txt` declares the upstream files or subtrees eligible for export. It is an input allowlist, not proof of the final output.

Let:

```text
U = every file in the upstream repository
M = files matched by the manifest at the exact source coordinate
P = upstream-derived files actually exported into the projection
```

The required relationship is:

```text
P is a subset of M
```

The manifest is not required to cover `U`. Excluding laboratory history, large evidence stores, agent records, intermediate plans, and unrelated source areas is part of the Gallery's purpose.

`PROJECTION_LOCK.json` records the actual projected file inventory. The inventory has two classes:

```text
distribution payload
    upstream-derived released files

control and presentation material
    README, ORIGIN, VERSION, CHANGELOG,
    manifest, public docs, diagrams, and preview assets
```

The lock records both classes separately with content hashes and ownership information. `PROJECTION_LOCK.json` does not record its own hash; the verifier checks its presence, uniqueness, schema, and relationship to every other file. This avoids a self-referential digest.

The verifier must reject:

- an actual file absent from the lock;
- a locked file missing from the projection;
- a content hash mismatch;
- an exported upstream-derived payload file not justified by the manifest;
- a manifest entry that expands to no upstream file;
- a source identity that does not match `ORIGIN.md`.

It must not reject an upstream repository file merely because that file was intentionally excluded from the manifest and projection.

The export mechanism may differ by project, but it must produce the same traceable result. Generated binaries require an explicit decision: either exclude them and provide reproducible build instructions, or publish them as deliberate release artifacts with checksums and applicable notices.

## 9. Rewrite documentation without rewriting facts

Gallery documentation is an English release projection, not a literal translation of laboratory notes.

Convert internal stage language into:

- supported behavior;
- operating requirements;
- verified boundaries;
- known limitations;
- links to deeper engineering evidence.

Do not convert planned into supported, a test result into an unrestricted product claim, or a bounded adapter into shared authority.

Technical identifiers and protocol literals remain stable across language editions. Terms such as `CI`, `CLI`, `PR`, `SHA`, `main`, `PASS`, `FAIL`, `PENDING`, and `NOT_PROVEN` are not mechanically translated.

### Bilingual access without bilingual ownership

Every Gallery exhibit is English-only by default. Near the top of its README, it provides one visible route:

```text
中文说明 / Chinese edition
```

The default destination is the corresponding project path in `NoctilumeDev-ZH`, for example:

```text
NoctilumeDev-ZH/projects/<slug>/
```

Do not place a full Chinese mirror under `EngineeringGallery/projects/<slug>/docs/zh/`. That would make the Gallery own two language projections and reintroduce the synchronization problem that the repository boundary is intended to remove.

The Chinese page is an independently versioned edition: a materialized language view with an explicit source revision, not another writer of release facts. The consistency model is **provenance-bound eventual consistency**:

```text
English Gallery Release = canonical source
Chinese edition         = asynchronous derived view
```

Strong consistency is unnecessary. The Chinese edition may remain behind the current English Release while translation work is pending. Staleness is valid when it is observable; pretending that stale content describes a newer source Release is not.

Every Chinese exhibit begins with a status block equivalent to:

```text
Chinese edition status
Source Gallery Release: <project-slug>-v1.2.0
Source Gallery commit: <exact SHA>
Edition revision: zh-v1.2.0-r1
Last synchronized: YYYY-MM-DD
Current English exhibit: <stable URL>
```

It also records:

- the Gallery project and stable English route;
- the exact Gallery Release on which the edition is based;
- the exact Gallery commit when a finer coordinate is needed;
- its own edition revision or update date;
- a visible route back to the current English exhibit.

The first public catalog entry requires a usable Chinese edition at the declared stable route. Later English Releases do not require same-day translation, but the Chinese page must continue to state its actual base Release.

When an English Release changes facts that affect the Chinese explanation, record translation debt in the Chinese-edition repository. Updating that edition later binds it to the newer source coordinate and restores convergence. A Chinese wording correction changes only the Chinese edition and does not mutate English release facts.

In short: a delayed edition is acceptable; a falsely synchronized edition is not.

If a project requires a different Chinese-edition location, record the reason in the project-specific construction record. The separation of language ownership and the exact source-release binding remain fixed.

## 10. Validate the candidate in proportion to its risks

Every candidate requires:

- Gallery structural verification;
- projection file-set and hash verification;
- documentation link and language checks;
- secret and private-file checks appropriate to the source;
- license and notice review;
- the documented Quick Start from a fresh clone;
- confirmation of the expected observable result.

Then add project-specific checks.

Examples include a database-backed service topology, browser smoke test, multiple runtime versions, a real device, replay assets, boot validation, package installation, or an external integration sandbox. These are examples, not a universal matrix.

Tests are witnesses to the declared release boundary. They do not own the project's facts or authorize a stronger release claim.

Preserve the first meaningful failure. Classify whether it is caused by the product, the projection, the documentation, the environment, or the qualification fixture before changing anything.

## 11. Merge, read back, and publish in separate steps

The normal path is:

```text
candidate pull request
        -> candidate checks
        -> merge
        -> bind new exact Gallery main
        -> fresh-clone exact-main Quick Start
        -> QUALIFIED_FOR_RELEASE
        -> create project-scoped tag and Release
        -> read back tag and Release
        -> publish or update Chinese edition against that Release
        -> read back the stable Chinese-edition route
        -> create catalog record
        -> CATALOGED
        -> optional Profile route change
```

Candidate checks do not inherit exact-main identity. The qualification run proves that one exact commit is eligible to be released. It does not make the Release exist.

The tag and GitHub Release are created only after that run succeeds. They are then read back before the catalog record is written. The catalog verifier checks every binding before the record becomes effective.

A published Release does not automatically authorize a Profile route if the catalog record is absent or inconsistent.

Use project-scoped tags such as `<project-slug>-v1.0.0`. Laboratory milestone names remain upstream unless a user genuinely needs them to understand the release.

## 12. Catalog only completed exhibits

The root catalog is a public navigation surface, not a directory listing.

A catalog entry should bind:

- project slug and display name;
- current public version;
- project directory;
- Gallery release tag and exact commit;
- exact upstream source coordinate;
- successful exact-main qualification run;
- published release URL.
- stable Chinese-edition URL and its declared base Release.

A complete candidate directory may exist before catalog publication, but it must not be counted or described as a qualified exhibit. Empty placeholders and future-project cards remain prohibited.

## 13. Handle exceptions explicitly

When a project does not fit the recommended path:

1. identify the conflicting project fact;
2. state which part of the guide does not fit;
3. preserve all fixed boundaries;
4. choose the smallest project-specific adaptation;
5. record its effect on verification, documentation, and release claims;
6. obtain new evidence before continuing.

Examples:

- A browser-only project may need no installation artifact but still needs a reproducible preview build.
- A kernel or firmware project may require a replay or emulator rather than a live hosted demo.
- A multi-service system may require a bounded reference topology rather than promising universal deployment.
- A project without a resolved distribution license must stop before Gallery publication, even if it runs successfully.
- A project whose release requires private infrastructure may need a reduced public projection or may remain laboratory-only.

“The template does not fit” authorizes adaptation. It does not authorize silent omission.

## 14. Stop and reopen deliberately

Stop the current construction round when:

- the source coordinate changes;
- upstream qualification is incomplete or contradicted;
- license status is unclear;
- a required runtime dependency cannot be distributed or documented safely;
- the Quick Start depends on undocumented local state;
- a demo or diagram represents behavior outside the release scope;
- the projection contains undeclared files or fails its lock;
- new evidence invalidates the current release boundary;
- the next action would require a stronger claim than the evidence supports.

Do not continue merely because most of the exhibit is already written.

After resolving the blocking fact, rebind coordinates and rerun only the affected boundaries plus any downstream checks that depend on them. Do not erase the original failed attempt.

## 15. Resume safely after context loss

After a model switch, context compression, long pause, or another agent's work, do not continue from the last conversational sentence.

Reconstruct this minimum handoff:

```text
Gallery main SHA:
Working branch SHA and status:
Original repository and exact source SHA:
Candidate version:
Projection integrity state:
Quick Start qualification state:
Release/tag state:
Catalog state:
Profile route state:
Last preserved failure:
Current blocking fact:
Next authorized action:
```

Read the current policies, candidate diff, active checks, and retained outputs before accepting the handoff. If two sources disagree, stop and classify the disagreement instead of choosing the more convenient one.

The purpose of this block is not ceremony. It prevents a valid plan from being mistaken for completed work after context has moved on.

## 16. Completion criteria

An exhibit construction round is complete only when:

- the selected upstream coordinate is exact and retained;
- release scope and limitations match the upstream facts;
- the projection manifest and actual locked inventory agree;
- Gallery-owned documentation and assets are explicit;
- English documentation is usable and internally consistent;
- license and notice requirements are satisfied;
- fresh-clone Quick Start succeeds at the required environment boundary;
- exact Gallery `main` has been read back and reached `QUALIFIED_FOR_RELEASE`;
- the project-scoped tag and Release have been created and read back;
- a usable Chinese edition exists at its stable route and declares the exact Gallery Release on which it is based;
- the catalog record refers to the exact source, Gallery commit, qualification run, tag, and Release;
- the exhibit has reached `CATALOGED`;
- any Profile route change occurs only after the catalog state is effective;
- the working tree is clean and no temporary export material remains.

Completion of one exhibit does not qualify another. Each project carries its own source facts, risks, dependencies, and release boundary.

## 17. The short rule

```text
Keep the invariants.
Adapt the construction.
Bind every claim to its owner.
Let new evidence change the plan.
```

The guide should make judgment repeatable, not replace judgment.
