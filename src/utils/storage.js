const TEMPLATES_KEY = 'pdf_eval_templates';
const PAPERS_KEY = 'pdf_eval_papers';

// Seed initial templates if empty
const INITIAL_TEMPLATES = [
  {
    id: 'tpl-math-101',
    name: 'Grade 10 Math Midterm Template',
    pageCount: 3,
    aspectRatio: 0.7619, // 800x1050 base size
    createdAt: new Date().toISOString(),
    regions: [
      { id: 'r1', questionNumber: 'Q1', page: 1, x: 10, y: 15, width: 80, height: 25 },
      { id: 'r2', questionNumber: 'Q2', page: 1, x: 10, y: 45, width: 80, height: 35 },
      { id: 'r3', questionNumber: 'Q3', page: 2, x: 10, y: 10, width: 80, height: 40 },
      { id: 'r4', questionNumber: 'Q4', page: 2, x: 10, y: 55, width: 80, height: 35 },
      { id: 'r5', questionNumber: 'Q5', page: 3, x: 10, y: 10, width: 80, height: 50 },
      { id: 'r6', questionNumber: 'Q6', page: 3, x: 10, y: 65, width: 80, height: 25 },
    ]
  },
  {
    id: 'tpl-physics-12',
    name: 'Physics Unit 3 Quiz Template',
    pageCount: 2,
    aspectRatio: 0.7619,
    createdAt: new Date().toISOString(),
    regions: [
      { id: 'rp1', questionNumber: 'Q1 (Multiple Choice)', page: 1, x: 8, y: 12, width: 84, height: 30 },
      { id: 'rp2', questionNumber: 'Q2 (Short Answer)', page: 1, x: 8, y: 45, width: 84, height: 45 },
      { id: 'rp3', questionNumber: 'Q3 (Long Derivation)', page: 2, x: 8, y: 10, width: 84, height: 80 },
    ]
  }
];

export const getTemplates = () => {
  const data = localStorage.getItem(TEMPLATES_KEY);
  if (!data) {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(INITIAL_TEMPLATES));
    return INITIAL_TEMPLATES;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse templates', e);
    return INITIAL_TEMPLATES;
  }
};

export const saveTemplate = (template) => {
  const templates = getTemplates();
  const index = templates.findIndex(t => t.id === template.id);
  if (index >= 0) {
    templates[index] = template;
  } else {
    templates.push(template);
  }
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
};

export const deleteTemplate = (id) => {
  const templates = getTemplates();
  const filtered = templates.filter(t => t.id !== id);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(filtered));
};

export const getPapers = () => {
  const data = localStorage.getItem(PAPERS_KEY);
  if (!data) {
    return [];
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse papers', e);
    return [];
  }
};

export const savePaper = (paper) => {
  const papers = getPapers();
  const index = papers.findIndex(p => p.id === paper.id);
  if (index >= 0) {
    papers[index] = paper;
  } else {
    papers.push(paper);
  }
  localStorage.setItem(PAPERS_KEY, JSON.stringify(papers));
};

export const deletePaper = (id) => {
  const papers = getPapers();
  const filtered = papers.filter(p => p.id !== id);
  localStorage.setItem(PAPERS_KEY, JSON.stringify(filtered));
};
