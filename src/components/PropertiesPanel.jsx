import React, { useEffect, useMemo, useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';

export default function PropertiesPanel() {
  const {
    highlightedRegionId,
    selectedArea,
    selectedPaper,
    selectedTemplate,
    setOverlayTool,
    setHighlightedRegionId,
    setSelectedArea,
    addRegion,
    removeRegion,
    updatePaper,
    updateTemplate,
  } = useWorkspace();

  const regions = selectedTemplate?.regions || selectedPaper?.regions || [];
  const region = useMemo(
    () => regions.find((item) => item.id === highlightedRegionId),
    [regions, highlightedRegionId]
  );
  const [form, setForm] = useState({ questionNumber: '', page: 1, x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    const source = region || selectedArea;
    if (!source) return;
    setForm({
      questionNumber: region?.questionNumber || `Q${regions.length + 1}`,
      page: source.page || 1,
      x: Number(source.x || 0).toFixed(2),
      y: Number(source.y || 0).toFixed(2),
      width: Number(source.width || 0).toFixed(2),
      height: Number(source.height || 0).toFixed(2),
    });
  }, [region, selectedArea, regions.length]);

  const updateField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleSave = async () => {
    const nextRegion = {
      questionNumber: form.questionNumber.trim() || `Q${regions.length + 1}`,
      page: Number(form.page) || 1,
      x: Number(form.x) || 0,
      y: Number(form.y) || 0,
      width: Number(form.width) || 0,
      height: Number(form.height) || 0,
    };

    if (region) {
      const updatedRegions = regions.map((item) => item.id === region.id ? { ...item, ...nextRegion } : item);
      if (selectedTemplate) {
        await updateTemplate({ ...selectedTemplate, regions: updatedRegions });
      } else if (selectedPaper) {
        await updatePaper({ ...selectedPaper, regions: updatedRegions });
      }
      setHighlightedRegionId(region.id);
    } else if (selectedArea) {
      await addRegion(nextRegion);
    }

    setOverlayTool('select');
    setSelectedArea(null);
  };

  const handleDelete = () => {
    if (region) {
      removeRegion(region.id);
      setOverlayTool('select');
      setHighlightedRegionId(null);
    }
    setSelectedArea(null);
  };

  return (
    <div className="flex h-full flex-col p-4">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-secondary">Region Properties</h2>
      {region || selectedArea ? (
        <div className="space-y-3">
          <label className="block text-xs font-medium">
            Question
            <input value={form.questionNumber} onChange={(e) => updateField('questionNumber', e.target.value)} className="input mt-1 w-full text-xs" />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block text-xs font-medium">
              X %
              <input value={form.x} onChange={(e) => updateField('x', e.target.value)} className="input mt-1 w-full text-xs" />
            </label>
            <label className="block text-xs font-medium">
              Y %
              <input value={form.y} onChange={(e) => updateField('y', e.target.value)} className="input mt-1 w-full text-xs" />
            </label>
            <label className="block text-xs font-medium">
              Width %
              <input value={form.width} onChange={(e) => updateField('width', e.target.value)} className="input mt-1 w-full text-xs" />
            </label>
            <label className="block text-xs font-medium">
              Height %
              <input value={form.height} onChange={(e) => updateField('height', e.target.value)} className="input mt-1 w-full text-xs" />
            </label>
          </div>
          <label className="block text-xs font-medium">
            Page Number
            <input value={form.page} onChange={(e) => updateField('page', e.target.value)} className="input mt-1 w-full text-xs" />
          </label>
          <div className="pt-2">
            <button className="btn btn-primary mb-2 w-full justify-center text-xs" onClick={handleSave}>Save Region</button>
            <button className="btn btn-secondary w-full justify-center text-xs" onClick={handleDelete}>Delete Region</button>
          </div>
        </div>
      ) : (
        <p className="rounded-sm border border-dashed border-glass p-4 text-center text-xs text-secondary">
          Select a region or draw a new area to edit its bounds.
        </p>
      )}
    </div>
  );
}
