import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';

export default function SaveTemplateModal({ isOpen = false, onClose }) {
  const { selectedPaper, createTemplate } = useWorkspace();
  const [templateName, setTemplateName] = useState('');
  const [examType, setExamType] = useState('');

  const handleSave = async () => {
    if (!selectedPaper) return;
    const regions = (selectedPaper.regions || []).map((region) => ({
      ...region,
      id: `tpl-region-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    }));
    const pageCount = Math.max(1, ...regions.map((region) => Number(region.page) || 1));

    await createTemplate(templateName.trim() || `${selectedPaper.studentName} Template`, pageCount, {
      regions,
      aspectRatio: selectedPaper.aspectRatio || 0.7619,
      activate: false,
    });
    setTemplateName('');
    setExamType('');
    onClose && onClose();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35">
      <div className="w-[440px] rounded-sm border border-glass bg-panel p-5 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-sm font-semibold">Save Template</h3>
            <p className="text-xs text-secondary">Save this mapping as a reusable template.</p>
          </div>
          <button className="btn btn-secondary px-2 py-1 text-xs" onClick={onClose}>x</button>
        </div>
        <label className="mb-3 block text-xs font-medium">
          Template Name
          <input value={templateName} onChange={(e) => setTemplateName(e.target.value)} className="input mt-1 w-full text-xs" placeholder="Grade 10 Maths Midterm" />
        </label>
        <label className="mb-3 block text-xs font-medium">
          Exam Type
          <input value={examType} onChange={(e) => setExamType(e.target.value)} className="input mt-1 w-full text-xs" placeholder="Midterm" />
        </label>
        <div className="mb-4 rounded-sm border border-glass bg-[#f8fafc] p-3 text-xs text-secondary">
          {(selectedPaper?.regions || []).length} regions will be saved across mapped pages.
        </div>
        <div className="flex justify-end gap-2">
          <button className="btn btn-secondary text-xs" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary text-xs" onClick={handleSave}>Save Template</button>
        </div>
      </div>
    </div>
  );
}
