import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { Project, VariableGroup } from '../types/api';

interface WizardState {
  currentStep: 1 | 2 | 3;
  sourceProject: Project | null;
  variableGroup: VariableGroup | null;
  variableGroups: VariableGroup[];
  selectedVariableGroupIds: string[];
  targetProjects: string[];
  loading: boolean;
  error: string | null;
  cloneResults: Array<{ project: string; status: string; newGroupId?: number; error?: string }> | null;
}

interface WizardContextType extends WizardState {
  setCurrentStep: (step: 1 | 2 | 3) => void;
  setSourceProject: (project: Project | null) => void;
  setVariableGroup: (group: VariableGroup | null) => void;
  setVariableGroups: (groups: VariableGroup[]) => void;
  setSelectedVariableGroupIds: (ids: string[]) => void;
  toggleVariableGroup: (groupId: string) => void;
  selectAllVariableGroups: () => void;
  clearVariableGroups: () => void;
  setTargetProjects: (projects: string[]) => void;
  toggleTargetProject: (projectName: string) => void;
  selectAllTargets: () => void;
  clearAllTargets: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCloneResults: (results: WizardState['cloneResults']) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
  canGoNext: () => boolean;
}

const initialState: WizardState = {
  currentStep: 1,
  sourceProject: null,
  variableGroup: null,
  variableGroups: [],
  selectedVariableGroupIds: [],
  targetProjects: [],
  loading: false,
  error: null,
  cloneResults: null,
};

const STORAGE_KEY = 'azdo_wizard_state';

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WizardState>(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.sourceProject) {
          return { ...initialState, ...parsed, currentStep: Math.max(1, Math.min(3, parsed.currentStep || 1)) };
        }
      }
    } catch {
      // ignore restore errors
    }
    return initialState;
  });

  // Persist state to sessionStorage
  useEffect(() => {
    try {
      if (state.sourceProject) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore persist errors
    }
  }, [state]);

  const setCurrentStep = useCallback((step: 1 | 2 | 3) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  const setSourceProject = useCallback((project: Project | null) => {
    setState(prev => ({ 
      ...prev, 
      sourceProject: project,
      variableGroup: null,
      variableGroups: [],
      selectedVariableGroupIds: [],
      targetProjects: [],
    }));
  }, []);

  const setVariableGroup = useCallback((group: VariableGroup | null) => {
    setState(prev => ({ ...prev, variableGroup: group }));
  }, []);

  const setVariableGroups = useCallback((groups: VariableGroup[]) => {
    setState(prev => ({ ...prev, variableGroups: groups }));
  }, []);

  const setSelectedVariableGroupIds = useCallback((ids: string[]) => {
    setState(prev => ({ ...prev, selectedVariableGroupIds: ids }));
  }, []);

  const toggleVariableGroup = useCallback((groupId: string) => {
    setState(prev => {
      const selected = prev.selectedVariableGroupIds.includes(groupId);
      const newSelected = selected
        ? prev.selectedVariableGroupIds.filter(id => id !== groupId)
        : [...prev.selectedVariableGroupIds, groupId];
      const firstSelectedGroup = newSelected.length > 0 ? prev.variableGroups.find(g => g.id === newSelected[0]) || null : null;
      return { ...prev, selectedVariableGroupIds: newSelected, variableGroup: firstSelectedGroup };
    });
  }, []);

  const selectAllVariableGroups = useCallback(() => {
    setState(prev => {
      const allIds = prev.variableGroups.map(g => String(g.id));
      const firstGroup = prev.variableGroups[0] || null;
      return { ...prev, selectedVariableGroupIds: allIds, variableGroup: firstGroup };
    });
  }, []);

  const clearVariableGroups = useCallback(() => {
    setState(prev => ({ ...prev, selectedVariableGroupIds: [], variableGroup: null }));
  }, []);

  const setTargetProjects = useCallback((projects: string[]) => {
    setState(prev => ({ ...prev, targetProjects: projects }));
  }, []);

  const toggleTargetProject = useCallback((projectName: string) => {
    setState(prev => ({
      ...prev,
      targetProjects: prev.targetProjects.includes(projectName)
        ? prev.targetProjects.filter(p => p !== projectName)
        : [...prev.targetProjects, projectName],
    }));
  }, []);

  const selectAllTargets = useCallback(() => {
    setState(prev => {
      const allTargets = prev.projects
        .filter(p => p.name !== prev.sourceProject?.name)
        .map(p => p.name);
      return { ...prev, targetProjects: allTargets };
    });
  }, []);

  const clearAllTargets = useCallback(() => {
    setState(prev => ({ ...prev, targetProjects: [] }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const setCloneResults = useCallback((results: WizardState['cloneResults']) => {
    setState(prev => ({ ...prev, cloneResults: results }));
  }, []);

  const nextStep = useCallback(() => {
    setState(prev => {
      const next = Math.min(3, prev.currentStep + 1) as 1 | 2 | 3;
      return { ...prev, currentStep: next };
    });
  }, []);

  const prevStep = useCallback(() => {
    setState(prev => {
      const prevStep = Math.max(1, prev.currentStep - 1) as 1 | 2 | 3;
      return { ...prev, currentStep: prevStep };
    });
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore clear errors
    }
  }, []);

  const canGoNext = useCallback(() => {
    switch (state.currentStep) {
      case 1:
        return !!state.sourceProject;
      case 2:
        return state.selectedVariableGroupIds.length > 0;
      case 3:
        return state.targetProjects.length > 0;
      default:
        return false;
    }
  }, [state.currentStep, state.sourceProject, state.selectedVariableGroupIds, state.targetProjects]);

  return (
    <WizardContext.Provider value={{
      ...state,
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
      reset,
      canGoNext,
    }}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (context === undefined) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
}