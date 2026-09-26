export interface Project {
  id: string;
  name: string;
  description?: string;
  url: string;
  state: string;
  revision: number;
  visibility: string;
  lastUpdateTime: string;
}

export interface VariableGroupVariable {
  value: string;
  isSecret: boolean;
}

export interface VariableGroup {
  id: number;
  name: string;
  description?: string;
  type: string;
  variables: Record<string, VariableGroupVariable>;
  variableGroupProjectReferences?: Array<{
    projectReference: {
      id: string;
      name: string;
    };
  }>;
  createdBy?: {
    displayName: string;
    id: string;
  };
  createdOn?: string;
  modifiedBy?: {
    displayName: string;
    id: string;
  };
  modifiedOn?: string;
}

export interface CloneRequest {
  orgUrl: string;
  token: string;
  sourceProject: string;
  targetProjects: string[];
  variableGroupId: number;
}

export interface CloneResult {
  project: string;
  status: 'Success' | 'Error';
  newGroupId?: number;
  error?: string;
}

export interface CloneResponse {
  message: string;
  results: CloneResult[];
}

export interface ApiError {
  error: string;
}

export interface ConnectionRequest {
  orgUrl: string;
  token: string;
}

export interface VariableGroupsRequest {
  orgUrl: string;
  token: string;
  projectName: string;
}