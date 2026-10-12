const API = "https://api.mail.tm";

export async function getDomains(): Promise<string[]> {
  try {
    try {
      const local = await fetch("/api/mail/domains");
      if (local.ok) {
        const d = await local.json();
        if (Array.isArray(d) && d.length > 0) return d;
      }
    } catch {}
    const r = await fetch(`${API}/domains?page=1`);
    if (!r.ok) throw new Error("mail.tm fail");
    const j = await r.json();
    const domains = (j["hydra:member"] || []).map((x:any)=>x.domain).filter(Boolean);
    if (domains.length > 0) return domains;
    throw new Error("empty");
  } catch (e) {
    console.warn("Using fallback maxxspace.com", e);
    return ["maxxspace.com"];
  }
}

export async function createAccount(address: string, password: string) {
  const r = await fetch(`${API}/accounts`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({address, password})
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(t);
  }
  return r.json();
}

export async function getToken(address: string, password: string) {
  const r = await fetch(`${API}/token`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({address, password})
  });
  if (!r.ok) throw new Error("token failed");
  const j = await r.json();
  return j.token as string;
}

export async function getMessages(token: string) {
  const r = await fetch(`${API}/messages?page=1`, {
    headers: {Authorization: `Bearer ${token}`}
  });
  if (!r.ok) return [];
  const j = await r.json();
  return j["hydra:member"] || [];
}

export async function getMessage(token: string, id: string) {
  const r = await fetch(`${API}/messages/${id}`, {
    headers: {Authorization: `Bearer ${token}`}
  });
  if (!r.ok) throw new Error("message not found");
  return r.json();
}
