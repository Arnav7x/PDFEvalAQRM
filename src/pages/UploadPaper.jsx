import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileUp } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

export default function UploadPaper() {
  const navigate = useNavigate();
  const { createPaper } = useWorkspace();
  const [paperName, setPaperName] = useState('');
  const [examType, setExamType] = useState('');
  const [className, setClassName] = useState('');
  const [subject, setSubject] = useState('');
  const [applyTemplate, setApplyTemplate] = useState(false);
  const [file, setFile] = useState(null);

  const handleContinue = async () => {
    if (!file) {
      alert('Select a PDF file');
      return;
    }

    const url = URL.createObjectURL(file);
    const created = await createPaper(
      paperName.trim() || file.name.replace(/\.pdf$/i, ''),
      file.name,
      `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      url
    );
    navigate(`/workspace/${created.id}`);
  };

  return (
    <div className="app-shell">
      <header className="topbar flex items-center gap-3 px-5">
        <button onClick={() => navigate(-1)} className="btn btn-secondary px-3 py-1 text-xs">
          <ArrowLeft size={14} /> Back
        </button>
        <h1 className="text-sm font-semibold">Upload New Paper</h1>
      </header>

      <main className="mx-auto grid max-w-3xl gap-3 py-8">
        <section className="rounded-sm border border-glass bg-panel p-8 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-glass bg-[#f8fafc] text-secondary">
            <FileUp size={20} />
          </div>
          <h2 className="mb-1 text-sm font-semibold">Upload PDF</h2>
          <p className="mb-4 text-xs text-secondary">Drag and drop or browse local files</p>
          <label className="btn btn-secondary mx-auto cursor-pointer text-xs">
            Browse Files
            <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" />
          </label>
          <p className="mt-3 text-xs text-secondary">{file ? file.name : 'PDF files only, max 50MB'}</p>
        </section>

        <section className="rounded-sm border border-glass bg-panel p-5">
          <h2 className="mb-4 text-sm font-semibold">Paper Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <label className="text-xs font-medium">
              Paper Name
              <input value={paperName} onChange={(e) => setPaperName(e.target.value)} className="input mt-1 w-full text-xs" placeholder="e.g. Grade 10 Maths Midterm 2026" />
            </label>
            <label className="text-xs font-medium">
              Exam Type
              <input value={examType} onChange={(e) => setExamType(e.target.value)} className="input mt-1 w-full text-xs" placeholder="Select exam type" />
            </label>
            <label className="text-xs font-medium">
              Class
              <input value={className} onChange={(e) => setClassName(e.target.value)} className="input mt-1 w-full text-xs" placeholder="Select class" />
            </label>
            <label className="text-xs font-medium">
              Subject
              <input value={subject} onChange={(e) => setSubject(e.target.value)} className="input mt-1 w-full text-xs" placeholder="Select subject" />
            </label>
          </div>
          <label className="mt-4 flex items-center gap-2 text-xs text-secondary">
            <input type="checkbox" checked={applyTemplate} onChange={(e) => setApplyTemplate(e.target.checked)} />
            Apply Existing Template
          </label>
          <div className="mt-5 flex justify-end gap-2">
            <button onClick={() => navigate('/')} className="btn btn-secondary text-xs">Cancel</button>
            <button onClick={handleContinue} className="btn btn-primary text-xs">Continue</button>
          </div>
        </section>
      </main>
    </div>
  );
}
