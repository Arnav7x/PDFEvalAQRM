import React, { useRef, useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';

export const SVGMappingOverlay = ({ pageNumber }) => {
  const {
    selectedTemplate,
    selectedPaper,
    removeRegion,
    highlightedRegionId,
    setHighlightedRegionId,
    selectedArea,
    setSelectedArea,
    mode
  } = useWorkspace();

  // Enable drawing when: editing a template, or in mapping mode (for papers)
  const canMarkArea = !!selectedTemplate || mode === 'mapping';

  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [tempBox, setTempBox] = useState(null);

  const activeRegions = selectedTemplate
    ? selectedTemplate.regions.filter((region) => region.page === pageNumber)
    : selectedPaper
      ? (selectedPaper.regions || []).filter((region) => region.page === pageNumber)
      : [];

  const findRegionElement = (target) => {
    let current = target;
    while (current && current !== containerRef.current) {
      if (current.dataset?.regionId) {
        return current;
      }
      current = current.parentElement;
    }
    return null;
  };

  const handleMouseDown = (e) => {
    const clickedRegion = findRegionElement(e.target);
    if (clickedRegion) {
      setHighlightedRegionId(clickedRegion.dataset.regionId);
      setSelectedArea(null);
      return;
    }

    if (!canMarkArea || !containerRef.current) {
      setHighlightedRegionId(null);
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setDragStart({ x, y });
    setTempBox({ x, y, w: 0, h: 0 });
    setHighlightedRegionId(null);
    setSelectedArea(null);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !dragStart || !tempBox || !containerRef.current) {
      return;
    }

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
    if (!isDrawing || !tempBox || !containerRef.current) {
      return;
    }

    setIsDrawing(false);
    setDragStart(null);

    const { x, y, w, h } = tempBox;
    const rect = containerRef.current.getBoundingClientRect();

    if (w < 15 || h < 15) {
      setTempBox(null);
      return;
    }

    setSelectedArea({
      page: pageNumber,
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      width: (w / rect.width) * 100,
      height: (h / rect.height) * 100
    });
    setTempBox(null);
  };

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
        cursor: canMarkArea ? 'crosshair' : 'default',
        pointerEvents: canMarkArea ? 'auto' : 'none',
        userSelect: 'none',
        zIndex: 10
      }}
    >
      {activeRegions.map((region) => {
        const isHighlighted = highlightedRegionId === region.id;

        return (
          <g
            key={region.id}
            data-region-id={region.id}
            pointerEvents="all"
            onClick={(e) => {
              e.stopPropagation();
              setHighlightedRegionId(region.id);
              setSelectedArea(null);
            }}
            className={`region-box ${isHighlighted ? 'highlight-active' : ''}`}
          >
            <rect
              data-region-id={region.id}
              pointerEvents="all"
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
            <text
              data-region-id={region.id}
              pointerEvents="all"
              x={`${region.x}%`}
              y={`${Math.max(0, region.y - 5)}%`}
              fontSize="11"
              fontWeight="bold"
              fill="var(--text-primary)"
            >
              {region.questionNumber}
            </text>
            {(mode === 'mapping' || selectedTemplate) && (
              <g
                data-region-id={region.id}
                pointerEvents="all"
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

      {tempBox && (
        <rect
          x={`${tempBox.x}px`}
          y={`${tempBox.y}px`}
          width={`${tempBox.w}px`}
          height={`${tempBox.h}px`}
          stroke="var(--emerald)"
          strokeWidth="1.5"
          strokeDasharray="6 4"
          fill="rgba(16, 185, 129, 0.08)"
          rx="2"
          ry="2"
          pointerEvents="none"
        />
      )}

      {selectedArea && selectedArea.page === pageNumber && (
        <rect
          x={`${selectedArea.x}%`}
          y={`${selectedArea.y}%`}
          width={`${selectedArea.width}%`}
          height={`${selectedArea.height}%`}
          stroke="var(--emerald)"
          strokeWidth="2"
          strokeDasharray="6 4"
          fill="rgba(16, 185, 129, 0.08)"
          rx="2"
          ry="2"
          pointerEvents="none"
        />
      )}
    </svg>
  );
};
