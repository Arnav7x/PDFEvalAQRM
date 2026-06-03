import React, { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { X, Check } from 'lucide-react';

export const MappingOverlay = ({ pageNumber }) => {
  const {
    selectedTemplate,
    selectedPaper,
    addRegion,
    removeRegion,
    highlightedRegionId,
    setHighlightedRegionId,
    mode
  } = useWorkspace();

  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [tempBox, setTempBox] = useState(null);
  const [showNamingModal, setShowNamingModal] = useState(null);
  const [questionName, setQuestionName] = useState('');

  // Fetch active regions for this page
  const activeRegions = selectedTemplate
    ? selectedTemplate.regions.filter(r => r.page === pageNumber)
    : selectedPaper
    ? selectedPaper.regions.filter(r => r.page === pageNumber)
    : [];

  const handleMouseDown = (e) => {
    // If modal is showing, clicking outside should dismiss it
    if (showNamingModal) {
      setShowNamingModal(null);
      return;
    }

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    // Calculate client offset
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setDragStart({ x, y });
    setTempBox({ x, y, w: 0, h: 0 });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !dragStart || !tempBox || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    const currentX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const currentY = Math.max(0, Math.min(e.clientY - rect.top, rect.height));

    const x = Math.min(dragStart.x, currentX);
    const y = Math.min(dragStart.y, currentY);
    const w = Math.abs(dragStart.x - currentX);
    const h = Math.abs(dragStart.y - currentY);

    setTempBox({ x, y, w, h });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !tempBox || !containerRef.current) return;
    setIsDrawing(false);
    setDragStart(null);

    const { x, y, w, h } = tempBox;
    const rect = containerRef.current.getBoundingClientRect();

    // Ignore tiny accidental clicks (less than 15px)
    if (w < 15 || h < 15) {
      setTempBox(null);
      return;
    }

    // Convert pixels to percentages
    const pctX = (x / rect.width) * 100;
    const pctYCorrected = (y / rect.height) * 100;
    const pctW = (w / rect.width) * 100;
    const pctH = (h / rect.height) * 100;

    // Place naming popup near the bottom-right of the selection box
    const modalLeft = Math.min(x + w, rect.width - 240);
    const modalTop = Math.min(y + h + 10, rect.height - 80);

    // Auto-suggest next question number
    const maxQNum = activeRegions.length + 1;
    setQuestionName(`Q${maxQNum}`);

    setShowNamingModal({
      left: modalLeft,
      top: modalTop,
      pctX,
      pctY: pctYCorrected,
      pctW,
      pctH
    });
  };

  const handleSaveRegion = () => {
    if (!showNamingModal || !questionName.trim()) return;

    // Apply the "Buffer Box" strategy: add 5% padding to width and height and center it
    const originalWidth = showNamingModal.pctW;
    const originalHeight = showNamingModal.pctH;
    const originalX = showNamingModal.pctX;
    const originalY = showNamingModal.pctY;

    const bufferedWidth = Math.min(100, originalWidth + 5);
    const bufferedHeight = Math.min(100, originalHeight + 5);
    
    // Shift X and Y to keep the box centered
    const changeX = bufferedWidth - originalWidth;
    const changeY = bufferedHeight - originalHeight;

    const bufferedX = Math.max(0, originalX - (changeX / 2));
    const bufferedY = Math.max(0, originalY - (changeY / 2));

    addRegion({
      questionNumber: questionName.trim(),
      page: pageNumber,
      x: bufferedX,
      y: bufferedY,
      width: bufferedWidth,
      height: bufferedHeight
    });

    setShowNamingModal(null);
    setTempBox(null);
    setQuestionName('');
  };

  const handleCancelRegion = () => {
    setShowNamingModal(null);
    setTempBox(null);
  };

  // Listen for escape key to cancel naming modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleCancelRegion();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        cursor: 'crosshair',
        userSelect: 'none',
        zIndex: 10
      }}
    >
      {/* Existing regions overlaid as interactive absolute divs */}
      {activeRegions.map((region) => {
        const isHighlighted = highlightedRegionId === region.id;
        
        return (
          <div
            key={region.id}
            onClick={(e) => {
              e.stopPropagation();
              setHighlightedRegionId(region.id);
            }}
            className={`region-box ${isHighlighted ? 'highlight-active' : ''}`}
            style={{
              position: 'absolute',
              left: `${region.x}%`,
              top: `${region.y}%`,
              width: `${region.width}%`,
              height: `${region.height}%`,
              border: isHighlighted ? '2px solid var(--accent)' : '1px dashed var(--text-muted)',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: isHighlighted ? 'var(--accent-light)' : 'rgba(255, 255, 255, 0.02)',
              boxShadow: isHighlighted ? '0 2px 10px var(--accent-glow)' : 'none',
              transition: 'all 0.1s ease',
              zIndex: isHighlighted ? 20 : 15,
            }}
          >
            {/* Tag Badge */}
            <div
              style={{
                position: 'absolute',
                top: '-20px',
                left: '0px',
                backgroundColor: 'var(--text-primary)',
                color: 'var(--bg-primary)',
                fontSize: '11px',
                fontWeight: 'bold',
                padding: '2px 6px',
                borderRadius: '0px',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {region.questionNumber}
            </div>

            {/* Delete button (only show in template/mapping editing mode) */}
            {(mode === 'mapping' || selectedTemplate) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeRegion(region.id);
                }}
                style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '-10px',
                  backgroundColor: 'var(--rose)',
                  color: 'white',
                  borderRadius: 'var(--radius-sm)',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>
        );
      })}

      {/* Draw feedback box */}
      {tempBox && (
        <div
          style={{
            position: 'absolute',
            left: `${tempBox.x}px`,
            top: `${tempBox.y}px`,
            width: `${tempBox.w}px`,
            height: `${tempBox.h}px`,
            border: '1px dashed var(--accent)',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            borderRadius: 'var(--radius-sm)',
            pointerEvents: 'none',
            zIndex: 18,
          }}
        />
      )}

      {/* Inline Naming Dialog */}
      {showNamingModal && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="glass-panel"
          style={{
            position: 'absolute',
            left: `${showNamingModal.left}px`,
            top: `${showNamingModal.top}px`,
            width: '220px',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            zIndex: 30,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
            Map Region To Question:
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <input
              type="text"
              value={questionName}
              onChange={(e) => setQuestionName(e.target.value)}
              placeholder="e.g. Q1"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveRegion();
              }}
              style={{
                flex: 1,
                fontSize: '13px',
                padding: '6px 8px',
              }}
            />
            <button
              onClick={handleSaveRegion}
              className="btn-primary"
              style={{ padding: '6px 10px' }}
            >
              <Check size={14} />
            </button>
            <button
              onClick={handleCancelRegion}
              className="btn-secondary"
              style={{ padding: '6px 10px' }}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
