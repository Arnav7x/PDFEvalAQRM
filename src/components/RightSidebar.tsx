import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { ChevronRight, ShieldAlert, Check, GraduationCap } from 'lucide-react';

export const RightSidebar: React.FC = () => {
  const {
    selectedTemplate,
    selectedPaper,
    templates,
    applyTemplate,
    removeRegion,
    highlightedRegionId,
    setHighlightedRegionId,
    updateOffset,
    saveGrade,
    currentPage
  } = useWorkspace();

  const [activeTab, setActiveTab] = useState<'questions' | 'adjustments'>('questions');
  const [activeGradeQ, setActiveGradeQ] = useState<string | null>(null);
  const [score, setScore] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');

  // Auto-fill grading input when question selection changes
  useEffect(() => {
    if (!selectedPaper || !highlightedRegionId) return;
    const region = selectedPaper.regions.find(r => r.id === highlightedRegionId);
    if (region) {
      setActiveGradeQ(region.questionNumber);
      const grade = selectedPaper.grades[region.questionNumber];
      setScore(grade?.score !== undefined ? String(grade.score) : '');
      setFeedback(grade?.feedback || '');
    }
  }, [highlightedRegionId, selectedPaper]);

  // If nothing is selected, show static intro instructions
  if (!selectedTemplate && !selectedPaper) {
    return (
      <div
        className="glass-panel"
        style={{
          width: '340px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: '12px',
          color: 'var(--text-secondary)',
          background: 'rgba(15, 23, 42, 0.5)',
        }}
      >
        <GraduationCap size={48} style={{ color: 'var(--accent)', opacity: 0.8 }} />
        <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '600' }}>Get Started</h3>
        <p style={{ fontSize: '13px', lineHeight: '1.6' }}>
          Select an existing question template to edit its regions, or click **"Load Demo Math Paper"** in the left sidebar to start grading.
        </p>
      </div>
    );
  }

  // --- TEMPLATE EDITING SIDEBAR ---
  if (selectedTemplate) {
    return (
      <div
        className="glass-panel"
        style={{
          width: '340px',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          padding: '16px',
          gap: '16px',
          overflowY: 'auto',
          background: 'rgba(15, 23, 42, 0.5)',
        }}
      >
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'white' }}>{selectedTemplate.name}</h2>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Template Mapping Mode</span>
        </div>

        <div className="glass-panel" style={{ padding: '12px', background: 'rgba(99, 102, 241, 0.05)', border: '1px solid var(--accent-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: 'var(--accent-hover)' }}>
            <ShieldAlert size={14} />
            How to Tag Regions:
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
            Scroll the document in the center pane and **drag a rectangle** over the answer area for each question. Give it a label (e.g. Q1) in the popup.
          </p>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h3 style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Mapped Regions ({selectedTemplate.regions.length})
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', flex: 1 }}>
            {selectedTemplate.regions.length === 0 ? (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>
                No regions drawn yet. Click and drag on the document.
              </div>
            ) : (
              selectedTemplate.regions
                .sort((a, b) => {
                  if (a.page !== b.page) return a.page - b.page;
                  return a.y - b.y;
                })
                .map((region) => {
                  const isHighlighted = highlightedRegionId === region.id;
                  return (
                    <div
                      key={region.id}
                      onClick={() => setHighlightedRegionId(region.id)}
                      className="glass-panel-hover"
                      style={{
                        padding: '10px',
                        borderRadius: 'var(--radius-sm)',
                        background: isHighlighted ? 'var(--accent-light)' : 'rgba(255,255,255,0.01)',
                        border: isHighlighted ? '1px solid var(--accent)' : '1px solid var(--border-glass)',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: 'white' }}>{region.questionNumber}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>
                          Page {region.page} • Bounds: {Math.round(region.width)}% x {Math.round(region.height)}%
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeRegion(region.id);
                        }}
                        className="btn-ghost"
                        style={{ padding: '4px', color: 'var(--rose)' }}
                      >
                        Delete
                      </button>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '12px', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
          Changes are auto-saved to template database
        </div>
      </div>
    );
  }

  // --- STUDENT PAPER GRADING SIDEBAR ---
  const handleApplyTemplateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!e.target.value) return;
    applyTemplate(e.target.value);
  };

  const handleSaveGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaper || !activeGradeQ) return;
    
    saveGrade(activeGradeQ, parseFloat(score) || 0, feedback);
    
    // Automatically select the NEXT ungraded question to speed up the workflow!
    const activeRegions = selectedPaper.regions;
    const sorted = [...activeRegions].sort((a, b) => {
      if (a.page !== b.page) return a.page - b.page;
      return a.y - b.y;
    });
    
    const currentIndex = sorted.findIndex(r => r.questionNumber === activeGradeQ);
    const nextUngraded = sorted
      .slice(currentIndex + 1)
      .concat(sorted.slice(0, currentIndex))
      .find(r => selectedPaper.grades[r.questionNumber]?.score === undefined);
      
    if (nextUngraded) {
      setHighlightedRegionId(nextUngraded.id);
    } else {
      setHighlightedRegionId(null);
    }
  };

  if (!selectedPaper) return null;

  const pageOffset = selectedPaper.offsets[currentPage] || { x: 0, y: 0, scale: 1.0 };
  const totalScore = Object.values(selectedPaper.grades).reduce((acc, val) => acc + (val.score || 0), 0);
  const gradedCount = Object.keys(selectedPaper.grades).length;

  return (
    <div
      className="glass-panel"
      style={{
        width: '340px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '16px',
        gap: '16px',
        overflowY: 'auto',
        background: 'rgba(15, 23, 42, 0.5)',
      }}
    >
      {/* Paper Header */}
      <div>
        <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'white' }}>{selectedPaper.studentName}</h2>
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>File: {selectedPaper.fileName}</span>
      </div>

      {/* Score Summary Box */}
      <div
        className="glass-panel"
        style={{
          padding: '12px 16px',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(16,185,129,0.05) 100%)',
          border: '1px solid var(--accent-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>Evaluation Progress</span>
          <span style={{ fontSize: '13px', fontWeight: '500' }}>{gradedCount} / {selectedPaper.regions.length} questions graded</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>Total Marks</span>
          <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--emerald)' }}>{totalScore} pts</span>
        </div>
      </div>

      {/* Template Setup Check */}
      {selectedPaper.regions.length === 0 ? (
        <div
          className="glass-panel"
          style={{
            padding: '16px',
            background: 'rgba(245,158,11,0.05)',
            border: '1px solid rgba(245,158,11,0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--amber)', display: 'flex', gap: '6px', alignItems: 'center' }}>
            No Template Applied
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            This student document has no question tags mapped. Choose a saved template to instantly copy its regions.
          </p>
          <select
            onChange={handleApplyTemplateSelect}
            defaultValue=""
            style={{ width: '100%', fontSize: '12px' }}
          >
            <option value="" disabled>-- Select a template to apply --</option>
            {templates.map(t => (
              <option key={t.id} value={t.id}>{t.name} ({t.regions.length} regions)</option>
            ))}
          </select>
        </div>
      ) : (
        <>
          {/* Tab Selection */}
          <div style={{ display: 'flex', gap: '2px', background: 'rgba(0,0,0,0.2)', padding: '2px', borderRadius: 'var(--radius-sm)' }}>
            <button
              onClick={() => setActiveTab('questions')}
              style={{
                flex: 1,
                padding: '6px',
                fontSize: '12px',
                borderRadius: '6px',
                background: activeTab === 'questions' ? 'var(--bg-surface)' : 'transparent',
                color: activeTab === 'questions' ? 'white' : 'var(--text-secondary)',
              }}
            >
              Questions & Grades
            </button>
            <button
              onClick={() => setActiveTab('adjustments')}
              style={{
                flex: 1,
                padding: '6px',
                fontSize: '12px',
                borderRadius: '6px',
                background: activeTab === 'adjustments' ? 'var(--bg-surface)' : 'transparent',
                color: activeTab === 'adjustments' ? 'white' : 'var(--text-secondary)',
              }}
            >
              Align Template
            </button>
          </div>

          {/* TAB CONTENT: ALIGNMENT ADJUSTMENTS */}
          {activeTab === 'adjustments' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                If this document's printed layout is shifted relative to the template, use these controls to offset the page details and align them under the regions.
              </div>
              <div className="glass-panel" style={{ padding: '12px', background: 'rgba(255,255,255,0.01)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Page {currentPage} Tuning</div>
                
                {/* Offset X Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                    <span>Horizontal Shift (X)</span>
                    <span style={{ fontFamily: 'monospace', color: 'var(--accent)' }}>{pageOffset.x}%</span>
                  </div>
                  <input
                    type="range"
                    min={-15}
                    max={15}
                    step={0.5}
                    value={pageOffset.x}
                    onChange={(e) => updateOffset(currentPage, { x: parseFloat(e.target.value) })}
                    style={{ width: '100%', accentColor: 'var(--accent)' }}
                  />
                </div>

                {/* Offset Y Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                    <span>Vertical Shift (Y)</span>
                    <span style={{ fontFamily: 'monospace', color: 'var(--accent)' }}>{pageOffset.y}%</span>
                  </div>
                  <input
                    type="range"
                    min={-15}
                    max={15}
                    step={0.5}
                    value={pageOffset.y}
                    onChange={(e) => updateOffset(currentPage, { y: parseFloat(e.target.value) })}
                    style={{ width: '100%', accentColor: 'var(--accent)' }}
                  />
                </div>

                {/* Scale Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                    <span>Scale Zoom Factor</span>
                    <span style={{ fontFamily: 'monospace', color: 'var(--accent)' }}>{Math.round(pageOffset.scale * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.8}
                    max={1.2}
                    step={0.01}
                    value={pageOffset.scale}
                    onChange={(e) => updateOffset(currentPage, { scale: parseFloat(e.target.value) })}
                    style={{ width: '100%', accentColor: 'var(--accent)' }}
                  />
                </div>

                {/* Reset button */}
                <button
                  onClick={() => updateOffset(currentPage, { x: 0, y: 0, scale: 1.0 })}
                  className="btn-secondary"
                  style={{ fontSize: '11px', padding: '6px', justifyContent: 'center' }}
                >
                  Reset Page Alignment
                </button>
              </div>
            </div>
          )}

          {/* TAB CONTENT: QUESTIONS & GRADING */}
          {activeTab === 'questions' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
              
              {/* Question list scroll */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                {[...selectedPaper.regions]
                  .sort((a, b) => {
                    if (a.page !== b.page) return a.page - b.page;
                    return a.y - b.y;
                  })
                  .map((region) => {
                    const isSelected = highlightedRegionId === region.id;
                    const grade = selectedPaper.grades[region.questionNumber];
                    const isGraded = grade?.score !== undefined;
                    
                    return (
                      <div
                        key={region.id}
                        onClick={() => setHighlightedRegionId(region.id)}
                        className="glass-panel-hover"
                        style={{
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-sm)',
                          background: isSelected ? 'var(--accent-light)' : 'rgba(255,255,255,0.01)',
                          border: isSelected ? '1px solid var(--accent)' : isGraded ? '1px solid var(--emerald-light)' : '1px solid var(--border-glass)',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <ChevronRight size={14} style={{ color: isSelected ? 'var(--accent)' : 'var(--text-muted)' }} />
                          <span style={{ fontSize: '13px', fontWeight: '600', color: 'white' }}>
                            {region.questionNumber}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>(p. {region.page})</span>
                        </div>
                        <div>
                          {isGraded ? (
                            <span style={{ fontSize: '12px', color: 'var(--emerald)', fontWeight: 'bold', backgroundColor: 'var(--emerald-light)', padding: '2px 6px', borderRadius: '4px' }}>
                              {grade.score} pts
                            </span>
                          ) : (
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', border: '1px dotted var(--border-glass)', padding: '2px 6px', borderRadius: '4px' }}>
                              Ungraded
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Grading Input Form (only displays when a question region is clicked/focused) */}
              {activeGradeQ ? (
                <form
                  onSubmit={handleSaveGradeSubmit}
                  className="glass-panel highlight-ring"
                  style={{
                    padding: '16px',
                    background: 'rgba(255,255,255,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    border: '1px solid var(--accent)',
                    boxShadow: '0 0 15px rgba(99, 102, 241, 0.1)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'white' }}>Grading: {activeGradeQ}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Region selected</span>
                  </div>

                  {/* Score input */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: '600' }}>
                      Assign Score (marks)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      value={score}
                      onChange={(e) => setScore(e.target.value)}
                      placeholder="e.g. 5"
                      style={{ width: '100%' }}
                      required
                    />
                  </div>

                  {/* Feedback text area */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: '600' }}>
                      Feedback Comments
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Add teacher review feedback..."
                      rows={3}
                      style={{ width: '100%', resize: 'none', fontSize: '12px' }}
                    />
                  </div>

                  {/* Save button */}
                  <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>
                    <Check size={16} /> Save Score & Next
                  </button>
                </form>
              ) : (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px', border: '1px dashed var(--border-glass)', borderRadius: 'var(--radius-md)' }}>
                  Click a question in the list above to jump to its page region and enter marks.
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
