# English Documentation

## Goal

Gallery documentation minimizes adoption friction. It is English-first, concise, and organized around what a reader can understand, run, and verify.

This is not a requirement that laboratory work be conducted in English. Original repositories may keep the language, terminology, stage identifiers, and evidence structure that best preserve engineering truth.

The Gallery does not maintain a second translated release surface. Distributable project documentation remains English-only and links back to exact engineering sources.

When an independently maintained Chinese edition exists, the project landing page provides one visible route to it, normally under `NoctilumeDev-ZH/projects/<slug>/`. The Chinese edition records the exact Gallery Release on which it is based and links back to the current English exhibit. It is not stored as a mirrored `docs/zh/` tree inside Engineering Gallery.

An English exhibit may be released, cataloged, and routed before translation exists. While no Chinese edition is available, the landing page shows no Chinese placeholder or dead link. The root Gallery adds a global Chinese-exhibit index only after that target actually exists.

When the first Chinese edition appears later, its stable link enters the English exhibit through the normal documentation patch-release path. Catalog verification reads that link from the immutable released tag, so a newer candidate cannot silently upgrade an older public Release.

The only local Chinese page is the explicitly synthetic `reference/hello-gallery/zh/` rendering fixture. It does not establish a second release surface and cannot be copied as a production language arrangement.

The two editions use provenance-bound eventual consistency. A Chinese edition may remain based on an earlier Gallery Release as long as it displays its source Release, exact source commit, edition revision, last synchronization date, and route back to the current English exhibit.

Translation delay is not claim drift. A stale edition that identifies its source is a valid derived view; an edition that claims a newer source while still describing older facts is not.

## Rewrite, do not transliterate

Laboratory language often describes how a conclusion was established. Gallery language should describe the resulting public contract.

For example, an internal note such as:

```text
M7 limited-exit qualification; native-device validation not established
```

should become a bounded release statement such as:

```text
Browser-based workflows are supported in this release.
Native-device validation is not included in the current release scope.
```

The second statement is easier to use, but it must not be stronger than the first.

## Required project document shape

Every exhibit README should answer, in this order:

1. What is the project?
2. What can the current release do?
3. What are the requirements?
4. How do I run it from a fresh clone?
5. What is intentionally out of scope?
6. Where did this projection come from?
7. Where can I inspect engineering history and evidence?

Prefer short paragraphs, direct verbs, and concrete boundaries. Explain unavoidable domain terms at first use. Keep construction-stage vocabulary in `ORIGIN.md` or upstream links unless a user needs it to run the release.

## Claim discipline

Translation and editing may improve clarity, but they may not upgrade state.

- Planned does not become supported.
- A passing test does not become an unrestricted product claim.
- A bounded integration does not become SSO or shared authority.
- A laboratory milestone does not become a public version until Gallery release qualification succeeds.

When the source evidence is ambiguous, retain the narrower statement and resolve the ambiguity upstream.

## Stable technical language

Do not translate identifiers and protocol literals that already function as shared engineering vocabulary. Examples include `CI`, `CLI`, `PR`, `SHA`, `main`, `commit`, `Evidence`, `Verdict`, `PASS`, `FAIL`, `PENDING`, and `NOT_PROVEN`.

Method terms may be explained in another language edition, but the canonical English term should remain visible. Ordinary prose should read naturally in its own language rather than follow sentence-by-sentence mirroring.
