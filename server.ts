// Suppress ExperimentalWarning for cleaner logs
process.removeAllListeners('warning');
process.on('warning', (warning) => {
  if (warning.name === 'ExperimentalWarning') return;
  console.warn(warning.name, warning.message);
});

import express from 'express';
import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists - use /tmp on Vercel (read-only filesystem)
const isVercel = !!process.env.VERCEL;
const dataDir = isVercel ? path.join('/tmp', 'data') : path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Master encryption key for passwords in database
const secretKeyPath = path.join(dataDir, 'secret.key');
let masterKey: Buffer;
if (process.env.ENCRYPTION_SECRET && process.env.ENCRYPTION_SECRET.length >= 32) {
  masterKey = crypto.createHash('sha256').update(process.env.ENCRYPTION_SECRET).digest();
} else if (fs.existsSync(secretKeyPath)) {
  masterKey = fs.readFileSync(secretKeyPath);
} else {
  masterKey = crypto.randomBytes(32);
  fs.writeFileSync(secretKeyPath, masterKey);
}

function encryptPassword(text: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', masterKey, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

function decryptPassword(encryptedStr: string): string {
  const parts = encryptedStr.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted format');
  }
  const [ivHex, authTagHex, encrypted] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', masterKey, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Initialize SQLite database
const dbPath = path.join(dataDir, 'mailboxes.db');
const db = new DatabaseSync(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS mailboxes (
    slug TEXT PRIMARY KEY,
    address TEXT NOT NULL,
    account_id TEXT NOT NULL,
    password_encrypted TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    deleted_at INTEGER
  );
  CREATE INDEX IF NOT EXISTS idx_mailboxes_expires ON mailboxes(expires_at);
  CREATE INDEX IF NOT EXISTS idx_mailboxes_deleted ON mailboxes(deleted_at);
`);

// Prepared statements
const insertMailboxStmt = db.prepare(`
  INSERT INTO mailboxes (slug, address, account_id, password_encrypted, created_at, expires_at, deleted_at)
  VALUES (?, ?, ?, ?, ?, ?, NULL)
`);

const getMailboxBySlugStmt = db.prepare(`
  SELECT slug, address, account_id, password_encrypted, created_at, expires_at, deleted_at
  FROM mailboxes
  WHERE slug = ?
`);

const markDeletedStmt = db.prepare(`
  UPDATE mailboxes
  SET deleted_at = ?
  WHERE slug = ?
`);

const getExpiredMailboxesStmt = db.prepare(`
  SELECT slug, address, account_id, password_encrypted, expires_at
  FROM mailboxes
  WHERE deleted_at IS NULL AND (expires_at <= ? OR created_at <= ?)
  LIMIT 50
`);

// Simple in-memory per-IP rate limiter
const ipRequests = new Map<string, { count: number; resetAt: number }>();
function rateLimit(limit: number, windowMs: number) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();
    const clientRecord = ipRequests.get(ip);
    if (!clientRecord || now > clientRecord.resetAt) {
      ipRequests.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }
    if (clientRecord.count >= limit) {
      return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
    }
    clientRecord.count += 1;
    return next();
  };
}

// SmtpLabs API Key - uses your env var, falls back to built-in key
const SMTPLABS_API_KEY = process.env.SMTPLABS_API_KEY || 'smtplabs_zK7CnP9SpWDVSSxThndnvDGpz2EVYsXJbyLhWYJ1zanVwQ24x';

// Scheduled mail.tm account cleanup job
async function cleanupExpiredMailboxes() {
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  try {
    const expiredRows = getExpiredMailboxesStmt.all(now, sevenDaysAgo) as Array<{
      slug: string;
      address: string;
      account_id: string;
      password_encrypted: string;
      expires_at: number;
    }>;

    if (expiredRows.length === 0) return;

    for (const row of expiredRows) {
      try {
        let password = '';
        try {
          password = decryptPassword(row.password_encrypted);
        } catch {
          markDeletedStmt.run(now, row.slug);
          continue;
        }

        await new Promise((r) => setTimeout(r, 260));

        const tokenRes = await fetch('https://api.mail.tm/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': SMTPLABS_API_KEY,
          },
          body: JSON.stringify({ address: row.address, password }),
        });

        if (tokenRes.ok) {
          const tokenData = (await tokenRes.json()) as { token?: string };
          if (tokenData.token) {
            await fetch(`https://api.mail.tm/accounts/${row.account_id}`, {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${tokenData.token}`,
                'X-API-KEY': SMTPLABS_API_KEY,
              },
            });
          }
        }
        markDeletedStmt.run(now, row.slug);
      } catch (err) {
        console.error(`Failed to clean up mailbox ${row.slug}:`, err);
      }
    }
  } catch (error) {
    console.error('Error during expired mailboxes cleanup:', error);
  }
}

// Start cleanup loop every 5 minutes (skip on Vercel serverless)
if (!isVercel) {
  setTimeout(() => {
    cleanupExpiredMailboxes();
    setInterval(cleanupExpiredMailboxes, 5 * 60 * 1000);
  }, 5000);
}

const app = express();
app.use(express.json());

// API Routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', serverTime: Date.now() });
});

app.get('/api/time', (_req, res) => {
  res.json({ serverTime: Date.now() });
});

app.get('/api/config', (_req, res) => {
  res.json({
    smtplabsApiKey: SMTPLABS_API_KEY,
  });
});

// Proxy for mail.tm to overcome browser CORS limitations and attach SmtpLabs API Key
app.all('/api/mail/*', async (req, res) => {
  const targetPath = req.originalUrl.replace(/^\/api\/mail/, '');
  const targetUrl = `https://api.mail.tm${targetPath}`;

  const headers: Record<string, string> = {
    'X-API-KEY': SMTPLABS_API_KEY,
  };
  if (req.headers['authorization']) {
    headers['Authorization'] = req.headers['authorization'] as string;
  }
  if (req.headers['content-type']) {
    headers['Content-Type'] = req.headers['content-type'] as string;
  }

  try {
    const fetchOptions: RequestInit = {
      method: req.method,
      headers,
    };
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body && Object.keys(req.body).length > 0) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const mailRes = await fetch(targetUrl, fetchOptions);
    const contentType = mailRes.headers.get('content-type') || '';
    res.status(mailRes.status);

    if (mailRes.status === 204) {
      return res.send();
    }

    if (contentType.includes('application/json') || contentType.includes('application/ld+json')) {
      const data = await mailRes.json();
      return res.json(data);
    } else {
      const buffer = await mailRes.arrayBuffer();
      if (contentType) res.setHeader('Content-Type', contentType);
      return res.send(Buffer.from(buffer));
    }
  } catch (err: any) {
    console.error('Mail proxy error:', err);
    return res.status(502).json({ error: 'Mail service temporarily unreachable' });
  }
});

// Create mailbox record
app.post('/api/mailboxes', rateLimit(25, 60 * 1000), async (req, res) => {
  try {
    const { address, password, accountId, durationSeconds } = req.body;

    if (!address || !password || !accountId || typeof durationSeconds !== 'number') {
      return res.status(400).json({ error: 'Missing required mailbox fields' });
    }

    const MIN_DURATION = 600;
    const MAX_DURATION = 7 * 24 * 60 * 60;
    if (durationSeconds < MIN_DURATION || durationSeconds > MAX_DURATION) {
      return res.status(400).json({
        error: `Duration must be between 10 minutes and 7 days (${MIN_DURATION}s to ${MAX_DURATION}s).`,
      });
    }

    try {
      const verifyRes = await fetch('https://api.mail.tm/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': SMTPLABS_API_KEY,
        },
        body: JSON.stringify({ address, password }),
      });

      if (!verifyRes.ok) {
        return res.status(400).json({ error: 'Verification failed with mail.tm credentials' });
      }
    } catch {
      return res.status(502).json({ error: 'Could not connect to mail.tm' });
    }

    const slug = crypto.randomBytes(18).toString('base64url');
    const now = Date.now();
    const expiresAt = now + Math.floor(durationSeconds * 1000);
    const encryptedPassword = encryptPassword(password);

    insertMailboxStmt.run(slug, address, accountId, encryptedPassword, now, expiresAt);

    return res.json({
      slug,
      expiresAt,
      serverTime: now,
    });
  } catch (error) {
    console.error('Error creating mailbox:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get mailbox by slug
app.get('/api/mailboxes/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ error: 'Invalid slug' });
    }

    const row = getMailboxBySlugStmt.get(slug) as {
      slug: string;
      address: string;
      account_id: string;
      password_encrypted: string;
      created_at: number;
      expires_at: number;
      deleted_at: number | null;
    } | undefined;

    if (!row) {
      return res.status(404).json({ error: 'Mailbox not found' });
    }

    const now = Date.now();
    if (row.deleted_at !== null || row.expires_at <= now) {
      return res.status(410).json({ error: 'This mailbox has expired and was deleted.' });
    }

    const password = decryptPassword(row.password_encrypted);

    return res.json({
      address: row.address,
      accountId: row.account_id,
      password,
      expiresAt: row.expires_at,
      serverTime: now,
    });
  } catch (error) {
    console.error('Error fetching mailbox:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete mailbox by slug
app.delete('/api/mailboxes/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const row = getMailboxBySlugStmt.get(slug) as {
      slug: string;
      address: string;
      account_id: string;
      password_encrypted: string;
      deleted_at: number | null;
    } | undefined;

    if (row && row.deleted_at === null) {
      const now = Date.now();
      markDeletedStmt.run(now, slug);

      try {
        const password = decryptPassword(row.password_encrypted);
        const tokenRes = await fetch('https://api.mail.tm/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': SMTPLABS_API_KEY,
          },
          body: JSON.stringify({ address: row.address, password }),
        });
        if (tokenRes.ok) {
          const { token } = (await tokenRes.json()) as { token?: string };
          if (token) {
            await fetch(`https://api.mail.tm/accounts/${row.account_id}`, {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${token}`,
                'X-API-KEY': SMTPLABS_API_KEY,
              },
            });
          }
        }
      } catch {
        // Ignored
      }
    }

    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting mailbox:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Robots.txt
app.get('/robots.txt', (req, res) => {
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol;
  res.type('text/plain');
  res.send(`User-agent: *
Disallow: /*/inbox/*
Disallow: /api/
Allow: /
Allow: /en
Allow: /ar

Sitemap: ${protocol}://${host}/sitemap.xml
`);
});

// Sitemap.xml
app.get('/sitemap.xml', (req, res) => {
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol;
  const baseUrl = `${protocol}://${host}`;
  res.type('application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${baseUrl}/</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en" />
    <xhtml:link rel="alternate" hreflang="ar" href="${baseUrl}/ar" />
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/en</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en" />
    <xhtml:link rel="alternate" hreflang="ar" href="${baseUrl}/ar" />
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/ar</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en" />
    <xhtml:link rel="alternate" hreflang="ar" href="${baseUrl}/ar" />
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>
`);
});

// Dev vs Production static/Vite handling
const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // On Vercel, dist is in different location - handle both
    const possibleDistPaths = [
      path.join(__dirname, 'dist'),
      path.join(__dirname, '..', 'dist'),
      path.join(process.cwd(), 'dist')
    ];
    let distPath = possibleDistPaths[0];
    for (const p of possibleDistPaths) {
      if (fs.existsSync(p)) {
        distPath = p;
        break;
      }
    }
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  if (!isVercel) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Email Times server running at http://0.0.0.0:${PORT}`);
    });
  }
}

startServer();

// Export for Vercel serverless
export default app;
