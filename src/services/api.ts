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

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  language: string;
  isValidated: boolean;
  matchStatus: string;
}

export interface BlueprintCard {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface Blueprint {
  id: string;
  userId: string;
  cards: BlueprintCard[];
  createdAt: string;
  updatedAt: string;
}

export async function fetchMe(): Promise<User> {
  const userId = localStorage.getItem('eden-user-id');
  if (!userId) throw new Error('Not authenticated');
  return fetchApi('/me', {
    headers: { Authorization: `Bearer ${userId}` },
  });
}

export async function fetchBlueprint(): Promise<Blueprint> {
  const userId = localStorage.getItem('eden-user-id');
  if (!userId) throw new Error('Not authenticated');
  return fetchApi('/blueprint', {
    headers: { Authorization: `Bearer ${userId}` },
  });
}

export async function saveBlueprint(cards: Omit<BlueprintCard, 'id'>[]): Promise<Blueprint> {
  const userId = localStorage.getItem('eden-user-id');
  if (!userId) throw new Error('Not authenticated');
  return fetchApi('/blueprint', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${userId}` },
    body: JSON.stringify({ cards }),
  });
}

export async function deleteBlueprintCard(cardId: string): Promise<void> {
  const userId = localStorage.getItem('eden-user-id');
  if (!userId) throw new Error('Not authenticated');
  return fetchApi(`/blueprint/cards/${cardId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${userId}` },
  });
}
