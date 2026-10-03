# Discoverability Metadata

> This is the G3C working agreement for repository descriptions, GitHub Topics, and stable public search vocabulary. It guides project-specific judgment; it is not a universal keyword template.

## 1. Position inside G3

G3 separates three public-surface concerns:

```text
G3A — Language and Profile Split
      English canonical Profile and provenance-bound Chinese edition

G3B — Project Route Migration
      Move one project route only after that exhibit is PROFILE_ROUTABLE

G3C — Discoverability Metadata
      Align descriptions, Topics, and stable search vocabulary with their owners
```

G3C can proceed without a real Gallery exhibit. It does not publish a project, qualify an exhibit, create a Gallery route, or change G3B authorization.

## 2. Ownership

Metadata is changed at the surface that owns it:

| Surface | Owns |
| --- | --- |
| Project laboratory | Its repository description and GitHub Topics |
| Engineering Gallery | The Gallery repository metadata and release-facing exhibit wording |
| English Profile | Stable project role and canonical navigation |
| Chinese edition | A provenance-bound Chinese explanation at its own revision cadence |

The Profile is not a central database for repository metadata. A project laboratory remains the writer for its own description and Topics. Gallery and Profile wording are downstream views and should change only when their own public contract changes.

This is deliberate coupling through provenance, not shared write ownership.

## 3. Metadata contract

For each repository, derive metadata from its current facts and intended public role.

A normal repository should have:

- one concise English description that says what the project is;
- approximately 6 to 12 stable English Topics when that many truthful search terms exist;
- a small set of consistent core terms across the description, Topics, Profile card, and Gallery exhibit when present;
- technical-stack Topics that describe material implementation choices;
- project-type Topics that help a visitor classify the repository;
- only a few engineering-characteristic Topics that are both true and useful for discovery.

The range is guidance, not a quota. A small static project may need fewer Topics. A multi-runtime system may justify more. Do not add weak terms merely to reach a number.

Prefer common GitHub search vocabulary over private milestone language. Preserve established technical identifiers such as `spring-boot`, `vue3`, `grpc`, `protobuf`, `osdev`, or `distributed-systems` when they accurately describe the repository.

## 4. Prohibited metadata

Do not use repository metadata to claim or encode:

- laboratory milestone numbers such as `M7` or `M10`;
- transient states such as `FROZEN`, a current test count, an active branch, or a one-time qualification result;
- technology that is merely planned, incidental, or absent from the public repository;
- stronger product scope than the README and release evidence support;
- generic popularity bait or unrelated search terms;
- a Gallery release, catalog state, or Profile route that has not become effective.

README prose may explain nuance. Topics are a compact discovery index, not a substitute for scope and limitations.

## 5. Project-specific selection

Before changing one repository, bind:

```text
Repository:
Exact main SHA:
Current description:
Current Topics:
Stable public role:
Material technology stack:
Project type:
Distinct engineering characteristics:
Terms intentionally excluded:
Downstream wording that may need reconciliation:
Next authorized metadata action:
```

Then choose the smallest truthful vocabulary that helps the intended reader find and classify the project.

Examples are illustrative, not preapproved registries:

```text
MiniLinux
-> osdev · operating-systems · kernel · c · x86-64 · systems-programming

PlainJournal
-> distributed-systems · e-commerce · spring-cloud · idempotency · observability

EngineeringGallery
-> release-engineering · software-distribution · reproducibility · developer-portfolio
```

Each repository must be read before using any example. Project names, current implementation, public scope, and common search language can differ.

## 6. Execution and readback

Apply G3C one repository at a time:

```text
bind exact repository state
        -> classify stable role and actual implementation
        -> propose description and Topics
        -> check for unsupported or volatile terms
        -> update metadata through the owning repository
        -> read back the public GitHub description and Topics
        -> reconcile only the downstream views whose stable wording changed
```

Do not perform a blind account-wide bulk update. A metadata change is an external repository mutation and must be checked against that repository's actual README, license position, implementation, and public boundary.

If the stable role did not change, ordinary maintenance should normally update no Profile or Gallery prose.

## 7. Completion criteria

A repository's G3C round is complete when:

- the exact repository coordinate used for the decision is recorded;
- its description names the real project type without upgrading scope;
- its Topics are truthful, stable, and useful for search;
- planned and transient claims are absent;
- the public GitHub metadata has been read back;
- any changed stable wording has been reconciled only in authorized downstream views;
- no Gallery route or qualification state changed merely because metadata improved.

The short rule is:

> README explains the project. Metadata helps the right reader discover it. Neither may outrun the evidence.
