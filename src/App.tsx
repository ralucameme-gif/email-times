import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Language, Theme, MailboxAccount, MailtmMessageSummary } from './types';
import { translations } from './i18n/translations';
import {
  fetchDomains,
  createAccount,
  fetchToken,
  deleteAccount,
  fetchMessages,
  generateRandomUsername,
  generateRandomPassword,
} from './services/mailtm';
import {
  persistMailbox,
  getMailboxBySlug,
  deleteMailboxBySlug,
  syncServerTime,
  getServerNow,
} from './services/api';

import { Header } from './components/Header';
import { GeneratorCard } from './components/GeneratorCard';
import { AddressCard } from './components/AddressCard';
import { InboxList } from './components/InboxList';
import { MessageViewer } from './components/MessageViewer';
import { ChangeEmailModal } from './components/ChangeEmailModal';
import { ShareModal } from './components/ShareModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ExpiredNotice } from './components/ExpiredNotice';
import { HowItWorks } from './components/HowItWorks';
import { Features } from './components/Features';
import { FAQ } from './components/FAQ';
import { Footer } from './components/Footer';
import { LegalModals, LegalModalType } from './components/LegalModals';

export default function App() {
  // 1. Language & Theme Setup (Default to Arabic)
  const [lang, setLang] = useState<Language>(() => {
    const path = window.location.pathname;
    if (path.startsWith('/en')) return 'en';
    if (path.startsWith('/ar')) return 'ar';
    const saved = localStorage.getItem('email_times_lang');
    if (saved === 'ar' || saved === 'en') return saved;
    return 'ar';
  });

  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('email_times_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // 2. Mailbox State
  const [mailbox, setMailbox] = useState<MailboxAccount | null>(null);
  const [messages, setMessages] = useState<MailtmMessageSummary[]>([]);
  const [totalMessages, setTotalMessages] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState<MailtmMessageSummary | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatorError, setGeneratorError] = useState<string | null>(null);

  // Status flags for link resolution
  const [isExpired, setIsExpired] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);
  const [isResolvingSlug, setIsResolvingSlug] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const pathname = window.location.pathname;
    const hasSlugInUrl = /\/(?:en|ar)\/inbox\/([a-zA-Z0-9_-]+)/.test(pathname);
    const hasHash = !!window.location.hash;
    const hasSaved = !!localStorage.getItem('email_times_active_slug');
    return hasSlugInUrl || hasHash || hasSaved;
  });

  const mailboxRef = useRef<MailboxAccount | null>(null);
  useEffect(() => {
    mailboxRef.current = mailbox;
  }, [mailbox]);

  // Modals state
  const [isChangeEmailOpen, setIsChangeEmailOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [legalModal, setLegalModal] = useState<LegalModalType>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const t = translations[lang];

  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  // Update HTML attributes for language and theme
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('email_times_lang', lang);
  }, [lang]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('email_times_theme', theme);
  }, [theme]);

  // Sync server clock on mount
  useEffect(() => {
    syncServerTime();
  }, []);

  // Dynamic Browser Tab Title based on unread count
  useEffect(() => {
    const unread = messages.filter((m) => !m.seen).length;
    const baseTitle = t.brand;
    if (unread > 0) {
      document.title = `(${unread}) ${baseTitle}`;
    } else {
      document.title = `${baseTitle} — ${t.tagline}`;
    }
  }, [messages, lang, t.brand, t.tagline]);

  // Update URL without page reload
  const updateUrl = useCallback(
    (currentLang: Language, slug?: string) => {
      const newPath = slug ? `/${currentLang}/inbox/${slug}` : `/${currentLang}`;
      if (window.location.pathname !== newPath) {
        window.history.pushState(null, '', newPath);
      }
    },
    []
  );

  // Parse slug from current URL or hash
  const getSlugFromUrl = (): string | null => {
    const pathname = window.location.pathname;
    const match = pathname.match(/\/(?:en|ar)\/inbox\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) return match[1];

    // Fragment fallback support
    if (window.location.hash) {
      const cleanHash = window.location.hash.replace(/^#/, '');
      if (cleanHash && cleanHash.length >= 10 && !cleanHash.includes('=')) {
        return cleanHash;
      }
    }
    return null;
  };

  // Load mailbox messages from mail.tm (stable callback with no dependency cycles)
  const loadMessages = useCallback(
    async (token: string, silent = false) => {
      if (!silent) setIsLoadingMessages(true);
      try {
        const result = await fetchMessages(token, 1);
        setMessages(result.messages);
        setTotalMessages(result.totalItems);
        setLastUpdatedTime(Date.now());
      } catch (err: any) {
        // If 401 token expired, re-authenticate if we have stored credentials
        const currentMbox = mailboxRef.current;
        if (err?.status === 401 && currentMbox) {
          try {
            const newToken = await fetchToken(currentMbox.address, currentMbox.password);
            setMailbox((prev) => (prev ? { ...prev, token: newToken } : null));
            const retry = await fetchMessages(newToken, 1);
            setMessages(retry.messages);
            setTotalMessages(retry.totalItems);
            setLastUpdatedTime(Date.now());
          } catch {
            // failed refresh
          }
        }
      } finally {
        if (!silent) setIsLoadingMessages(false);
      }
    },
    []
  );

  // Setup mailbox session
  const initializeMailboxSession = useCallback(
    async (
      slug: string,
      address: string,
      accountId: string,
      password: string,
      expiresAt: number,
      durationSeconds: number,
      targetLang?: Language
    ) => {
      const token = await fetchToken(address, password);
      const newMailbox: MailboxAccount = {
        slug,
        address,
        accountId,
        password,
        token,
        createdAt: Date.now(),
        expiresAt,
        durationSeconds,
      };

      setMailbox(newMailbox);
      setIsExpired(false);
      setIsNotFound(false);
      localStorage.setItem('email_times_active_slug', slug);
      if (targetLang) {
        updateUrl(targetLang, slug);
      }
      loadMessages(token, false);
      return newMailbox;
    },
    [updateUrl, loadMessages]
  );

  // Create mailbox handler
  const handleGenerateMailbox = useCallback(
    async (durationSeconds: number) => {
      setIsGenerating(true);
      setGeneratorError(null);

      try {
        const domainList = await fetchDomains();
        if (!domainList || domainList.length === 0) {
          throw new Error('No active email domains available from mail.tm');
        }

        const activeDomain = domainList[0].domain;
        let createdAccount: { id: string; address: string } | null = null;
        let generatedPass = '';

        // Retry up to 3 times on 422 collision
        for (let attempt = 0; attempt < 3; attempt++) {
          const username = generateRandomUsername();
          const address = `${username}@${activeDomain}`;
          generatedPass = generateRandomPassword();

          try {
            createdAccount = await createAccount(address, generatedPass);
            break;
          } catch (err: any) {
            if (attempt === 2) throw err;
          }
        }

        if (!createdAccount) {
          throw new Error('Could not initialize account');
        }

        // Persist to backend
        const persistData = await persistMailbox(
          createdAccount.address,
          generatedPass,
          createdAccount.id,
          durationSeconds
        );

        // Authenticate with mail.tm
        await initializeMailboxSession(
          persistData.slug,
          createdAccount.address,
          createdAccount.id,
          generatedPass,
          persistData.expiresAt,
          durationSeconds,
          lang
        );

        showToast(translations[lang].copiedToast);
      } catch (err: any) {
        console.error('Account creation error:', err);
        setGeneratorError(err?.message || translations[lang].errorGeneric);
      } finally {
        setIsGenerating(false);
      }
    },
    [lang, initializeMailboxSession, showToast]
  );

  // Restore mailbox on initial mount or auto-generate on first visit (runs strictly ONCE)
  const hasMountedRef = useRef(false);
  useEffect(() => {
    if (hasMountedRef.current) return;
    hasMountedRef.current = true;

    const slugFromUrl = getSlugFromUrl();
    const savedSlug = localStorage.getItem('email_times_active_slug');
    const targetSlug = slugFromUrl || savedSlug;

    // Safety timeout in case of slow network: never hang UI more than 3.5s
    const safetyTimer = setTimeout(() => {
      setIsResolvingSlug(false);
    }, 3500);

    if (targetSlug) {
      getMailboxBySlug(targetSlug)
        .then(async (data) => {
          const now = getServerNow();
          if (data.expiresAt <= now) {
            setIsExpired(true);
            localStorage.removeItem('email_times_active_slug');
            clearTimeout(safetyTimer);
            setIsResolvingSlug(false);
            return;
          }

          const duration = Math.round((data.expiresAt - now) / 1000);
          await initializeMailboxSession(
            targetSlug,
            data.address,
            data.accountId,
            data.password,
            data.expiresAt,
            duration > 0 ? duration : 3600,
            lang
          );
          clearTimeout(safetyTimer);
          setIsResolvingSlug(false);
        })
        .catch((err) => {
          if (err?.message === 'EXPIRED') {
            setIsExpired(true);
          } else if (err?.message === 'NOT_FOUND') {
            setIsNotFound(true);
          }
          localStorage.removeItem('email_times_active_slug');
          clearTimeout(safetyTimer);
          setIsResolvingSlug(false);
        });
    } else {
      // First-time visit with no mailbox: auto-generate an address immediately!
      clearTimeout(safetyTimer);
      setIsResolvingSlug(false);
      handleGenerateMailbox(3600);
    }

    return () => clearTimeout(safetyTimer);
  }, [lang, initializeMailboxSession, handleGenerateMailbox]);

  // Polling loop: Every 10 seconds while tab is visible
  useEffect(() => {
    if (!mailbox?.token || isExpired) return;

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadMessages(mailbox.token!, true);
      }
    }, 10000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadMessages(mailbox.token!, true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [mailbox?.token, isExpired, loadMessages]);

  // Real-time EventSource / SSE connection to Mercure hub (optional real-time sync with polling fallback)
  useEffect(() => {
    if (!mailbox?.token || !mailbox.accountId || isExpired) return;

    let eventSource: EventSource | null = null;
    try {
      const hubUrl = new URL('https://mercure.mail.tm/.well-known/mercure');
      hubUrl.searchParams.append('topic', `/accounts/${mailbox.accountId}`);
      // Standard EventSource does not support headers; if query param token is accepted by mercure
      // or we rely on our 10s auto-polling fallback
      eventSource = new EventSource(hubUrl.toString());
      eventSource.onmessage = () => {
        loadMessages(mailbox.token!, true);
      };
    } catch {
      // Ignored: polling will handle updates
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [mailbox?.token, mailbox?.accountId, isExpired, loadMessages]);


  // Change Email handler: deletes old account, creates new one
  const handleConfirmChangeEmail = async (
    mode: 'random' | 'custom',
    customUsername: string,
    domain: string,
    durationSeconds: number
  ) => {
    let domainToUse = domain;
    if (!domainToUse) {
      const domains = await fetchDomains();
      domainToUse = domains[0]?.domain;
    }

    const username = mode === 'custom' ? customUsername : generateRandomUsername();
    const newAddress = `${username}@${domainToUse}`;
    const newPassword = generateRandomPassword();

    // Create new account first
    const newAccount = await createAccount(newAddress, newPassword);

    // If we have an existing mailbox, delete it in the background
    if (mailbox) {
      try {
        if (mailbox.token) {
          deleteAccount(mailbox.accountId, mailbox.token).catch(() => {});
        }
        deleteMailboxBySlug(mailbox.slug).catch(() => {});
      } catch {
        // ignore
      }
    }

    // Persist new mailbox
    const persistData = await persistMailbox(
      newAccount.address,
      newPassword,
      newAccount.id,
      durationSeconds
    );

    setSelectedMessage(null);
    setMessages([]);
    await initializeMailboxSession(
      persistData.slug,
      newAccount.address,
      newAccount.id,
      newPassword,
      persistData.expiresAt,
      durationSeconds
    );

    showToast(t.copiedToast);
  };

  // Delete mailbox handler
  const handleConfirmDelete = async () => {
    if (!mailbox) return;
    setIsDeleting(true);
    try {
      if (mailbox.token) {
        await deleteAccount(mailbox.accountId, mailbox.token).catch(() => {});
      }
      await deleteMailboxBySlug(mailbox.slug).catch(() => {});

      localStorage.removeItem('email_times_active_slug');
      setMailbox(null);
      setMessages([]);
      setSelectedMessage(null);
      setIsDeleteOpen(false);
      updateUrl(lang);
    } catch {
      showToast(t.errorGeneric);
    } finally {
      setIsDeleting(false);
    }
  };

  // Expiration handler: triggered by countdown reaching zero
  const handleExpire = useCallback(() => {
    setIsExpired(true);
    localStorage.removeItem('email_times_active_slug');
    if (mailbox?.slug) {
      deleteMailboxBySlug(mailbox.slug).catch(() => {});
    }
    setMailbox(null);
    setMessages([]);
    setSelectedMessage(null);
  }, [mailbox?.slug]);

  // Create brand new mailbox from expired / not found screen
  const handleResetToGenerator = () => {
    setIsExpired(false);
    setIsNotFound(false);
    setMailbox(null);
    setMessages([]);
    setSelectedMessage(null);
    localStorage.removeItem('email_times_active_slug');
    updateUrl(lang);
  };

  // Language switch
  const handleSelectLang = (newLang: Language) => {
    setLang(newLang);
    updateUrl(newLang, mailbox?.slug);
  };

  // Theme switch (Day/Night)
  const handleSelectTheme = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Header */}
      <Header
        lang={lang}
        theme={theme}
        onSelectLang={handleSelectLang}
        onSelectTheme={handleSelectTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 sm:space-y-12">
        {/* Soft Gradient Hero Section */}
        <section className="text-center max-w-3xl mx-auto pt-2 pb-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-4 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span>{t.badgeSecure}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-700 via-violet-700 to-cyan-600 dark:from-indigo-300 dark:via-violet-200 dark:to-cyan-300 bg-clip-text text-transparent pb-1">
            {t.tagline}
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>
        </section>

        {/* Dynamic State View */}
        {isResolvingSlug ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm">{t.refreshing}</p>
          </div>
        ) : isExpired || isNotFound ? (
          <ExpiredNotice
            lang={lang}
            onCreateNew={handleResetToGenerator}
            isNotFound={isNotFound}
          />
        ) : !mailbox ? (
          /* Generator View */
          <GeneratorCard
            lang={lang}
            onGenerate={handleGenerateMailbox}
            isLoading={isGenerating}
            error={generatorError}
          />
        ) : (
          /* Active Mailbox & Inbox View */
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
            {/* Active Address Card */}
            <AddressCard
              mailbox={mailbox}
              lang={lang}
              onOpenChangeEmail={() => setIsChangeEmailOpen(true)}
              onOpenShare={() => setIsShareOpen(true)}
              onOpenDelete={() => setIsDeleteOpen(true)}
              onExpire={handleExpire}
              onToast={showToast}
            />

            {/* Live Inbox & Message Viewer: 2-Column Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Inbox Messages List */}
              <div
                className={`lg:col-span-5 h-[620px] ${
                  selectedMessage ? 'hidden lg:block' : 'block'
                }`}
              >
                <InboxList
                  messages={messages}
                  selectedMessageId={selectedMessage?.id || null}
                  onSelectMessage={(msg) => setSelectedMessage(msg)}
                  isLoading={isLoadingMessages}
                  onRefresh={() => loadMessages(mailbox.token!, false)}
                  lastUpdatedTime={lastUpdatedTime}
                  totalMessages={totalMessages}
                  lang={lang}
                />
              </div>

              {/* Message Viewer Pane */}
              <div
                className={`lg:col-span-7 h-[620px] ${
                  selectedMessage ? 'block' : 'hidden lg:block'
                }`}
              >
                <MessageViewer
                  messageSummary={selectedMessage}
                  token={mailbox.token || ''}
                  lang={lang}
                  onBack={() => setSelectedMessage(null)}
                  onDeleted={(id) => {
                    setMessages((prev) => prev.filter((m) => m.id !== id));
                    setSelectedMessage(null);
                  }}
                  onToast={showToast}
                />
              </div>
            </div>
          </div>
        )}

        {/* Informative & SEO Content Sections */}
        <HowItWorks lang={lang} />
        <Features lang={lang} />
        <FAQ lang={lang} />
      </main>

      {/* Footer */}
      <Footer
        lang={lang}
        theme={theme}
        onOpenLegal={(type) => setLegalModal(type)}
        onSelectLang={handleSelectLang}
        onSelectTheme={handleSelectTheme}
      />

      {/* Modals */}
      <ChangeEmailModal
        isOpen={isChangeEmailOpen}
        onClose={() => setIsChangeEmailOpen(false)}
        lang={lang}
        currentLifetimeSeconds={mailbox?.durationSeconds || 3600}
        onConfirmChange={handleConfirmChangeEmail}
      />

      {mailbox && (
        <ShareModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          lang={lang}
          slug={mailbox.slug}
          onToast={showToast}
        />
      )}

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        lang={lang}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      <LegalModals
        type={legalModal}
        onClose={() => setLegalModal(null)}
        lang={lang}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-slate-900/95 dark:bg-slate-100 text-white dark:text-slate-900 font-medium text-xs sm:text-sm shadow-xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150"
        >
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
