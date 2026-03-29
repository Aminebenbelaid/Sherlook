import { AskRequest, AskResponse, IngestRequest, IngestResponse } from './types';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

async function request<T>(path: string, options: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with status ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export async function ingest(data: IngestRequest): Promise<IngestResponse> {
  return request<IngestResponse>('/ingest', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function ask(data: AskRequest): Promise<AskResponse> {
  return request<AskResponse>('/ask', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
