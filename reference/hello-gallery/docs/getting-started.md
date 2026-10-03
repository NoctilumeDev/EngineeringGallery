# Getting Started

## Direct open

Clone Engineering Gallery and open:

```text
reference/hello-gallery/demo/index.html
```

The expected result is a responsive page headed `Hello, Engineering Gallery.` with a visible `REFERENCE_SPECIMEN` marker and three cards named `Showroom`, `Distribution`, and `Control`.

## Optional local server

From `reference/hello-gallery/`, run:

```powershell
python -m http.server 4173 --directory demo
```

Then open `http://127.0.0.1:4173/`.

Python is optional; the specimen contains no server-side behavior and requires no build step.

## What this run proves

It proves only that the static specimen can be read in a browser. It does not qualify a project, validate an upstream export, create a release, or change the Gallery catalog.
