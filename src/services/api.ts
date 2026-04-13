const API_BASE = '/api';

async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Thinker applications
export async function submitThinkerApplication(data: {
  name: string;
  email: string;
  idea: string;
  progress?: string;
  diagnosis?: string;
}) {
  return fetchApi('/thinkers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Doer applications
export async function submitDoerApplication(data: {
  name: string;
  email: string;
  skill: string;
  shipped: string;
  vision?: string;
}) {
  return fetchApi('/doers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Backer applications
export async function submitBackerApplication(data: {
  name: string;
  email: string;
  amount: string;
}) {
  return fetchApi('/backers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Investor applications
export async function submitInvestorApplication(data: {
  name: string;
  firm?: string;
  email: string;
  ticket: string;
  thesis?: string;
}) {
  return fetchApi('/investors', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Admin endpoints
export async function getThinkerApplications(token: string) {
  return fetchApi('/admin/thinkers', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getDoerApplications(token: string) {
  return fetchApi('/admin/doers', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getBackerApplications(token: string) {
  return fetchApi('/admin/backers', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getInvestorApplications(token: string) {
  return fetchApi('/admin/investors', {
    headers: { Authorization: `Bearer ${token}` },
  });
}
