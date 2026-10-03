# Catalog Records

This directory contains one `<project-slug>.json` record per cataloged exhibit.

A project directory without a matching record is a projection candidate, not a cataloged exhibit. A project may also have a newer active candidate while this directory continues to point to its last published release.

Public navigation uses the immutable Release or tag recorded here. It does not treat the mutable `main/projects/<slug>` directory as released merely because the directory is present.

Use [`templates/CATALOG_ENTRY.json`](../../templates/CATALOG_ENTRY.json) as a shape reference. The verifier checks the released tag, projection-lock digest, qualification run identity, GitHub Release, and independently versioned Chinese edition.
