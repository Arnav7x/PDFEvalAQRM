# PDFEval

PDFEval is an assisted question region mapping and grading portal designed to speed up online evaluation of scanned student papers. 

## Features

- **Minimalist Black Theme**: Clean, high-contrast monochrome design with sharp borders.
- **Landing Portal**: Simple file upload page with support for drag & drop and student naming.
- **5% Buffer Box Strategy**: Automatically adds a 5% padding buffer to drawn question regions to ensure student answers are safely captured even under minor print/scan scaling issues.
- **Smart Aspect Ratio Validation**: Automatically detects the aspect ratio of loaded student PDFs and warns the evaluator with a toast message if it deviates from the template by more than 2%.
- **Page Alignment Offsets**: Easy-to-use sliders to tune horizontal shift (X), vertical shift (Y), and scale zoom on misaligned student scans.
- **Assisted Grading**: Click a question to automatically scroll and center directly on the corresponding region. Save a score to auto-advance to the next question.

## Tech Stack

- **Frontend**: React (JavaScript) + Vite
- **PDF Rendering**: PDF.js (renders documents directly onto HTML5 `<canvas>` elements)
- **State Storage**: persistent storage in the browser's `localStorage`

## Setup & Running

Install dependencies:
```bash
npm install
```

Start the Vite development server:
```bash
npm run dev
```

Build the production assets:
```bash
npm run build
```
