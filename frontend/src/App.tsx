import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ConnectionPage } from './pages/ConnectionPage';
import { CloneWizardPage } from './pages/CloneWizardPage';
import { ThemeProvider } from './theme/ThemeProvider';
import { Box, CircularProgress, CssBaseline } from '@mui/material';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { connected, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!connected) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { connected, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (connected) {
    return <Navigate to="/clone" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider>
      <CssBaseline />
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <ConnectionPage />
            </PublicRoute>
          }
        />
        <Route
          path="/clone"
          element={
            <ProtectedRoute>
              <CloneWizardPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  );
}
