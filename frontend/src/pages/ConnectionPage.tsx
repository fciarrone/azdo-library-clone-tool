import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import appLogo from '../assets/azdo-library-clone-tool.png';

export function ConnectionPage() {
  const [orgUrl, setOrgUrl] = useState('');
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);

  const { login, connected, loading, error, clearError, setError } = useAuth();
  const navigate = useNavigate();

  const normalizeOrgUrl = (url: string): string => url.trim().replace(/\/+$/, '');

  const validateOrgUrl = (url: string): boolean => {
    const normalized = url.toLowerCase();
    const patterns = [
      /^https:\/\/dev\.azure\.com\/[\w-]+$/,
      /^https:\/\/[\w-]+\.visualstudio\.com$/,
    ];
    return patterns.some(pattern => pattern.test(normalized));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const normalizedOrgUrl = normalizeOrgUrl(orgUrl);
    if (!normalizedOrgUrl) {
      setError('Enter the organization URL. E.g.: https://dev.azure.com/myorg');
      return;
    }
    if (!validateOrgUrl(normalizedOrgUrl)) {
      setError('Invalid organization URL. Use https://dev.azure.com/myorg or https://myorg.visualstudio.com');
      return;
    }
    if (!token.trim()) {
      setError('Enter the Personal Access Token (PAT).');
      return;
    }

    try {
      await login(normalizedOrgUrl, token.trim());
      navigate('/clone');
    } catch (err) {
      // error handled by context
    }
  };

  if (connected) {
    navigate('/clone', { replace: true });
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: { xs: 2, sm: 3 },
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              component="img"
              src={appLogo}
              alt="Azure DevOps Library Clone Tool logo"
              sx={{ height: 96, width: 96, mb: 1, borderRadius: 2, display: 'block', mx: 'auto' }}
            />
            <Typography variant="h5" component="h1" fontWeight={700}>
              Azure DevOps Library Clone Tool
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Replicate Variable Groups between projects
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Organization URL"
              value={orgUrl}
              onChange={(e) => {
                setOrgUrl(e.target.value);
                if (error) clearError();
              }}
              placeholder="https://dev.azure.com/myorg"
              autoComplete="url"
              size="small"
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Personal Access Token (PAT)"
              type={showToken ? 'text' : 'password'}
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                if (error) clearError();
              }}
              placeholder="PAT with required scopes"
              autoComplete="current-password"
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showToken ? 'Hide token' : 'Show token'}
                      onClick={() => setShowToken(!showToken)}
                      edge="end"
                      size="small"
                    >
                      {showToken ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 1 }}
            >
              {loading ? 'Connecting...' : 'Connect'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
