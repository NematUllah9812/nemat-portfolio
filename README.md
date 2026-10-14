# Nemat Ullah — portfolio redesign

A responsive, no-build portfolio site made with plain HTML, CSS, and JavaScript. Project and app screenshots and the WOFF2 font files are bundled locally under `assets/`, so the page does not depend on third-party image or font CDNs.

## Run locally

From this folder, start any static file server. For example:

```bash
python3 -m http.server 4173 --bind 0.0.0.0
```

Then open `http://localhost:4173`.

## What is included

- Editorial, high-contrast visual system with local Space Grotesk, DM Mono, and DM Serif Display fonts
- Responsive navigation, section progress, and scroll reveals
- Project showcase with live links and local screenshots
- Interactive calculator mode/screenshot selector
- Android app details and download/source links
- Playable canvas mini-game (keyboard, pointer, and touch)
- Contact form that opens a pre-filled email draft; no backend required

Font license notices are included in `assets/fonts/`. External project, repository, APK, email, and WhatsApp links intentionally point to Nemat's supplied portfolio destinations.

## Deploy to Vercel

This is a static site—there is no build step, package installation, or backend. Import the repository into Vercel, select **Other** as the framework preset, keep the build and install commands empty, and deploy from the repository root. The homepage is `index.html`; the included `vercel.json` enables clean `.html` URLs.
