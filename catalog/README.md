# Exhibit Catalog

The catalog is the public qualification index for Engineering Gallery. It is not derived from project directory names.

Current exhibit records live under [`exhibits/`](exhibits/README.md). One JSON record represents the currently cataloged release of one project. Release history remains in project-scoped Git tags, GitHub Releases, and repository history.

A catalog record is added only after:

```text
exact-main qualification run succeeds
        -> project-scoped tag and Release are created
        -> tag and Release are read back
        -> release identities are bound in the catalog record
        -> CATALOGED
        -> EN_PROFILE_ROUTABLE
```

The record does not upgrade a candidate retroactively. It makes an already published and verified release discoverable as a cataloged exhibit.

`chineseEdition` is `null` until an independently maintained Chinese page exists and passes readback. A verified language binding may be added later:

```text
CATALOGED + verified Chinese edition
        -> release the visible link in the English exhibit
        -> catalog localization binding
        -> ZH_PROFILE_ROUTABLE
```

An absent translation does not block English catalog admission. An incomplete, dead, or falsely synchronized translation cannot authorize Chinese routing. The verifier checks the immutable released README named by the catalog, not a newer candidate on mutable `main`.
