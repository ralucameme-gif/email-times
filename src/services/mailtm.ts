import { MailtmDomain, MailtmMessageSummary, MailtmMessageDetail } from '../types';

// Use direct mail.tm API to avoid Vercel proxy issues, fallback to hardcoded domain
const API_BASE = 'https://api.mail.tm';
const FALLBACK_DOMAINS: MailtmDomain[] = [
  { id: 'fallback', domain: 'maxxspace.com', isActive: true, isPrivate: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as any
];

export const SMTPLABS_API_KEY =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SMTPLABS_API_KEY) ||
  'smtplabs_zK7CnP9SpWDVSSxThndnvDGpz2EVYsXJbyLhWYJ1zanVwQ24x';

function getHeaders(authToken?: string): Record<string, string> {
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-API-KEY': SMTPLABS_API_KEY,
  };
  if (authToken) h['Authorization'] = `Bearer ${authToken}`;
  return h;
}

export async function fetchDomains(): Promise<MailtmDomain[]> {
  try {
    // Try via our own proxy first (works on AI Studio)
    let res = await fetch('/api/mail/domains', { headers: getHeaders() });
    if (res.ok) {
      const data = await res.json();
      const list = Array.isArray(data) ? data : data['hydra:member'] || [];
      if (list.length > 0) return list;
    }
  } catch {}
  try {
    // Direct call to mail.tm (works on Vercel static)
    const res2 = await fetch(`${API_BASE}/domains`, { headers: getHeaders() });
    if (res2.ok) {
      const data = await res2.json();
      const list = Array.isArray(data) ? data : data['hydra:member'] || [];
      if (list.length > 0) return list;
    }
  } catch {}
  // Ultimate fallback - your domain that we know works
  console.warn('Using fallback domain maxxspace.com');
  return FALLBACK_DOMAINS;
}

export async function createAccount(address: string, password: string) {
  // Try proxy first
  try {
    const res = await fetch('/api/mail/accounts', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ address, password }),
    });
    if (res.ok) return await res.json();
  } catch {}
  // Direct
  const res = await fetch(`${API_BASE}/accounts`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ address, password }),
  });
  if (!res.ok) throw new Error('Failed to create account');
  return await res.json();
}

export async function getToken(address: string, password: string): Promise<string> {
  try {
    const res = await fetch('/api/mail/token', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ address, password }),
    });
    if (res.ok) {
      const d = await res.json();
      if (d.token) return d.token;
    }
  } catch {}
  const res = await fetch(`${API_BASE}/token`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ address, password }),
  });
  if (!res.ok) throw new Error('Failed to get token');
  const d = await res.json();
  return d.token;
}

export async function getMessages(token: string): Promise<MailtmMessageSummary[]> {
  const tryFetch = async (base: string) => {
    const res = await fetch(`${base}/messages`, { headers: getHeaders(token) });
    if (!res.ok) throw new Error('Failed to fetch messages');
    const data = await res.json();
    return (data['hydra:member'] || data || []) as MailtmMessageSummary[];
  };
  try {
    return await tryFetch('/api/mail');
  } catch {
    return await tryFetch(API_BASE);
  }
}

export async function getMessageDetail(id: string, token: string): Promise<MailtmMessageDetail> {
  const tryFetch = async (base: string) => {
    const res = await fetch(`${base}/messages/${id}`, { headers: getHeaders(token) });
    if (!res.ok) throw new Error('Failed to fetch message');
    return (await res.json()) as MailtmMessageDetail;
  };
  try {
    return await tryFetch('/api/mail');
  } catch {
    return await tryFetch(API_BASE);
  }
}

export function extractCode(text: string): string | null {
  if (!text) return null;
  const match = text.match(/\b\d{4,8}\b/) || text.match(/\b[A-Z0-9]{4,10}\b/);
  return match ? match[0] : null;
}
