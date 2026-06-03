export const MOCK_EXAM_PAGES = [
  {
    pageNumber: 1,
    title: 'Page 1: Basic Algebra',
    elements: [
      { type: 'text', x: 10, y: 5, content: 'MIDTERM MATHEMATICS EXAMINATION', style: 'bold 20px "Outfit", sans-serif' },
      { type: 'text', x: 10, y: 8, content: 'Course: Algebra I | Date: June 2, 2026', style: '14px "Outfit", sans-serif' },
      { type: 'text', x: 70, y: 8, content: 'Student: Alex Mercer', style: 'bold 14px "Outfit", sans-serif' },
      
      // Question 1
      { type: 'text', x: 10, y: 15, content: 'Q1. Find all real solutions to the quadratic equation: x² - 5x + 6 = 0  (5 marks)', style: 'bold 15px "Outfit", sans-serif' },
      { type: 'handwriting', x: 15, y: 22, content: 'x² - 5x + 6 = 0', style: 'italic 16px "Comic Sans MS", cursive' },
      { type: 'handwriting', x: 15, y: 26, content: '(x - 2)(x - 3) = 0', style: 'italic 16px "Comic Sans MS", cursive' },
      { type: 'handwriting', x: 15, y: 30, content: 'Therefore, x = 2 or x = 3.', style: 'italic 16px "Comic Sans MS", cursive' },
      { type: 'handwriting', x: 15, y: 35, content: 'Check: 2² - 5(2) + 6 = 4 - 10 + 6 = 0. Correct!', style: 'italic 14px "Comic Sans MS", cursive' },

      // Question 2
      { type: 'text', x: 10, y: 45, content: 'Q2. Solve the absolute value inequality: |2x - 3| < 7  (5 marks)', style: 'bold 15px "Outfit", sans-serif' },
      { type: 'handwriting', x: 15, y: 52, content: '|2x - 3| < 7', style: 'italic 16px "Comic Sans MS", cursive' },
      { type: 'handwriting', x: 15, y: 56, content: '-7 < 2x - 3 < 7', style: 'italic 16px "Comic Sans MS", cursive' },
      { type: 'handwriting', x: 15, y: 60, content: '-4 < 2x < 10', style: 'italic 16px "Comic Sans MS", cursive' },
      { type: 'handwriting', x: 15, y: 64, content: '-2 < x < 5', style: 'italic 16px "Comic Sans MS", cursive' },
      { type: 'handwriting', x: 15, y: 70, content: 'Interval notation: x ∈ (-2, 5)', style: 'italic 16px "Comic Sans MS", cursive' },
    ]
  },
  {
    pageNumber: 2,
    title: 'Page 2: Calculus Limits & Derivatives',
    elements: [
      { type: 'text', x: 10, y: 5, content: 'SECTION B: INTRODUCTION TO CALCULUS', style: 'bold 18px "Outfit", sans-serif' },
      
      // Question 3
      { type: 'text', x: 10, y: 10, content: 'Q3. Find the first derivative of the function: f(x) = 3x³ - 5x² + 2x - 9  (10 marks)', style: 'bold 15px "Outfit", sans-serif' },
      { type: 'handwriting', x: 15, y: 18, content: 'f(x) = 3x³ - 5x² + 2x - 9', style: 'italic 16px "Comic Sans MS", cursive' },
      { type: 'handwriting', x: 15, y: 23, content: 'f\'(x) = d/dx(3x³) - d/dx(5x²) + d/dx(2x) - d/dx(9)', style: 'italic 16px "Comic Sans MS", cursive' },
      { type: 'handwriting', x: 15, y: 28, content: 'f\'(x) = 9x² - 10x + 2', style: 'italic 16px "Comic Sans MS", cursive' },
      { type: 'handwriting', x: 15, y: 34, content: 'Using power rule: d/dx(x^n) = n·x^(n-1)', style: 'italic 14px "Comic Sans MS", cursive' },

      // Question 4
      { type: 'text', x: 10, y: 55, content: 'Q4. Evaluate the limit if it exists: lim (x² - 4) / (x - 2) as x → 2  (5 marks)', style: 'bold 15px "Outfit", sans-serif' },
      { type: 'handwriting', x: 15, y: 63, content: 'lim (x² - 4) / (x - 2)  [Direct substitution gives 0/0, indeterminate]', style: 'italic 15px "Comic Sans MS", cursive' },
      { type: 'handwriting', x: 15, y: 68, content: 'Factor the numerator: x² - 4 = (x - 2)(x + 2)', style: 'italic 15px "Comic Sans MS", cursive' },
      { type: 'handwriting', x: 15, y: 73, content: 'lim [ (x - 2)(x + 2) ] / (x - 2) = lim (x + 2)', style: 'italic 16px "Comic Sans MS", cursive' },
      { type: 'handwriting', x: 15, y: 78, content: '= 2 + 2 = 4', style: 'italic 16px "Comic Sans MS", cursive' },
    ]
  },
  {
    pageNumber: 3,
    title: 'Page 3: Geometry & Proofs',
    elements: [
      { type: 'text', x: 10, y: 5, content: 'SECTION C: GEOMETRIC PROOFS & TRIANGLES', style: 'bold 18px "Outfit", sans-serif' },
      
      // Question 5
      { type: 'text', x: 10, y: 10, content: 'Q5. Prove that the sum of interior angles in any triangle is 180°. (15 marks)', style: 'bold 15px "Outfit", sans-serif' },
      { type: 'drawing', x: 45, y: 22, content: 'triangle' },
      { type: 'handwriting', x: 15, y: 20, content: 'Proof:', style: 'bold italic 16px "Comic Sans MS", cursive' },
      { type: 'handwriting', x: 15, y: 25, content: '1. Draw line XY parallel to side BC through vertex A.', style: 'italic 15px "Comic Sans MS", cursive' },
      { type: 'handwriting', x: 15, y: 30, content: '2. ∠XAB + ∠BAC + ∠YAC = 180° (angles on a straight line XY).', style: 'italic 15px "Comic Sans MS", cursive' },
      { type: 'handwriting', x: 15, y: 35, content: '3. Since XY || BC, ∠XAB = ∠B and ∠YAC = ∠C (alternate interior angles).', style: 'italic 15px "Comic Sans MS", cursive' },
      { type: 'handwriting', x: 15, y: 40, content: '4. Substituting these: ∠B + ∠BAC + ∠C = 180°', style: 'italic 16px "Comic Sans MS", cursive' },
      { type: 'handwriting', x: 15, y: 45, content: '5. Therefore, ∠A + ∠B + ∠C = 180°. Q.E.D.', style: 'italic 16px "Comic Sans MS", cursive' },

      // Question 6
      { type: 'text', x: 10, y: 65, content: 'Q6. In a right-angled triangle, sides a = 3 and b = 4. Calculate hypotenuse c. (5 marks)', style: 'bold 15px "Outfit", sans-serif' },
      { type: 'handwriting', x: 15, y: 72, content: 'c² = a² + b²', style: 'italic 16px "Comic Sans MS", cursive' },
      { type: 'handwriting', x: 15, y: 76, content: 'c² = 3² + 4² = 9 + 16 = 25', style: 'italic 16px "Comic Sans MS", cursive' },
      { type: 'handwriting', x: 15, y: 80, content: 'c = √25 = 5', style: 'italic 16px "Comic Sans MS", cursive' },
    ]
  }
];

export const renderMockPage = (
  canvas,
  pageNumber,
  offset = { x: 0, y: 0, scale: 1.0 }
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;

  // Clear canvas
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);

  // Apply paper background styling (light grid lines to make it feel premium and realistic)
  ctx.strokeStyle = '#f0f3f8';
  ctx.lineWidth = 1;
  const gridSize = 25;
  for (let x = 0; x < w; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Margin line (left margin line commonly seen on exam sheets)
  ctx.strokeStyle = '#ffccd5';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(w * 0.08, 0);
  ctx.lineTo(w * 0.08, h);
  ctx.stroke();

  // Find page data
  const pageData = MOCK_EXAM_PAGES.find(p => p.pageNumber === pageNumber) || MOCK_EXAM_PAGES[0];

  // Draw content with template shift offsets and scaling
  ctx.save();
  
  // Translate based on offsets (x and y are in percentages of canvas size)
  const tx = (offset.x / 100) * w;
  const ty = (offset.y / 100) * h;
  ctx.translate(tx, ty);

  // Scale relative to center of page
  if (offset.scale !== 1.0) {
    ctx.translate(w / 2, h / 2);
    ctx.scale(offset.scale, offset.scale);
    ctx.translate(-w / 2, -h / 2);
  }

  // Draw page outline indicator if shifted
  if (offset.x !== 0 || offset.y !== 0 || offset.scale !== 1.0) {
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, w, h);
    ctx.setLineDash([]);
  }

  pageData.elements.forEach(el => {
    const px = (el.x / 100) * w;
    const py = (el.y / 100) * h;

    if (el.type === 'text') {
      ctx.fillStyle = '#1e293b'; // Slate 800
      ctx.font = el.style || '14px "Outfit", sans-serif';
      ctx.fillText(el.content, px, py);
    } else if (el.type === 'handwriting') {
      ctx.fillStyle = '#0f172a'; // Slate 900
      ctx.font = el.style || 'italic 16px "Comic Sans MS", cursive';
      ctx.fillText(el.content, px, py);
    } else if (el.type === 'drawing') {
      if (el.content === 'triangle') {
        // Draw a neat geometric diagram
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.fillStyle = '#f1f5f9';
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + 120, py);
        ctx.lineTo(px + 40, py - 80);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Draw labeling
        ctx.fillStyle = '#334155';
        ctx.font = '12px "Outfit", sans-serif';
        ctx.fillText('A', px + 35, py - 90);
        ctx.fillText('B', px - 15, py + 5);
        ctx.fillText('C', px + 125, py + 5);
        ctx.fillText('XY (parallel to BC)', px - 40, py - 90);

        // Draw parallel line through A
        ctx.strokeStyle = '#94a3b8';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(px - 50, py - 80);
        ctx.lineTo(px + 150, py - 80);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  });

  ctx.restore();
};
