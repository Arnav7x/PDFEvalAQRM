import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { FileText, Plus, FileSpreadsheet, Trash2, Upload, HelpCircle, CheckSquare } from 'lucide-react';

export const LeftSidebar: React.FC = () => {
  const {
    templates,
    selectedTemplate,
    setSelectedTemplate,
    createTemplate,
    deleteTemplate,
    papers,
    selectedPaper,
    setSelectedPaper,
    createPaper,
    deletePaper,
    setMode
  } = useWorkspace();

  const [showNewTplModal, setShowNewTplModal] = useState(false);
  const [newTplName, setNewTplName] = useState('');
  const [newTplPages, setNewTplPages] = useState(3);
  
  const [studentName, setStudentName] = useState('');

  const handleCreateTemplateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTplName.trim()) return;
    createTemplate(newTplName.trim(), newTplPages);
    setNewTplName('');
    setShowNewTplModal(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const name = studentName.trim() || file.name.split('.')[0] + ' (Student)';
    const sizeStr = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
    const url = URL.createObjectURL(file);

    createPaper(name, file.name, sizeStr, url);
    setStudentName('');
  };

  const handleLoadMockPaper = () => {
    // Check if mock paper already exists
    const mockExists = papers.some(p => p.pdfUrl === 'mock');
    if (mockExists) {
      const existing = papers.find(p => p.pdfUrl === 'mock');
      if (existing) {
        setSelectedPaper(existing);
        setSelectedTemplate(null);
        setMode('grading');
      }
      return;
    }

    createPaper(
      'Alex Mercer (Sample Grade 10 Math)',
      'alex_mercer_midterm.pdf',
      '0.45 MB',
      'mock' // Special flag for our mock renderer
    );
  };

  return (
    <div
      className="glass-panel"
      style={{
        width: '320px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '16px',
        gap: '20px',
        overflowY: 'auto',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-glass)',
        background: 'rgba(15, 23, 42, 0.5)',
      }}
    >
      {/* Brand Logo Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
        <CheckSquare size={24} style={{ color: 'var(--accent)' }} />
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.5px' }}>PDFEVal</h1>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '-3px' }}>Assisted Region Tagging</span>
        </div>
      </div>

      {/* Templates Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Question Templates
          </h2>
          <button
            onClick={() => setShowNewTplModal(true)}
            className="btn-ghost"
            style={{ padding: '4px 6px', borderRadius: '4px', fontSize: '11px' }}
          >
            <Plus size={14} /> New
          </button>
        </div>

        {showNewTplModal && (
          <form
            onSubmit={handleCreateTemplateSubmit}
            className="glass-panel"
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface)',
              marginBottom: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Create Mapping Template</div>
            <input
              type="text"
              placeholder="Template name (e.g. Calculus Quiz)"
              value={newTplName}
              onChange={(e) => setNewTplName(e.target.value)}
              style={{ fontSize: '12px', padding: '6px' }}
              required
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
              <label style={{ color: 'var(--text-secondary)' }}>Pages count:</label>
              <input
                type="number"
                min={1}
                max={20}
                value={newTplPages}
                onChange={(e) => setNewTplPages(parseInt(e.target.value) || 1)}
                style={{ width: '60px', padding: '4px 6px', fontSize: '12px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
              <button type="submit" className="btn-primary" style={{ padding: '4px 10px', fontSize: '11px', flex: 1 }}>
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowNewTplModal(false)}
                className="btn-secondary"
                style={{ padding: '4px 10px', fontSize: '11px' }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {templates.map(tpl => {
            const isActive = selectedTemplate?.id === tpl.id;
            return (
              <div
                key={tpl.id}
                onClick={() => {
                  setSelectedTemplate(tpl);
                  setSelectedPaper(null);
                  setMode('mapping');
                }}
                className={`glass-panel-hover`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: isActive ? 'var(--accent-light)' : 'rgba(255,255,255,0.02)',
                  border: isActive ? '1px solid var(--accent)' : '1px solid var(--border-glass)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                  <FileSpreadsheet size={16} style={{ color: isActive ? 'var(--accent)' : 'var(--text-secondary)', flexShrink: 0 }} />
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '13px', fontWeight: '500', display: 'block' }}>{tpl.name}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{tpl.regions.length} questions • {tpl.pageCount} pages</span>
                  </div>
                </div>
                {/* Delete button (except core mock template) */}
                {tpl.id !== 'tpl-math-101' && tpl.id !== 'tpl-physics-12' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTemplate(tpl.id);
                    }}
                    className="btn-ghost text-red"
                    style={{ padding: '4px', borderRadius: '4px' }}
                  >
                    <Trash2 size={12} style={{ color: 'var(--rose)' }} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Papers Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-glass)', paddingTop: '16px', flex: 1 }}>
        <h2 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Evaluation Papers
        </h2>

        {/* Action: Add new paper */}
        <div className="glass-panel" style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.01)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)' }}>Add Student PDF:</div>
          <input
            type="text"
            placeholder="Student Name (optional)"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            style={{ fontSize: '11px', padding: '6px' }}
          />
          <label className="btn btn-secondary" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '11px', padding: '6px', cursor: 'pointer' }}>
            <Upload size={14} /> Choose PDF Document
            <input type="file" accept=".pdf" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '4px 0', fontSize: '11px', color: 'var(--text-muted)' }}>
            — or —
          </div>

          <button onClick={handleLoadMockPaper} className="btn-primary" style={{ padding: '6px', fontSize: '11px', display: 'flex', justifyContent: 'center' }}>
            Load Demo Math Paper
          </button>
        </div>

        {/* Papers List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', flex: 1 }}>
          {papers.length === 0 ? (
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <HelpCircle size={20} />
              <span>No active papers. Load the demo paper above to test grading!</span>
            </div>
          ) : (
            papers.map(paper => {
              const isActive = selectedPaper?.id === paper.id;
              const isGraded = Object.keys(paper.grades).length === paper.regions.length && paper.regions.length > 0;
              return (
                <div
                  key={paper.id}
                  onClick={() => {
                    setSelectedPaper(paper);
                    setSelectedTemplate(null);
                    setMode('grading');
                  }}
                  className="glass-panel-hover"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: isActive ? 'var(--accent-light)' : 'rgba(255,255,255,0.02)',
                    border: isActive ? '1px solid var(--accent)' : '1px solid var(--border-glass)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                    <FileText size={16} style={{ color: isActive ? 'var(--accent)' : isGraded ? 'var(--emerald)' : 'var(--text-secondary)', flexShrink: 0 }} />
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '13px', fontWeight: '500', display: 'block' }}>{paper.studentName}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {paper.regions.length > 0 ? `${Object.keys(paper.grades).length}/${paper.regions.length} Graded` : 'No template'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePaper(paper.id);
                    }}
                    className="btn-ghost text-red"
                    style={{ padding: '4px', borderRadius: '4px' }}
                  >
                    <Trash2 size={12} style={{ color: 'var(--rose)' }} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
