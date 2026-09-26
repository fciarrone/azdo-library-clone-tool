import { useCallback } from 'react';
import type { Project, VariableGroup, CloneRequest, CloneResponse, ApiError } from '../types/api';

// In production (Docker), use relative URLs (same origin :3000)
// In development, VITE_API_URL can be set to http://localhost:5000
// (backend dev on :5000 to avoid conflicting with Vite on :3000)
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

interface FetchOptions extends RequestInit {
  timeout?: number;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithTimeout(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { timeout = 30000, ...fetchOptions } = options;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    console.error('[useApi] Fetch error');
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');
  
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    let errorData: unknown;
    
    if (isJson) {
      try {
        errorData = await response.json();
        if (typeof errorData === 'object' && errorData !== null && 'error' in errorData) {
          errorMessage = (errorData as ApiError).error;
        }
      } catch {
        // Ignore JSON parse errors
      }
    } else {
      try {
        errorMessage = await response.text();
      } catch {
        // Ignore text parse errors
      }
    }
    
    console.error('[useApi] API Error');
    throw new ApiError(errorMessage, response.status, errorData);
  }
  
  if (isJson) {
    return response.json();
  }
  
  return response.text() as unknown as T;
}

// Direct API functions (not a hook) for use in non-component contexts
export async function getProjectsApi(orgUrl: string, token: string): Promise<Project[]> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orgUrl, token }),
  });
  return handleResponse<Project[]>(response);
}

export async function getVariableGroupsApi(
  orgUrl: string,
  token: string,
  projectName: string
): Promise<VariableGroup[]> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/variable-groups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orgUrl, token, projectName }),
  });
  return handleResponse<VariableGroup[]>(response);
}

export async function cloneVariableGroupApi(
  request: CloneRequest
): Promise<CloneResponse> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/clone-variable-group`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  return handleResponse<CloneResponse>(response);
}

// Hook version for React components
export function useApi() {
  const getProjects = useCallback(async (orgUrl: string, token: string): Promise<Project[]> => {
    return getProjectsApi(orgUrl, token);
  }, []);

  const getVariableGroups = useCallback(async (
    orgUrl: string,
    token: string,
    projectName: string
  ): Promise<VariableGroup[]> => {
    return getVariableGroupsApi(orgUrl, token, projectName);
  }, []);

  const cloneVariableGroup = useCallback(async (
    request: CloneRequest
  ): Promise<CloneResponse> => {
    return cloneVariableGroupApi(request);
  }, []);

  return { getProjects, getVariableGroups, cloneVariableGroup };
}

export { ApiError };
export type { FetchOptions };