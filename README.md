# Email Times / الايميل المؤقت

A modern, high-performance, bilingual (Arabic & English) disposable temporary email web service with custom lifetimes (10 minutes up to 7 days), real-time inbox updates, private link sharing, and automated server-side cleanup.

---

## Features

- **Real Mailboxes via mail.tm**: Powered directly by the official `api.mail.tm` network. Every address is fully functional, capable of receiving real emails, HTML messages, OTP verification codes, and file attachments.
- **Customizable Lifespans**:
  - `10 min` · `30 min` · `1 hour` (default) · `2 hours` · `6 hours` · `12 hours` · `1 day` · `2 days` · `3 days` · `7 days` (strictly enforced hard limit).
- **Live Countdown & Adaptive Progress**:
  - Days, Hours, Minutes, Seconds with tabular figures.
  - Smooth progress indicator with color transitions: Green (> 50%) → Amber (15% - 50%) → Red (< 15%).
  - Synchronized against server clock skew to stay accurate across devices and sleeping browser tabs.
- **Private Link Persistence**:
  - Unguessable cryptographic URL: `/{lang}/inbox/{slug}`.
  - Re-opening this link on any browser or device restores the exact mailbox, messages, and countdown until expiration.
- **Full Arabic (RTL) & English (LTR) Parity**:
  - Native translations with proper Arabic pluralization and terminology.
  - Logical CSS properties (`margin-inline`, `padding-inline`, mirrored navigation).
  - Strict preservation of LTR for email addresses, codes, and numerical tokens (`unicode-bidi: isolate`).
- **Security & Sandboxing**:
  - DOMPurify sanitized HTML rendered inside a sandboxed `<iframe>` with strict CSP (`default-src 'none'`).
  - Remote images and trackers blocked by default with 1-click "Load images" toggle.
  - External links enforce `target="_blank" rel="noopener noreferrer nofollow"` with `Referrer-Policy: no-referrer`.
  - Passwords encrypted at rest using AES-256-GCM.
- **One-Time Password (OTP) Extraction**:
  - Automatically identifies 4-8 digit verification codes and displays a 1-click "Copy Code" chip.
- **Dark & Light Themes**: Seamlessly switches and persists user preference.

---

## Environment Variables

Configured in `.env` (refer to `.env.example`):

```bash
# SmtpLabs API Key for elevated rate limits (4096 req/min) and reliability
SMTPLABS_API_KEY=smtplabs_zK7CnP9SpWDVSSxThndnvDGpz2EVYsXJbyLWYJ1zanVWQ24x
VITE_SMTPLABS_API_KEY=smtplabs_zK7CnP9SpWDVSSxThndnvDGpz2EVYsXJbyLWYJ1zanVWQ24x

# Port on which the application runs (default 3000)
PORT=3000

# Optional 32+ character master key for AES-256-GCM database encryption.
# If omitted, a persistent key is automatically generated in `data/secret.key`.
ENCRYPTION_SECRET=your_32_byte_secret_key_here

# App URL for absolute references and sitemaps
APP_URL=http://localhost:3000
```

---

## Running the Application

### Development
```bash
npm run dev
```
Starts the full-stack Express server with Vite middleware mounted at `http://0.0.0.0:3000`.

### Production Build
```bash
npm run build
npm start
```

---

## Scheduled Cleanup Job

The Express server in `server.ts` includes an integrated scheduled cleanup routine:

1. **Integrated Background Runner**:
   - Executes automatically every 5 minutes (and immediately on server startup).
   - Queries `SELECT * FROM mailboxes WHERE deleted_at IS NULL AND (expires_at <= ? OR created_at <= ?)`.
   - Obtains an authentication token for each expired account via `https://api.mail.tm/token`.
   - Calls `DELETE https://api.mail.tm/accounts/{accountId}` to permanently wipe the mailbox and all its messages.
   - Throttles requests to at most 4 calls per second to respect mail.tm rate limits.

2. **External Cron Execution (Optional)**:
   If running on a serverless container that sleeps between requests, you can invoke cleanup via a standard cron task:
   ```bash
   # Crontab entry to trigger cleanup every 5 minutes
   */5 * * * * curl -s -X POST http://localhost:3000/api/cleanup >/dev/null 2>&1
   ```

---

## Attribution & Terms of Use

This product interacts directly with the mail.tm API in compliance with mail.tm terms:
- Powered by [mail.tm](https://mail.tm).
