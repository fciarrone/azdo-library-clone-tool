import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderTree,
  Layers,
  Copy,
  ChevronLeft,
  ChevronRight,
  Search,
  Check,
  Server,
  Tag,
  AlertCircle,
} from 'lucide-react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Button,
  Stepper,
  Step,
  StepLabel,
  Card,
  Alert,
  Checkbox,
  Chip,
  Container,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useWizard } from '../context/WizardContext';
import { useApi } from '../hooks/useApi';
import { showToast, dismissToast } from '../components/feedback/Toast';

export function CloneWizardPage() {
  const { connected, projects, logout, getCredentials } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const {
    currentStep,
    sourceProject,
    variableGroup,
    targetProjects,
    variableGroups,
    selectedVariableGroupIds,
    loading,
    error,
    cloneResults,
    setCurrentStep,
    setSourceProject,
    setVariableGroup,
    setVariableGroups,
    setSelectedVariableGroupIds,
    toggleVariableGroup,
    selectAllVariableGroups,
    clearVariableGroups,
    setTargetProjects,
    toggleTargetProject,
    selectAllTargets,
    clearAllTargets,
    setLoading,
    setError,
    setCloneResults,
    nextStep,
    prevStep,
    canGoNext,
    reset,
  } = useWizard();

  const { getVariableGroups, cloneVariableGroup } = useApi();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [variableGroupSearchQuery, setVariableGroupSearchQuery] = useState('');
  const [targetSearchQuery, setTargetSearchQuery] = useState('');
  const [toastId, setToastId] = useState<string | null>(null);

  useEffect(() => {
    if (sourceProject && connected) {
      const credentials = getCredentials();
      if (!credentials) {
        setError('Authentication lost. Please reconnect.');
        return;
      }

      setLoading(true);
      setError(null);
      getVariableGroups(credentials.orgUrl, credentials.token, sourceProject.name)
        .then(groups => {
          setVariableGroups(groups);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message || 'Failed to load variable groups');
          setLoading(false);
        });
    }
  }, [sourceProject, connected, getCredentials, getVariableGroups, setVariableGroups, setLoading, setError]);

  const handleCloneExecute = useCallback(async () => {
    if (!sourceProject || selectedVariableGroupIds.length === 0 || targetProjects.length === 0) return;

    const credentials = getCredentials();
    if (!credentials) {
      setError('Authentication lost. Please reconnect.');
      return;
    }

    setLoading(true);
    setError(null);
    dismissToast(toastId);

    try {
      const results = [];
      for (const groupId of selectedVariableGroupIds) {
        const group = variableGroups.find(g => String(g.id) === String(groupId));
        if (!group) continue;

        const result = await cloneVariableGroup({
          orgUrl: credentials.orgUrl,
          token: credentials.token,
          sourceProject: sourceProject.name,
          targetProjects,
          variableGroupId: group.id,
        });

        results.push(...result.results);
      }

      setCloneResults(results);
      setLoading(false);

      const successCount = results.filter(r => r.status === 'Success').length;
      const totalCount = results.length;

      if (successCount === totalCount && totalCount > 0) {
        const id = showToast('Successfully cloned to all projects!', { type: 'success' });
        setToastId(id);
      } else if (successCount > 0) {
        const id = showToast(`Cloned ${successCount} of ${totalCount} operations`, { type: 'warning' });
        setToastId(id);
      } else {
        const id = showToast('Clone failed for all operations', { type: 'error' });
        setToastId(id);
      }
    } catch (err) {
      setError(err.message || 'Clone failed');
      setLoading(false);
      const id = showToast(err.message || 'Clone failed', { type: 'error' });
      setToastId(id);
    }
  }, [sourceProject, selectedVariableGroupIds, targetProjects, getCredentials, cloneVariableGroup, variableGroups, setCloneResults, setLoading, setError, toastId]);

  if (!connected) {
    navigate('/', { replace: true });
    return null;
  }

  const steps = [
    { label: 'Source Project', shortLabel: 'Source' },
    { label: 'Variable Group', shortLabel: 'Var Group' },
    { label: 'Target Projects', shortLabel: 'Targets' },
  ];

  const selectedTargetNames = targetProjects;

  const filteredProjects = projects
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  const filteredVariableGroups = variableGroups
    .filter(p => p.name.toLowerCase().includes(variableGroupSearchQuery.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  const filteredTargetProjects = projects
    .filter(p => p.name !== sourceProject?.name)
    .filter(p => p.name.toLowerCase().includes(targetSearchQuery.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 1.5, sm: 3, md: 4 },
          py: { xs: 1.5, sm: 2 },
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Box>
          <Typography variant={isMobile ? 'subtitle1' : 'h6'} fontWeight={700} noWrap>
            Clone Variable Group
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Step {currentStep} of 3
          </Typography>
        </Box>
        <Button variant="text" size={isMobile ? 'small' : 'medium'} onClick={logout}>
          {isMobile ? 'Exit' : 'Disconnect'}
        </Button>
      </Box>

      <Container
        maxWidth="md"
        sx={{
          px: { xs: 1.5, sm: 3, md: 4 },
          py: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Stack spacing={2}>
          <Card sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Stepper activeStep={currentStep - 1}>
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel>{step.label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Card>

          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Card>
            {currentStep === 1 && (
              <Box sx={{ p: { xs: 1.5, sm: 3 } }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Source Project
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: 'text.secondary', fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 1 }}
                />
                <List sx={{ width: '100%', maxHeight: { xs: 300, sm: 400 }, overflow: 'auto', bgcolor: 'background.paper', borderRadius: 1 }}>
                  {filteredProjects.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Server sx={{ mb: 1, color: 'text.secondary', fontSize: { xs: 32, sm: 40 } }} />
                      <Typography variant="body2" color="text.secondary">
                        {searchQuery ? 'No projects match your search' : 'No projects available'}
                      </Typography>
                    </Box>
                  ) : (
                    filteredProjects.map(project => {
                      const selected = sourceProject?.name === project.name;
                      return (
                          <ListItemButton
                            key={project.id}
                            selected={selected}
                            onClick={() => setSourceProject(project)}
                            sx={{ 
                              py: { xs: 1, sm: 1.5 },
                              transition: 'none',
                              '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                              },
                            }}
                          >
                          <ListItemText
                            primary={project.name}
                            secondary={project.description}
                            primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1' }}
                            secondaryTypographyProps={{ variant: isMobile ? 'caption' : 'body2' }}
                          />
                          {selected && <Check sx={{ color: 'primary.main' }} />}
                        </ListItemButton>
                      );
                    })
                  )}
                </List>
              </Box>
            )}

            {currentStep === 2 && (
              <Box sx={{ p: { xs: 1.5, sm: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="subtitle2">
                    Variable Groups <Chip size="small" label={selectedVariableGroupIds.length} />
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" variant="outlined" onClick={selectAllVariableGroups}>
                      Select All
                    </Button>
                    <Button size="small" variant="text" onClick={clearVariableGroups}>
                      Clear All
                    </Button>
                  </Box>
                </Box>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search variable groups..."
                  value={variableGroupSearchQuery}
                  onChange={(e) => setVariableGroupSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: 'text.secondary', fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 1 }}
                />
                {loading ? (
                  <Typography variant="body2" color="text.secondary">
                    Loading...
                  </Typography>
                ) : filteredVariableGroups.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <FolderTree sx={{ mb: 1, color: 'text.secondary', fontSize: { xs: 32, sm: 40 } }} />
                    <Typography variant="body2" color="text.secondary">
                      {variableGroupSearchQuery ? 'No variable groups match your search' : 'No variable groups found in this project'}
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ width: '100%', maxHeight: { xs: 300, sm: 400 }, overflow: 'auto', bgcolor: 'background.paper', borderRadius: 1 }}>
                    {filteredVariableGroups
                      .map(group => {
                        const selected = selectedVariableGroupIds.includes(String(group.id));
                        const variableCount = Object.keys(group.variables || {}).length;
                        const secretCount = Object.values(group.variables || {}).filter(v => v.isSecret).length;
                        return (
                          <ListItemButton
                            key={group.id}
                            selected={selected}
                            onClick={() => toggleVariableGroup(String(group.id))}
                            sx={{ 
                              py: { xs: 1, sm: 1.5 },
                              transition: 'none',
                              '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                              },
                            }}
                          >
                            <Checkbox size="small" checked={selected} onClick={(e) => e.stopPropagation()} />
                            <ListItemText
                              primary={group.name}
                              secondary={`${group.type || 'Vsts'} • ${variableCount} variable${variableCount !== 1 ? 's' : ''}${secretCount > 0 ? ` • ${secretCount} secret${secretCount !== 1 ? 's' : ''}` : ''}`}
                              primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1' }}
                              secondaryTypographyProps={{ variant: isMobile ? 'caption' : 'body2' }}
                            />
                          </ListItemButton>
                        );
                      })}
                  </List>
                )}
              </Box>
            )}

            {currentStep === 3 && (
              <Box sx={{ p: { xs: 1.5, sm: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="subtitle2">
                      Target Projects
                    </Typography>
                    {selectedTargetNames.length === 0 && (
                      <Chip size="small" label="None selected" variant="outlined" />
                    )}
                    {selectedTargetNames.map(name => (
                      <Chip key={name} size="small" label={name} sx={{ ml: 0.5 }} />
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" variant="outlined" onClick={selectAllTargets}>
                      Select All
                    </Button>
                    <Button size="small" variant="text" onClick={clearAllTargets}>
                      Clear All
                    </Button>
                  </Box>
                </Box>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search target projects..."
                  value={targetSearchQuery}
                  onChange={(e) => setTargetSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: 'text.secondary', fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 1 }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  {targetProjects.length} selected
                </Typography>
                {filteredTargetProjects.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Layers sx={{ mb: 1, color: 'text.secondary', fontSize: { xs: 32, sm: 40 } }} />
                    <Typography variant="body2" color="text.secondary">
                      {targetSearchQuery ? 'No projects match your search' : 'No other projects available'}
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ width: '100%', maxHeight: { xs: 300, sm: 400 }, overflow: 'auto', bgcolor: 'background.paper', borderRadius: 1 }}>
                    {filteredTargetProjects.map(project => {
                        const selected = targetProjects.includes(project.name);
                        return (
                          <ListItemButton
                            key={project.id}
                            selected={selected}
                            onClick={() => toggleTargetProject(project.name)}
                            sx={{ 
                              py: { xs: 1, sm: 1.5 },
                              transition: 'none',
                              '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                              },
                            }}
                          >
                            <ListItemText 
                              primary={project.name} 
                              primaryTypographyProps={{ variant: isMobile ? 'body2' : 'body1' }}
                            />
                            <Checkbox size="small" checked={selected} />
                          </ListItemButton>
                        );
                      })}
                  </List>
                )}

                {cloneResults && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Clone Results
                    </Typography>
                    {cloneResults.map((result, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          border: 1,
                          borderColor: result.status === 'Success' ? 'success.main' : 'error.main',
                          borderRadius: 1,
                          px: 2,
                          py: 1.5,
                          mb: 1,
                          bgcolor: result.status === 'Success' ? 'success.light' : 'error.light',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {result.status === 'Success' ? (
                            <Check sx={{ color: 'success.main' }} />
                          ) : (
                            <AlertCircle sx={{ color: 'error.main' }} />
                          )}
                          <Typography variant="body2">{result.variableGroupName}</Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {result.status}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            )}
          </Card>

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1
          }}>
            <Button 
              variant="outlined" 
              onClick={prevStep} 
              disabled={currentStep === 1}
              fullWidth={isMobile}
            >
              <ChevronLeft sx={{ mr: 0.5 }} />
              {isMobile ? '' : 'Back'}
            </Button>
            {currentStep < 3 ? (
              <Button 
                variant="contained" 
                onClick={nextStep} 
                disabled={!canGoNext() || loading}
                fullWidth={isMobile}
              >
                {isMobile ? '' : 'Next'}
                <ChevronRight sx={{ ml: 0.5 }} />
              </Button>
            ) : (
              <Button 
                variant="contained" 
                onClick={handleCloneExecute} 
                disabled={targetProjects.length === 0 || loading}
                fullWidth={isMobile}
              >
                <Copy sx={{ mr: 0.5 }} />
                Clone to {targetProjects.length} project(s)
              </Button>
            )}
          </Box>

          {currentStep === 3 && cloneResults && (
            <Button variant="outlined" onClick={reset} fullWidth sx={{ mt: 2 }}>
              Start New Clone
            </Button>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
