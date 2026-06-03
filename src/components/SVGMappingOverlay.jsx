import React, { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { X, Check } from 'lucide-react';

export const SVGMappingOverlay = ({ pageNumber }) => {
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
    <svg
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
      {/* Existing regions overlaid as interactive SVG elements */}
      {activeRegions.map((region) => {
        const isHighlighted = highlightedRegionId === region.id;
        
        return (
          <g
            key={region.id}
            onClick={(e) => {
              e.stopPropagation();
              setHighlightedRegionId(region.id);
            }}
            className={`region-box ${isHighlighted ? 'highlight-active' : ''}`}
          >
            {/* Region rectangle */}
            <rect
              x={`${region.x}%`}
              y={`${region.y}%`}
              width={`${region.width}%`}
              height={`${region.height}%`}
              stroke={isHighlighted ? 'var(--accent)' : 'var(--text-muted)'}
              strokeWidth={isHighlighted ? '2' : '1'}
              strokeDasharray={isHighlighted ? 'none' : '2 2'}
              fill={isHighlighted ? 'var(--accent-light)' : 'rgba(255, 255, 255, 0.02)'}
              rx="2"
              ry="2"
            />
            
            {/* Tag Badge */}
            <text
              x={`${region.x}%`}
              y={`${Math.max(0, region.y - 5)}%`}
              fontSize="11"
              fontWeight="bold"
              fill="var(--text-primary)"
              pointerEvents="none"
            >
              {region.questionNumber}
            </text>
            
            {/* Delete button (only show in template/mapping editing mode) */}
            {(mode === 'mapping' || selectedTemplate) && (
              <g
                transform={`translate(${parseFloat(region.x) + parseFloat(region.width)}%, ${region.y}%) scale(0.08)`}
                onClick={(e) => {
                  e.stopPropagation();
                  removeRegion(region.id);
                }}
                cursor="pointer"
              >
                <circle cx="-5" cy="-5" r="5" fill="var(--rose)" />
                <path d="M0 0 L1 1 M1 0 L0 1" stroke="white" strokeWidth="1.5" />
              </g>
            )}
          </g>
        );
      })}

      {/* Draw feedback box */}
      {tempBox && (
        <rect
          x={`${tempBox.x}px`}
          y={`${tempBox.y}px`}
          width={`${tempBox.w}px`}
          height={`${tempBox.h}px`}
          stroke="var(--accent)"
          strokeWidth="1"
          strokeDasharray="2 2"
          fill="rgba(255, 255, 255, 0.04)"
          rx="2"
          ry="2"
          pointerEvents="none"
        />
      )}

      {/* Inline Naming Dialog */}
      {showNamingModal && (
        <foreignObject
          x={`${showNamingModal.left}px`}
          y={`${showNamingModal.top}px`}
          width="220"
          height="auto"
          style={{
            zIndex: 30,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid var(--border-glass)'
          }}
        >
          <div xmlns="http://www.w3.org/1999/xhtml" style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
            Map Region To Question:
          </div>
          <div xmlns="http://www.w3.org/1999/xhtml" style={{ display: 'flex', gap: '6px' }}>
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
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)'
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
        </foreignObject>
      )}
    </svg>
  );
};