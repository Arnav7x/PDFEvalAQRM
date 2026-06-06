import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import UploadPaper from '../pages/UploadPaper';
import MappingWorkspace from '../pages/MappingWorkspace';
import TemplateLibrary from '../pages/TemplateLibrary';
import TemplateWorkspace from '../pages/TemplateWorkspace';
import EvaluationWorkspace from '../pages/EvaluationWorkspace';
import ThemeToggle from '../components/ThemeToggle';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <ThemeToggle />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/upload" element={<UploadPaper />} />
        <Route path="/workspace/:paperId" element={<MappingWorkspace />} />
        <Route path="/templates" element={<TemplateLibrary />} />
        <Route path="/templates/:templateId" element={<TemplateWorkspace />} />
        <Route path="/evaluate/:paperId" element={<EvaluationWorkspace />} />
        {/* Redirect any unknown route to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
