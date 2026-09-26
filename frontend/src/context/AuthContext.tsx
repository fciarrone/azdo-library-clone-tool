import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { Project } from '../types/api';
import { getProjectsApi } from '../hooks/useApi';

interface AuthState {
  connected: boolean;
  orgUrl: string;
  token: string;
  projects: Project[];
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (orgUrl: string, token: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  setError: (message: string) => void;
  getCredentials: () => { orgUrl: string; token: string } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    connected: false,
    orgUrl: '',
    token: '',
    projects: [],
    loading: false,
    error: null,
  });

  // Load persisted state on mount
  useEffect(() => {
    try {
      const storedOrgUrl = sessionStorage.getItem('azdo_orgUrl');
      const storedToken = sessionStorage.getItem('azdo_token');
      const storedProjects = sessionStorage.getItem('azdo_projects');
      
      if (!storedOrgUrl || !storedToken || !storedProjects) {
        return;
      }

      setState({
        connected: true,
        orgUrl: storedOrgUrl,
        token: storedToken,
        projects: JSON.parse(storedProjects),
        loading: false,
        error: null,
      });
    } catch (error) {
      console.warn('[AuthProvider] Failed to restore auth state');
      clearPersistedState();
    }
  }, []);

  const persistState = useCallback((orgUrl: string, token: string, projects: Project[]) => {
    try {
      sessionStorage.setItem('azdo_orgUrl', orgUrl);
      sessionStorage.setItem('azdo_token', token);
      sessionStorage.setItem('azdo_projects', JSON.stringify(projects));
    } catch (error) {
      console.warn('[AuthProvider] Failed to persist auth state');
    }
  }, []);

  const clearPersistedState = useCallback(() => {
    try {
      sessionStorage.removeItem('azdo_orgUrl');
      sessionStorage.removeItem('azdo_token');
      sessionStorage.removeItem('azdo_projects');
    } catch (error) {
      console.warn('[AuthProvider] Failed to clear auth state');
    }
  }, []);

  const login = useCallback(async (orgUrl: string, token: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const projects = await getProjectsApi(orgUrl, token);
      
      setState({
        connected: true,
        orgUrl,
        token,
        projects,
        loading: false,
        error: null,
      });
      
      persistState(orgUrl, token, projects);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect';
      console.error('[AuthProvider] Login failed');
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, [persistState]);

  const logout = useCallback(() => {
    clearPersistedState();
    setState({
      connected: false,
      orgUrl: '',
      token: '',
      projects: [],
      loading: false,
      error: null,
    });
  }, [clearPersistedState]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const setError = useCallback((message: string) => {
    setState(prev => ({ ...prev, loading: false, error: message }));
  }, []);

  const getCredentials = useCallback(() => {
    if (state.connected && state.orgUrl && state.token) {
      return { orgUrl: state.orgUrl, token: state.token };
    }
    return null;
  }, [state.connected, state.orgUrl, state.token]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, clearError, setError, getCredentials }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}