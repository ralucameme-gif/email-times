export interface PersistResponse {
  slug: string;
  expiresAt: number;
  serverTime: number;
}

export interface GetMailboxResponse {
  address: string;
  accountId: string;
  password: string;
  expiresAt: number;
  serverTime: number;
}

let serverClockOffset = 0;

export async function syncServerTime(): Promise<number> {
  try {
    const start = Date.now();
    const res = await fetch('/api/time');
    if (res.ok) {
      const data = await res.json();
      const end = Date.now();
      const latency = (end - start) / 2;
      serverClockOffset = data.serverTime - (end - latency);
    }
  } catch {
    // Keep 0 if failed
  }
  return serverClockOffset;
}

export function getServerNow(): number {
  return Date.now() + serverClockOffset;
}

export async function persistMailbox(
  address: string,
  password: string,
  accountId: string,
  durationSeconds: number
): Promise<PersistResponse> {
  const res = await fetch('/api/mailboxes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, password, accountId, durationSeconds }),
  });

  if (!res.ok) {
    let err = 'Failed to persist mailbox';
    try {
      const data = await res.json();
      if (data.error) err = data.error;
    } catch {
      // ignore
    }
    throw new Error(err);
  }

  const data: PersistResponse = await res.json();
  if (data.serverTime) {
    serverClockOffset = data.serverTime - Date.now();
  }
  return data;
}

export async function getMailboxBySlug(slug: string): Promise<GetMailboxResponse> {
  const res = await fetch(`/api/mailboxes/${slug}`);
  if (res.status === 404) {
    throw new Error('NOT_FOUND');
  }
  if (res.status === 410) {
    throw new Error('EXPIRED');
  }
  if (!res.ok) {
    throw new Error('Failed to retrieve mailbox');
  }

  const data: GetMailboxResponse = await res.json();
  if (data.serverTime) {
    serverClockOffset = data.serverTime - Date.now();
  }
  return data;
}

export async function deleteMailboxBySlug(slug: string): Promise<void> {
  await fetch(`/api/mailboxes/${slug}`, {
    method: 'DELETE',
  });
}
