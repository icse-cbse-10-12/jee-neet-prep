# ICSE MasterClass — JEE & NEET Study Hub

A newly built, free static website that reorganises study information from the provided HTML resources into structured subject data and a shared responsive study interface. It does **not** serve the original HTML pages as the website's user interface.

## Features
- One responsive home page for five study resources.
- Search and filters on the homepage and subject pages.
- Chapter-wise campaign plans with tickable study tasks.
- Revision notes and concept-map sections for modules that contain them.
- MCQ practice with answer checking, explanations, scores and mixed quick practice.
- Browser-local completion tracking; no login, server, API key or paid service required.
- Physics progress uses its own storage namespace, separate from Chemistry.
- Keyboard focus states and reduced-motion support.

## Content organisation
- `data/biology.json` — 32 chapters, campaign tasks and 448 embedded practice questions.
- `data/chemistry-campaign.json` — 10 chapters, campaign tasks and 280 embedded practice questions.
- `data/chemistry-mcqs.json` — 17 modules and 1,700 MCQs.
- `data/maths.json` — 30 modules, revision material and 3,000 questions.
- `data/physics.json` — 28 chapters, campaign tasks and 498 embedded practice questions.

The question bank and revision points are structured from the supplied resources; the interface, navigation, interaction model and data schema are newly built. Content accuracy and full official syllabus coverage have not been independently certified. Check current official JEE/NEET syllabi and review question answers before relying on them for exam preparation.

## Publish on GitHub Pages (free)
1. Download and extract this ZIP.
2. In the repository `icse-cbse-10-12/jee-neet-prep`, upload **the contents of this folder** into the repository root (not the enclosing folder itself).
3. Commit the new files to the `main` branch.
4. Open **Settings → Pages**. Under **Build and deployment**, select **Deploy from a branch**, branch `main`, folder `/(root)`, and save.
5. When the Pages deployment finishes, open: https://icse-cbse-10-12.github.io/jee-neet-prep/

The expected structure is:
```
index.html
study.html
README.md
assets/
  app.js
  styles.css
data/
  biology.json
  chemistry-campaign.json
  chemistry-mcqs.json
  maths.json
  physics.json
```

## Test locally
Because subject data is loaded with `fetch()`, open the folder through a local static server (for example, VS Code Live Server) rather than double-clicking `index.html` as a file. GitHub Pages works as a static host.
