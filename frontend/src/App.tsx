import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { AppLayout, ProtectedRoute } from '@/components/layout';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { DocumentsPage } from '@/pages/DocumentsPage';
import { DocumentUploadPage } from '@/pages/DocumentUploadPage';
import { SharingPage } from '@/pages/SharingPage';
import { AccessPage } from '@/pages/AccessPage';
import { AuditLogsPage } from '@/pages/AuditLogsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/documents/upload" element={<DocumentUploadPage />} />
          <Route path="/sharing" element={<SharingPage />} />
          <Route path="/access" element={<AccessPage />} />
          <Route path="/audit" element={<AuditLogsPage />} />
        </Route>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
