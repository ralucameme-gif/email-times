export type Language = 'en' | 'ar';
export type Theme = 'light' | 'dark';

export interface MailboxAccount {
  slug: string;
  address: string;
  accountId: string;
  password: string;
  token?: string;
  createdAt: number;
  expiresAt: number;
  durationSeconds: number;
}

export interface MailtmDomain {
  id: string;
  domain: string;
  isActive: boolean;
  isPrivate: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MailtmMessageSummary {
  id: string;
  accountId: string;
  msgid: string;
  from: {
    name: string;
    address: string;
  };
  to: Array<{
    name: string;
    address: string;
  }>;
  subject: string;
  intro: string;
  seen: boolean;
  isFlagged?: boolean;
  isDeleted?: boolean;
  hasAttachments: boolean;
  size: number;
  createdAt: string;
  updatedAt?: string;
}

export interface MailtmAttachment {
  id: string;
  filename: string;
  contentType: string;
  disposition: string;
  transferEncoding: string;
  size: number;
  downloadUrl: string;
}

export interface MailtmMessageDetail {
  id: string;
  accountId: string;
  msgid: string;
  from: {
    name: string;
    address: string;
  };
  to: Array<{
    name: string;
    address: string;
  }>;
  cc?: Array<{
    name: string;
    address: string;
  }>;
  bcc?: Array<{
    name: string;
    address: string;
  }>;
  subject: string;
  text?: string;
  html?: string[];
  seen: boolean;
  isFlagged?: boolean;
  isDeleted?: boolean;
  hasAttachments: boolean;
  size: number;
  createdAt: string;
  updatedAt?: string;
  attachments?: MailtmAttachment[];
}

export interface LifetimeOption {
  id: string;
  labelEn: string;
  labelAr: string;
  seconds: number;
}

export const LIFETIME_OPTIONS: LifetimeOption[] = [
  { id: '10m', labelEn: '10 min', labelAr: '10 دقائق', seconds: 10 * 60 },
  { id: '30m', labelEn: '30 min', labelAr: '30 دقيقة', seconds: 30 * 60 },
  { id: '1h', labelEn: '1 hour', labelAr: 'ساعة واحدة', seconds: 60 * 60 },
  { id: '2h', labelEn: '2 hours', labelAr: 'ساعتان', seconds: 2 * 60 * 60 },
  { id: '6h', labelEn: '6 hours', labelAr: '6 ساعات', seconds: 6 * 60 * 60 },
  { id: '12h', labelEn: '12 hours', labelAr: '12 ساعة', seconds: 12 * 60 * 60 },
  { id: '1d', labelEn: '1 day', labelAr: 'يوم واحد', seconds: 24 * 60 * 60 },
  { id: '2d', labelEn: '2 days', labelAr: 'يومان', seconds: 2 * 24 * 60 * 60 },
  { id: '3d', labelEn: '3 days', labelAr: '3 أيام', seconds: 3 * 24 * 60 * 60 },
  { id: '7d', labelEn: '7 days', labelAr: '7 أيام (أقصى مدة)', seconds: 7 * 24 * 60 * 60 },
];
