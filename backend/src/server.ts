import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import dotenv from 'dotenv';
import * as azdev from 'azure-devops-node-api';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));

// Simple request log (visible in `docker compose logs`)
app.use((req: Request, res: Response, next: NextFunction) => {
  const started = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - started}ms)`);
  });
  next();
});

const frontendDist = path.join(__dirname, '..', 'public');

if (isProd) {
  app.use(express.static(frontendDist));
}

function sanitizeErrorMessage(error: any): string {
  if (!error) return 'Unexpected error';
  const message = typeof error === 'string' ? error : error.message || 'Unexpected error';
  return message.includes('token') || message.includes('Token') || message.includes('PAT') || message.includes('authorization') || message.includes('Authorization')
    ? 'Authentication failed. Check your PAT token and its scopes/permissions for this organization.'
    : message;
}

async function getAzureConnection(orgUrl: string, token: string) {
  const authHandler = azdev.getPersonalAccessTokenHandler(token);
  const connection = new azdev.WebApi(orgUrl, authHandler);
  return connection;
}

function handleAzDevError(error: any, defaultMessage: string, res: Response) {
  const status = error?.statusCode || error?.status || 500;
  const message = sanitizeErrorMessage(error);

  if (status === 401) {
    return res.status(401).json({ error: message });
  }

  res.status(status).json({ error: message });
}

app.post('/api/projects', async (req: Request, res: Response): Promise<void> => {
  try {
    const { orgUrl, token } = req.body;
    if (!orgUrl || !token) {
      res.status(400).json({ error: 'Missing required parameters.' });
      return;
    }

    const trimmedToken = String(token).trim();
    const trimmedOrgUrl = String(orgUrl).trim();
    const connection = await getAzureConnection(trimmedOrgUrl, trimmedToken);
    const coreApi = await connection.getCoreApi();
    const projects = await coreApi.getProjects();

    res.json(projects);
  } catch (error: any) {
    handleAzDevError(error, 'Failed to connect to Azure DevOps.', res);
  }
});

app.post('/api/variable-groups', async (req: Request, res: Response): Promise<void> => {
  try {
    const { orgUrl, token, projectName } = req.body;
    if (!orgUrl || !token || !projectName) {
      res.status(400).json({ error: 'Missing required parameters.' });
      return;
    }

    const trimmedToken = String(token).trim();
    const trimmedOrgUrl = String(orgUrl).trim();
    const connection = await getAzureConnection(trimmedOrgUrl, trimmedToken);
    const taskApi = await connection.getTaskAgentApi();

    const variableGroups = await taskApi.getVariableGroups(projectName);
    res.json(variableGroups);
  } catch (error: any) {
    handleAzDevError(error, 'Failed to list Variable Groups.', res);
  }
});

app.post('/api/clone-variable-group', async (req: Request, res: Response): Promise<void> => {
  try {
    const { orgUrl, token, sourceProject, targetProjects, variableGroupId } = req.body;
    if (!orgUrl || !token || !sourceProject || !targetProjects || !variableGroupId) {
      res.status(400).json({ error: 'Missing required parameters.' });
      return;
    }

    const trimmedToken = String(token).trim();
    const trimmedOrgUrl = String(orgUrl).trim();
    const connection = await getAzureConnection(trimmedOrgUrl, trimmedToken);
    const taskApi = await connection.getTaskAgentApi();

    const sourceGroup = await taskApi.getVariableGroup(sourceProject, variableGroupId);
    if (!sourceGroup) {
      res.status(404).json({ error: 'Source variable group not found.' });
      return;
    }

    const coreApi = await connection.getCoreApi();
    const targetProjectMap = new Map<string, string>();
    for (const targetProj of targetProjects) {
      if (targetProj === sourceProject) continue;
      const project = await coreApi.getProject(targetProj);
      if (project?.id) {
        targetProjectMap.set(targetProj, project.id);
      }
    }

    const results = [];

    for (const targetProj of targetProjects) {
      if (targetProj === sourceProject) continue;

      const targetProjectId = targetProjectMap.get(targetProj);
      const newGroupName = sourceGroup.name;
      const newGroupData: any = {
        name: newGroupName,
        description: `Cloned from ${sourceProject} via Azure DevOps Library Clone Tool`,
        variables: sourceGroup.variables,
        type: sourceGroup.type,
        variableGroupProjectReferences: [
          {
            name: newGroupName,
            projectReference: {
              id: targetProjectId,
              name: targetProj,
            },
          },
        ],
      };

      let created: any;
      try {
        created = await taskApi.addVariableGroup(newGroupData);
      } catch (sdkError: any) {
        const targetUrl = `${trimmedOrgUrl}/${encodeURIComponent(targetProj)}/_apis/distributedtask/variablegroups?api-version=5.1`;
        const fetchResponse = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${Buffer.from(`:${trimmedToken}`).toString('base64')}`,
          },
          body: JSON.stringify(newGroupData),
        });
        const fetchText = await fetchResponse.text();
        if (!fetchResponse.ok) {
          throw new Error(`Direct create failed with status ${fetchResponse.status}: ${fetchText}`);
        }
        created = JSON.parse(fetchText);
      }

      results.push({ project: targetProj, status: 'Success', newGroupId: created?.id, variableGroupName: newGroupName });
    }

    res.json({ message: 'Clone completed successfully!', results });
  } catch (error: any) {
    handleAzDevError(error, 'Failed during cloning.', res);
  }
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.get('*', (_req: Request, res: Response) => {
  if (isProd) {
    res.sendFile(path.join(frontendDist, 'index.html'));
    return;
  }
  res.status(404).json({ error: 'Not found' });
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log('Server started');
});
