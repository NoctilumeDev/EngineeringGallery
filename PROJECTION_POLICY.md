# Projection Policy

## Purpose

Engineering Gallery publishes clean release projections from independently maintained project repositories. A projection is a traceable, intentionally reduced distribution surface. It is not a new source-of-truth fork.

## Canonical source

For product code, behavior, tests, engineering evidence, and exact project state, the original project repository remains canonical.

The Gallery is canonical only for:

- the exact contents of a Gallery release;
- English release-facing documentation;
- the public Quick Start for that projection;
- Gallery version and release notes.

If a product defect is discovered in a projection, the durable fix begins upstream. The Gallery projection is regenerated only after the upstream change has completed the source project's own qualification path.

## Required origin binding

Every exhibit must contain `ORIGIN.md` with:

- the original repository URL;
- an exact source commit and, when available, its source tag;
- the export date;
- the Gallery release identifier;
- the applied projection policy;
- any intentionally excluded source areas that affect interpretation.

A branch name alone is not an origin coordinate.

## Explicit allowlist

Every exhibit must contain `PROJECTION_MANIFEST.txt`. It lists the upstream paths intentionally included in the projection. The export process must start from this allowlist, not from a full repository copy followed by ad hoc deletion.

The allowlist protects both directions:

- required runtime material is less likely to disappear accidentally;
- construction records and unrelated internal material are less likely to leak into a release.

## Included material

A projection normally includes only what is needed to understand, build, run, and maintain the released result:

- current source code;
- required build and runtime configuration templates;
- required scripts and assets;
- concise architecture, setup, operation, and limitation documentation;
- license and notice material;
- minimal representative release evidence when it is necessary for use or verification.

## Excluded material

A projection normally excludes:

- `.git` directories and nested repositories;
- submodules;
- agent work records;
- large evidence stores and screenshot collections;
- superseded plans and intermediate design drafts;
- local secrets, credentials, and private environment files;
- build outputs and local caches unless they are deliberate release artifacts.

Exclusion does not erase history. The original repository remains the route for engineering provenance and archaeology.

## Documentation rewrite

Public English documentation is written for adoption, not copied sentence by sentence from laboratory notes. Internal milestone and qualification terms should become clear statements of:

- supported behavior;
- runtime requirements;
- verified integration boundaries;
- known limitations;
- intentionally unsupported scenarios.

The rewrite must never convert an unverified, bounded, or planned capability into a supported claim.

Source identifiers, protocol terms, domain fixtures, or user-interface strings are not mechanically renamed when doing so would alter behavior. Their meaning must instead be explained clearly in the public documentation.

## No placeholder exhibits

An empty project directory, future-project card, or copied but unverified source tree is not allowed under `projects/`. The catalog lists only qualified exhibits.
