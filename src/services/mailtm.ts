import { MailtmDomain, MailtmMessageSummary, MailtmMessageDetail } from '../types';

const BASE_URL = '/api/mail';

// SmtpLabs API Key configured for higher throughput (4096 req/min) and reliability
export const SMTPLABS_API_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SMTPLABS_API_KEY) ||
  'smtplabs_zK7CnP9SpWDVSSxThndnvDGpz2EVYsXJbyLWYJ1zanVWQ24x';

let currentApiKey = SMTPLABS_API_KEY;

export function setApiKey(key: string) {
  if (key) currentApiKey = key;
}

export function getApiKey(): string {
  return currentApiKey;
}

// Optionally sync API key from server config
if (typeof window !== 'undefined') {
  fetch('/api/config')
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (data?.smtplabsApiKey) {
        setApiKey(data.smtplabsApiKey);
      }
    })
    .catch(() => {});
}

export function getHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...extraHeaders };
  if (currentApiKey) {
    headers['X-API-KEY'] = currentApiKey;
  }
  return headers;
}

export class MailtmError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'MailtmError';
    this.status = status;
  }
}

/**
 * Generate a CSPRNG-based random username (10 lowercase letters/digits)
 */
export function generateRandomUsername(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(10);
  crypto.getRandomValues(array);
  let result = '';
  for (let i = 0; i < array.length; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}

/**
 * Generate a CSPRNG-based secure password (26 alphanumeric + symbols)
 */
export function generateRandomPassword(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  const array = new Uint8Array(26);
  crypto.getRandomValues(array);
  let result = '';
  for (let i = 0; i < array.length; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}

/**
 * Fetch active, non-private domains from mail.tm
 */
export async function fetchDomains(): Promise<MailtmDomain[]> {
  const response = await fetch(`${BASE_URL}/domains?page=1`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new MailtmError(`Failed to fetch domains (${response.status})`, response.status);
  }
  const data = await response.json();
  const members: MailtmDomain[] = data['hydra:member'] || [];
  return members.filter((d) => d.isActive && !d.isPrivate);
}

/**
 * Create an account on mail.tm
 */
export async function createAccount(address: string, password: string): Promise<{ id: string; address: string }> {
  const response = await fetch(`${BASE_URL}/accounts`, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ address, password }),
  });

  if (!response.ok) {
    let msg = `Account creation failed (${response.status})`;
    try {
      const errData = await response.json();
      if (errData.message) msg = errData.message;
    } catch {
      // ignore
    }
    throw new MailtmError(msg, response.status);
  }

  return response.json();
}

/**
 * Authenticate and obtain JWT token
 */
export async function fetchToken(address: string, password: string): Promise<string> {
  const response = await fetch(`${BASE_URL}/token`, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ address, password }),
  });

  if (!response.ok) {
    throw new MailtmError(`Authentication failed (${response.status})`, response.status);
  }

  const data = await response.json();
  return data.token;
}

/**
 * Delete account on mail.tm permanently
 */
export async function deleteAccount(accountId: string, token: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/accounts/${accountId}`, {
    method: 'DELETE',
    headers: getHeaders({
      Authorization: `Bearer ${token}`,
    }),
  });

  if (!response.ok && response.status !== 404 && response.status !== 401) {
    throw new MailtmError(`Failed to delete account (${response.status})`, response.status);
  }
}

/**
 * Fetch messages for the mailbox
 */
export async function fetchMessages(
  token: string,
  page = 1
): Promise<{ messages: MailtmMessageSummary[]; totalItems: number }> {
  const response = await fetch(`${BASE_URL}/messages?page=${page}`, {
    headers: getHeaders({
      Authorization: `Bearer ${token}`,
    }),
  });

  if (!response.ok) {
    throw new MailtmError(`Failed to fetch messages (${response.status})`, response.status);
  }

  const data = await response.json();
  const messages: MailtmMessageSummary[] = data['hydra:member'] || [];
  const totalItems: number = data['hydra:totalItems'] || messages.length;
  return { messages, totalItems };
}

/**
 * Fetch a single message detail
 */
export async function fetchMessage(id: string, token: string): Promise<MailtmMessageDetail> {
  const response = await fetch(`${BASE_URL}/messages/${id}`, {
    headers: getHeaders({
      Authorization: `Bearer ${token}`,
    }),
  });

  if (!response.ok) {
    throw new MailtmError(`Failed to fetch message ${id} (${response.status})`, response.status);
  }

  return response.json();
}

/**
 * Mark message as seen
 */
export async function markMessageSeen(id: string, token: string): Promise<void> {
  await fetch(`${BASE_URL}/messages/${id}`, {
    method: 'PATCH',
    headers: getHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/merge-patch+json',
    }),
    body: JSON.stringify({ seen: true }),
  });
}

/**
 * Delete a message
 */
export async function deleteMessage(id: string, token: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/messages/${id}`, {
    method: 'DELETE',
    headers: getHeaders({
      Authorization: `Bearer ${token}`,
    }),
  });

  if (!response.ok && response.status !== 404) {
    throw new MailtmError(`Failed to delete message (${response.status})`, response.status);
  }
}

/**
 * Download attachment securely as Blob
 */
export async function downloadAttachment(
  downloadUrl: string,
  filename: string,
  contentType: string,
  token: string
): Promise<void> {
  const fullUrl = downloadUrl.startsWith('http')
    ? downloadUrl.replace('https://api.mail.tm', '/api/mail')
    : `${BASE_URL}${downloadUrl}`;
  const response = await fetch(fullUrl, {
    headers: getHeaders({
      Authorization: `Bearer ${token}`,
    }),
  });

  if (!response.ok) {
    throw new MailtmError(`Failed to download attachment (${response.status})`, response.status);
  }

  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename || 'attachment';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
}

/**
 * Extract verification / OTP codes (4 to 8 digits) from message content & subject
 */
export function extractVerificationCodes(text?: string, html?: string[], subject?: string): string[] {
  const foundCodes = new Set<string>();

  // 1. High-priority check from subject line (e.g. "567640 is your Instagram code")
  if (subject) {
    const subjectMatch = subject.match(/\b([0-9]{4,8})\b/);
    if (subjectMatch) {
      foundCodes.add(subjectMatch[1]);
    }
  }

  // 2. Search explicit phrases in body
  const combined = `${text || ''} ${(html || []).join(' ')}`;
  if (combined.trim()) {
    const explicitPatterns = [
      /(?:code|verification code|security code|confirmation code|otp|pin|passcode|رمز التحقق|كود التفعيل|رمز التأكيد)[\s:=a-zA-Z\n\r\t.-]{0,35}([0-9]{4,8})\b/gi,
      /\b([0-9]{4,8})\s+(?:is your|هو رمز|للتأكيد|verification code)/gi,
    ];

    for (const pattern of explicitPatterns) {
      let match;
      while ((match = pattern.exec(combined)) !== null) {
        if (match[1]) {
          foundCodes.add(match[1]);
        }
      }
    }
  }

  // 3. Filter out postal numbers, years, and street addresses (like 1601 Willow Road)
  const filtered = Array.from(foundCodes).filter((code) => {
    // Specifically remove "1601" (Meta headquarters address 1601 Willow Rd)
    if (code === '1601') return false;
    if (combined.includes(`${code} Willow`) || combined.includes(`${code} Road`) || combined.includes(`${code} St`)) {
      return false;
    }
    const num = parseInt(code, 10);
    // Ignore 4-digit years (1990-2035)
    if (code.length === 4 && num >= 1990 && num <= 2035) {
      return false;
    }
    return true;
  });

  // If we already have explicit code(s), return the primary one
  if (filtered.length > 0) {
    return filtered.slice(0, 1);
  }

  // 4. Standalone fallback only if nothing explicit was detected
  const standaloneMatches = combined.match(/\b\d{4,8}\b/g);
  if (standaloneMatches) {
    for (const m of standaloneMatches) {
      if (m === '1601') continue;
      const num = parseInt(m, 10);
      if (m.length === 4 && num >= 1990 && num <= 2035) continue;
      if (m.length === 5 && (num >= 90000 && num <= 99999)) continue; // US postal codes
      filtered.push(m);
      if (filtered.length >= 1) break;
    }
  }

  return filtered.slice(0, 1);
}
