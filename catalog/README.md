# Exhibit Catalog

The catalog is the public qualification index for Engineering Gallery. It is not derived from project directory names.

Current exhibit records live under [`exhibits/`](exhibits/README.md). One JSON record represents the currently cataloged release of one project. Release history remains in project-scoped Git tags, GitHub Releases, and repository history.

A catalog record is added only after:

```text
exact-main qualification run succeeds
        -> project-scoped tag and Release are created
        -> tag and Release are read back
        -> a usable Chinese edition declares its actual source Release
        -> every identity is bound in the catalog record
```

The record does not upgrade a candidate retroactively. It makes an already published and verified release discoverable as a cataloged exhibit.
