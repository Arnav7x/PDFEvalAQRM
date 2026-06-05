# PDFEval

PDFEval is a manual PDF grading workspace for answer sheets and similar student submissions.

It helps an evaluator:

- upload a student PDF
- map answer regions like `Q1`, `Q2`, `Q3`
- save those mappings as reusable templates
- apply a template to another paper with a similar layout
- enter marks and feedback per question

This is not a true automatic grader. The app does not read questions semantically, detect answers on its own, or assign scores automatically. Its main value is speeding up repeated manual marking on consistently structured PDFs.

## What The App Does

- lets you draw question regions directly on a PDF
- stores regions as percentage-based boxes so they scale with the page
- adds a small buffer around new regions to better capture answer space
- supports reusable templates for recurring exam layouts
- applies templates to student papers with the same or similar layout
- warns when the paper and template aspect ratios differ noticeably
- allows per-question marks and feedback
- auto-saves grading changes in the marks panel
- supports deleting papers and user-created templates

## How It Works

### 1. Upload a paper

The frontend accepts PDF files from the browser.

### 2. Create or apply regions

You can either:

- draw question regions manually, or
- apply a saved template to the paper

### 3. Grade question-by-question

Mapped questions appear in the sidebars and marks panel. You can enter marks and feedback for each question, and the total is calculated from those saved values.

### 4. Reuse templates

If you map one paper well, you can save those regions as a template and apply them to future papers with a similar layout.

## Current Product Reality

The honest description of the app today is:

> a manual PDF marking tool with reusable region templates

That is real and working.

The older-sounding pitch of "auto question mapping" is only partially true. The app can reuse previously mapped regions, but it does not independently discover where questions are in a new document.

## Tech Stack

- React 19
- Vite
- React Router
- PDF.js
- Lucide React
- Jest

## Storage Model

The app is built to use a backend API, but the frontend currently falls back to browser `localStorage` when the API is unavailable.

That means:

- the app works locally without the backend running
- data persists in the browser
- storage is local to the browser/profile you used

## Frontend Setup

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run tests:

```bash
npm test -- --runInBand
```

## Optional Backend

There is also a FastAPI backend prototype in [`backend/main.py`](./backend/main.py).

Install backend dependencies:

```bash
pip install -r backend/requirements.txt
```

Run the API:

```bash
python backend/main.py
```

Important note:

- the backend is currently configured for PostgreSQL
- the frontend still includes local-storage fallback behavior
- the backend and frontend are not yet documented as a fully production-ready deployment setup

## Main Screens

- `Dashboard`: entry point for recent templates and evaluations
- `Upload`: upload a student PDF
- `Mapping Workspace`: create or edit question regions
- `Evaluation Workspace`: enter marks and feedback
- `Template Library`: browse, preview, apply, and delete templates
- `Template Preview`: inspect template regions directly

## PDF Expectations

The app can open PDFs, but grading only makes sense when the PDF behaves like a student answer document.

Best results come from:

- answer sheets with a stable layout
- scanned papers with clear page structure
- papers that closely match an existing template

Poor fit:

- random PDFs
- notes, slides, or handouts
- documents where answer positions vary wildly from paper to paper

## Known Limitations

- no automatic question discovery
- no authentication or user accounts
- no server-side file storage workflow
- no conflict handling for multi-user editing
- backend API shape is still basic
- PDF preview for templates uses the generic document workspace rather than a source exam PDF

## Recent Improvements

- fixed grade totals being overwritten during save
- replaced the old manual submit button with autosave in grading
- cleaned up grades when mapped regions are deleted
- added bounded coordinate utilities for safer region placement
- added template delete actions in the main template views
- fixed the template `Preview` button by adding a dedicated template preview route

## Project Scripts

- `npm run dev`: start frontend dev server
- `npm run build`: build frontend
- `npm run preview`: preview production build
- `npm run lint`: run ESLint
- `npm test`: run Jest tests
- `npm run test:watch`: run tests in watch mode
