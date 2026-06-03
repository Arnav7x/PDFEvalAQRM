import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { ChevronRight, ShieldAlert, Check, GraduationCap } from 'lucide-react';

export const RightSidebar = () => {
  const {
    selectedTemplate,
    selectedPaper,
    templates,
    applyTemplate,
    addRegion,
    removeRegion,
    highlightedRegionId,
    setHighlightedRegionId,
    selectedArea,
    setSelectedArea,
    updateOffset,
    saveGrade,
    currentPage,
    mode,
    setMode
  } = useWorkspace();

  const [activeTab, setActiveTab] = useState('questions');
  const [activeGradeQ, setActiveGradeQ] = useState(null);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [selectedAreaName, setSelectedAreaName] = useState('');

  const selectedRegion = selectedTemplate
    ? (selectedTemplate.regions || []).find(r => r.id === highlightedRegionId)
    : selectedPaper
      ? (selectedPaper.regions || []).find(r => r.id === highlightedRegionId)
      : null;

  const allActiveRegions = selectedTemplate
    ? (selectedTemplate.regions || [])
    : selectedPaper
      ? (selectedPaper.regions || [])
      : [];

  useEffect(() => {
    if (!selectedArea) {
      setSelectedAreaName('');
      return;
    }

    const nextQuestionNumber = allActiveRegions.length + 1;
    setSelectedAreaName(`Q${nextQuestionNumber}`);
  }, [selectedArea, allActiveRegions.length]);

  const handleSaveSelectedArea = async () => {
    if (!selectedArea || !selectedAreaName.trim()) return;

    await addRegion({
      questionNumber: selectedAreaName.trim(),
      page: selectedArea.page,
      x: selectedArea.x,
      y: selectedArea.y,
      width: selectedArea.width,
      height: selectedArea.height
    });

    setSelectedAreaName('');
  };

  const renderSelectedRegionPanel = (grade) => (
    <div
      className="glass-panel"
      style={{
        padding: '12px',
        background: 'rgba(255,255,255,0.01)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>
            {selectedRegion ? 'Selected Region' : selectedArea ? 'Selected Area' : 'Selection'}
          </div>
          <div style={{ fontSize: '15px', fontWeight: '700', color: 'white' }}>
            {selectedRegion?.questionNumber || (selectedArea ? `Page ${selectedArea.page}` : 'None')}
          </div>
        </div>
        {(selectedRegion || selectedArea) && (
          <button
            onClick={() => {
              setHighlightedRegionId(null);
              setSelectedArea(null);
            }}
            className="btn-ghost"
            style={{ padding: '4px 8px', fontSize: '11px' }}
          >
            Clear
          </button>
        )}
      </div>

      {selectedRegion ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
            <div style={{ border: '1px solid var(--border-glass)', padding: '8px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Page</div>
              <div style={{ fontSize: '13px', fontWeight: '600' }}>Page {selectedRegion.page}</div>
            </div>
            <div style={{ border: '1px solid var(--border-glass)', padding: '8px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Bounds</div>
              <div style={{ fontSize: '13px', fontWeight: '600' }}>
                {Math.round(selectedRegion.width)}% x {Math.round(selectedRegion.height)}%
              </div>
            </div>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            Position: x {selectedRegion.x.toFixed(1)}%, y {selectedRegion.y.toFixed(1)}%
          </div>
          {grade && (
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Current grade: <span style={{ color: 'var(--emerald)', fontWeight: '700' }}>{grade.score} pts</span>
            </div>
          )}
        </>
      ) : selectedArea ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
            <div style={{ border: '1px solid var(--border-glass)', padding: '8px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Page</div>
              <div style={{ fontSize: '13px', fontWeight: '600' }}>Page {selectedArea.page}</div>
            </div>
            <div style={{ border: '1px solid var(--border-glass)', padding: '8px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Bounds</div>
              <div style={{ fontSize: '13px', fontWeight: '600' }}>
                {Math.round(selectedArea.width)}% x {Math.round(selectedArea.height)}%
              </div>
            </div>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            Position: x {selectedArea.x.toFixed(1)}%, y {selectedArea.y.toFixed(1)}%
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: '600' }}>
              Region Name
            </label>
            <input
              type="text"
              value={selectedAreaName}
              onChange={(e) => setSelectedAreaName(e.target.value)}
              placeholder="e.g. Q1"
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleSaveSelectedArea}
              className="btn-primary"
              style={{ flex: 1, justifyContent: 'center' }}
              disabled={!selectedAreaName.trim()}
            >
              Save
            </button>
            <button
              onClick={() => {
                setSelectedArea(null);
                setSelectedAreaName('');
              }}
              className="btn-secondary"
              style={{ flex: 1, justifyContent: 'center' }}
            >
              Delete
            </button>
          </div>
        </>
      ) : (
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
          Use <strong>Select Region</strong> to drag a snipping-style selection on the PDF, or click a mapped region from the page or list below.
        </div>
      )}
    </div>
  );

  // Auto-fill grading input when question selection changes
  useEffect(() => {
    if (!selectedPaper || !highlightedRegionId) {
      setActiveGradeQ(null);
      setScore('');
      setFeedback('');
      return;
    }
    const region = (selectedPaper.regions || []).find(r => r.id === highlightedRegionId);
    if (region) {
      setActiveGradeQ(region.questionNumber);
      const grade = (selectedPaper.grades || {})[region.questionNumber];
      setScore(grade?.score !== undefined ? String(grade.score) : '');
      setFeedback(grade?.feedback || '');
    } else {
      setActiveGradeQ(null);
      setScore('');
      setFeedback('');
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
          background: 'var(--bg-panel)',
        }}
      >
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'white' }}>{selectedTemplate.name}</h2>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Template Mapping Mode</span>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {renderSelectedRegionPanel()}
          <h3 style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Mapped Regions ({selectedTemplate.regions.length})
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', flex: 1 }}>
            {selectedTemplate.regions.length === 0 ? (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0', border: '1px dashed var(--border-glass)' }}>
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
  const handleApplyTemplateSelect = (e) => {
    if (!e.target.value) return;
    applyTemplate(e.target.value);
  };

  const handleSaveGradeSubmit = (e) => {
    e.preventDefault();
    if (!selectedPaper || !activeGradeQ) return;
    
    saveGrade(activeGradeQ, parseFloat(score) || 0, feedback);
    
    // Automatically select the NEXT ungraded question to speed up the workflow!
    const activeRegions = selectedPaper.regions || [];
    const sorted = [...activeRegions].sort((a, b) => {
      if (a.page !== b.page) return a.page - b.page;
      return a.y - b.y;
    });
    
    const currentIndex = sorted.findIndex(r => r.questionNumber === activeGradeQ);
    const nextUngraded = sorted
      .slice(currentIndex + 1)
      .concat(sorted.slice(0, currentIndex))
      .find(r => (selectedPaper.grades || {})[r.questionNumber]?.score === undefined);
      
    if (nextUngraded) {
      setHighlightedRegionId(nextUngraded.id);
    } else {
      setHighlightedRegionId(null);
    }
  };

  if (!selectedPaper) return null;

  const pageOffset = selectedPaper.offsets?.[currentPage] || { x: 0, y: 0, scale: 1.0 };
  const totalScore = Object.values(selectedPaper.grades || {}).reduce((acc, val) => acc + (val.score || 0), 0);
  const gradedCount = Object.keys(selectedPaper.grades || {}).length;
  const selectedGrade = selectedRegion ? (selectedPaper.grades || {})[selectedRegion.questionNumber] : null;

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
        background: 'var(--bg-panel)',
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
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-glass)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>Evaluation Progress</span>
          <span style={{ fontSize: '13px', fontWeight: '500' }}>{gradedCount} / {(selectedPaper.regions || []).length} questions graded</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>Total Marks</span>
          <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--emerald)' }}>{totalScore} pts</span>
        </div>
      </div>

      {/* Template Setup Check */}
      {(selectedPaper.regions || []).length === 0 ? (
        <div
          className="glass-panel"
          style={{
            padding: '16px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-glass)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--amber)', display: 'flex', gap: '6px', alignItems: 'center' }}>
            No Regions Mapped
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            This student document has no question regions. You can either apply an existing template or create regions manually.
          </p>
          
          {/* Option 1: Apply Template */}
          <div style={{ fontSize: '11px', fontWeight: '600', color: 'white' }}>Apply Template:</div>
          <select
            onChange={handleApplyTemplateSelect}
            defaultValue=""
            style={{ width: '100%', fontSize: '12px' }}
          >
            <option value="" disabled>-- Select a template --</option>
            {templates.map(t => (
              <option key={t.id} value={t.id}>{t.name} ({t.regions.length} regions)</option>
            ))}
          </select>

          {/* Option 2: Create Manually */}
          <div style={{ fontSize: '11px', fontWeight: '600', color: 'white', marginTop: '8px' }}>Or Create Manually:</div>
          <button
            onClick={() => setMode('mapping')}
            className="btn-primary"
            style={{ fontSize: '11px', padding: '8px', justifyContent: 'center' }}
          >
            Create Regions by Drawing
          </button>
          <p style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: '1.3', marginTop: '4px' }}>
            Click and drag on the PDF to mark question regions. You can add, edit, and grade them all in one place!
          </p>
        </div>
      ) : mode === 'mapping' ? (
        // --- PAPER MAPPING MODE (Creating regions manually) ---
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
          {/* Mode indicator */}
          <div style={{ padding: '10px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: 'var(--radius-sm)', fontSize: '11px', color: 'var(--accent)' }}>
            📍 Mapping Mode - Draw question regions on the PDF
          </div>

          {/* Selected Region Panel */}
          {renderSelectedRegionPanel()}

          {/* Region List */}
          <h3 style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Mapped Regions ({selectedPaper.regions.length})
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', flex: 1 }}>
            {selectedPaper.regions.length === 0 ? (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0', border: '1px dashed var(--border-glass)' }}>
                No regions yet. Click and drag on the document to create one.
              </div>
            ) : (
              selectedPaper.regions
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

          {/* Switch to Grading Mode */}
          {selectedPaper.regions.length > 0 && (
            <button
              onClick={() => setMode('grading')}
              className="btn-secondary"
              style={{ fontSize: '11px', padding: '8px', justifyContent: 'center', marginTop: '8px' }}
            >
              Switch to Grading Mode
            </button>
          )}
        </div>
      ) : (
        // --- PAPER GRADING MODE ---
        <>
          {renderSelectedRegionPanel(selectedGrade)}
          {/* Tab Selection */}
          <div style={{ display: 'flex', gap: '2px', background: 'rgba(255,255,255,0.03)', padding: '2px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
            <button
              onClick={() => setActiveTab('questions')}
              style={{
                flex: 1,
                padding: '6px',
                fontSize: '12px',
                borderRadius: 'var(--radius-sm)',
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
                borderRadius: 'var(--radius-sm)',
                background: activeTab === 'adjustments' ? 'var(--bg-surface)' : 'transparent',
                color: activeTab === 'adjustments' ? 'white' : 'var(--text-secondary)',
              }}
            >
              Align & Add Regions
            </button>
          </div>

          {/* TAB CONTENT: ALIGNMENT ADJUSTMENTS */}
          {activeTab === 'adjustments' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                Adjust page alignment or add more regions while grading.
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

                {/* Add More Regions button */}
                <button
                  onClick={() => setMode('mapping')}
                  className="btn-primary"
                  style={{ fontSize: '11px', padding: '8px', justifyContent: 'center', marginTop: '8px' }}
                >
                  Add More Regions
                </button>
              </div>
            </div>
          )}

          {/* TAB CONTENT: QUESTIONS & GRADING */}
          {activeTab === 'questions' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
              
              {/* Question list scroll */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                {[...(selectedPaper.regions || [])]
                  .sort((a, b) => {
                    if (a.page !== b.page) return a.page - b.page;
                    return a.y - b.y;
                  })
                  .map((region) => {
                    const isSelected = highlightedRegionId === region.id;
                    const grade = (selectedPaper.grades || {})[region.questionNumber];
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
                            <span style={{ fontSize: '12px', color: 'var(--emerald)', fontWeight: 'bold', backgroundColor: 'var(--emerald-light)', padding: '2px 6px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                              {grade.score} pts
                            </span>
                          ) : (
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', border: '1px dotted var(--border-glass)', padding: '2px 6px', borderRadius: 'var(--radius-sm)' }}>
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
                  className="glass-panel"
                  style={{
                    padding: '16px',
                    background: 'var(--bg-surface)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    border: '1px solid var(--accent)',
                    boxShadow: '0 4px 12px rgba(255, 255, 255, 0.05)',
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
