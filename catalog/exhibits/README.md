# Catalog Records

This directory contains one `<project-slug>.json` record per cataloged exhibit.

A project directory without a matching record is a projection candidate, not a cataloged exhibit. A project may also have a newer active candidate while this directory continues to point to its last published release.

Public navigation uses the immutable Release or tag recorded here. It does not treat the mutable `main/projects/<slug>` directory as released merely because the directory is present.

Use [`templates/CATALOG_ENTRY.json`](../../templates/CATALOG_ENTRY.json) as a shape reference. Schema version 2 uses `chineseEdition: null` when no language route exists. The verifier always checks the released tag, projection-lock digest, qualification run identity, and GitHub Release; when a Chinese edition is declared, it additionally verifies that independently versioned route and its source binding.

After the independent edition passes readback, replace `null` with:

```json
{
  "url": "https://github.com/NoctilumeDev/NoctilumeDev-ZH/tree/main/projects/project-slug",
  "basedOnRelease": "project-slug-v1.0.0",
  "sourceGalleryCommit": "0000000000000000000000000000000000000000",
  "editionRevision": "zh-v1.0.0-r1",
  "lastSynchronized": "2000-01-01"
}
```

The object is all-or-nothing. A partial object does not establish `ZH_PROFILE_ROUTABLE`. The released tag bound by the same record must also contain the visible Chinese-edition link; a link that exists only in a newer candidate does not upgrade the older Release.
