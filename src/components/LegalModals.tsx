import React from 'react';
import { X, Shield, FileText, Mail } from 'lucide-react';
import { Language } from '../types';

export type LegalModalType = 'privacy' | 'terms' | 'contact' | null;

interface LegalModalsProps {
  type: LegalModalType;
  onClose: () => void;
  lang: Language;
}

export const LegalModals: React.FC<LegalModalsProps> = ({ type, onClose, lang }) => {
  if (!type) return null;

  const isArabic = lang === 'ar';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl max-h-[85vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 transition-colors overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            {type === 'privacy' && <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
            {type === 'terms' && <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
            {type === 'contact' && <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {type === 'privacy' && (isArabic ? 'سياسة الخصوصية' : 'Privacy Policy')}
              {type === 'terms' && (isArabic ? 'شروط الاستخدام' : 'Terms of Service')}
              {type === 'contact' && (isArabic ? 'اتصل بنا' : 'Contact Us')}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-3.5 leading-relaxed">
          {type === 'privacy' && (
            <>
              <p>
                {isArabic
                  ? 'في "الايميل المؤقت"، نضع خصوصيتك في المقام الأول. نحن لا نطلب أي بيانات شخصية، لا أرقام هواتف، ولا عناوين بريد حقيقية لإنشاء الصناديق.'
                  : 'At Email Times, we put your privacy first. We do not require any personal data, phone numbers, or existing email addresses to create mailboxes.'}
              </p>
              <h4 className="font-bold text-slate-900 dark:text-white pt-1">
                {isArabic ? 'الحذف التلقائي' : 'Automatic Data Wiping'}
              </h4>
              <p>
                {isArabic
                  ? 'يتم تحديد مدة صلاحية لكل عنوان (بين 10 دقائق و7 أيام). فور انتهاء المدة المحددة، يُحذف الحساب وجميع رسائله بشكل دائم من الخوادم.'
                  : 'Every address has a user-selected lifespan (10 minutes up to 7 days). Once this expires, the account and all messages are permanently deleted from mail servers.'}
              </p>
              <h4 className="font-bold text-slate-900 dark:text-white pt-1">
                {isArabic ? 'الروابط الخاصة' : 'Private Access Links'}
              </h4>
              <p>
                {isArabic
                  ? 'روابط الوصول غير قابلة للتخمين (معرّفات مشفرة 24 رمزاً). تقع مسؤولية الحفاظ على سرية الرابط على المستخدم.'
                  : 'Share links use unguessable 24-character cryptographic identifiers. Users are responsible for keeping private links confidential.'}
              </p>
            </>
          )}

          {type === 'terms' && (
            <>
              <p>
                {isArabic
                  ? 'باستخدام خدمة "الايميل المؤقت"، فإنك توافق على الالتزام بشروط الاستخدام المعمول بها.'
                  : 'By using Email Times, you agree to comply with our acceptable use terms and conditions.'}
              </p>
              <h4 className="font-bold text-slate-900 dark:text-white pt-1">
                {isArabic ? 'الاستخدام المشروع' : 'Acceptable Use'}
              </h4>
              <p>
                {isArabic
                  ? 'يُحظر استخدام هذه الخدمة في أي أنشطة غير قانونية، إرسال رسائل احتيالية أو ضارة، أو انتهاك شروط مزودي الخدمات الآخرين.'
                  : 'You may not use this service for illegal activities, spam transmission, fraud, or violation of third-party terms of service.'}
              </p>
              <h4 className="font-bold text-slate-900 dark:text-white pt-1">
                {isArabic ? 'مزود الخدمة' : 'Service Provider'}
              </h4>
              <p>
                {isArabic
                  ? 'يتم تشغيل الاتصال البريدي عبر شبكة mail.tm الرسمية ووفقاً لشروط استخدامها.'
                  : 'Mailbox communications are powered via the official mail.tm network in accordance with their API guidelines.'}
              </p>
            </>
          )}

          {type === 'contact' && (
            <>
              <p>
                {isArabic
                  ? 'إذا كان لديك أي استفسار أو اقتراح حول خدمة الايميل المؤقت، يسعدنا تواصلك معنا.'
                  : 'Have questions, feedback, or suggestions about Email Times? We would love to hear from you.'}
              </p>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <p className="font-semibold text-slate-900 dark:text-white">Email Times Support</p>
                <p className="font-mono text-indigo-600 dark:text-indigo-400 tech-ltr">support@emailtimes.app</p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            {isArabic ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
