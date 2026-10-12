import { Language } from '../types';

export const translations = {
  en: {
    brand: 'Email Times',
    tagline: 'Disposable email that disappears on your schedule.',
    subtitle:
      'Get a real, functional temporary email with a live inbox. Choose a lifetime from 10 minutes to 7 days. Return or share via private link until it auto-deletes.',
    badgeSecure: '100% Private & No Sign-up',

    // Generator & Address Card
    generatorTitle: 'Create your temporary email',
    generatorDesc: 'Choose mailbox lifespan and generate your address in seconds.',
    chooseLifespan: 'Choose lifespan',
    maxLifespanNote: 'Maximum lifetime is 7 days. Enforced automatically.',
    createButton: 'Create Email',
    creatingButton: 'Generating mailbox...',
    activeAddressLabel: 'Your Temporary Email Address',
    copyAddress: 'Copy address',
    copiedToast: 'Address copied to clipboard!',
    linkCopiedToast: 'Private link copied to clipboard!',
    codeCopiedToast: 'Verification code copied!',

    // Actions
    actionCopy: 'Copy',
    actionCopied: 'Copied',
    actionShare: 'Share',
    actionCopyLink: 'Copy link',
    actionChangeEmail: 'Change email',
    actionDeleteNow: 'Delete now',
    actionCreateNew: 'Create new email',

    // Countdown
    timeRemaining: 'Time remaining until auto-delete',
    days: 'd',
    hours: 'h',
    minutes: 'm',
    seconds: 's',
    daysFull: 'Days',
    hoursFull: 'Hours',
    minutesFull: 'Minutes',
    secondsFull: 'Seconds',
    expiresAt: 'Expires at',

    // Inbox
    inboxTitle: 'Inbox',
    unreadCount: 'unread',
    refreshButton: 'Refresh inbox',
    refreshing: 'Checking for emails...',
    lastUpdated: 'Updated',
    justNow: 'just now',
    secondsAgo: 's ago',
    minutesAgo: 'm ago',
    hoursAgo: 'h ago',
    noSubject: '(no subject)',
    noSender: 'Unknown sender',
    emptyInboxTitle: 'Waiting for incoming emails…',
    emptyInboxDesc:
      'This page updates automatically every 10 seconds. Messages sent to this address will appear here instantly.',
    sendTestTip: 'Tip: Use this email for account confirmations, one-time signups, or newsletters.',
    loadMore: 'Load older messages',
    allMessagesLoaded: 'All messages loaded',

    // Message Viewer
    from: 'From',
    to: 'To',
    date: 'Date',
    viewHtml: 'Rich HTML',
    viewText: 'Plain Text',
    deleteMessage: 'Delete message',
    messageDeletedToast: 'Message deleted successfully',
    remoteImagesBlocked: 'Remote images and trackers are blocked for your safety.',
    loadImages: 'Load images',
    attachmentsTitle: 'Attachments',
    download: 'Download',
    verificationCodeDetected: 'Detected Verification Code',
    copyCode: 'Copy Code',
    socialCodeTip:
      'Note: If Instagram or Facebook shows "An error occurred during registration", Meta actively restricts temporary domains or repeated signups. Try using a private/incognito browser window, clearing app cache, or waiting a few minutes.',
    backToInbox: 'Back to Inbox',
    noMessageSelected: 'Select an email to read its contents.',

    // Modals
    // Change Email Modal
    changeEmailTitle: 'Change Email Address',
    changeEmailWarning:
      'Warning: Changing your address will permanently delete your current inbox and all its messages. This cannot be undone.',
    tabRandom: 'Random address',
    tabCustom: 'Custom username',
    usernamePlaceholder: 'Enter username (6-30 chars)',
    domainLabel: 'Domain',
    changeLifespanLabel: 'Set lifetime for new address',
    confirmChange: 'Replace & Create New',
    cancel: 'Cancel',
    usernameRequirements: '6-30 characters: letters, numbers, dots, hyphens, underscores.',

    // Share Modal
    shareTitle: 'Share Mailbox Access',
    shareSubtitle: 'Anyone with this private link can view this inbox until it expires.',
    nativeShare: 'Open share sheet',
    privateLinkWarning:
      'Keep this link private if you receive sensitive registration messages. It grants read access to this inbox.',
    scanQrCode: 'Scan QR Code to open on mobile',
    close: 'Close',

    // Delete Confirm Modal
    deleteTitle: 'Permanently Delete Mailbox?',
    deleteWarning:
      'This will immediately delete this mailbox from mail.tm and remove all incoming emails. You cannot recover this address.',
    confirmDelete: 'Yes, delete permanently',

    // Expired State
    expiredTitle: 'This mailbox has expired and was deleted',
    expiredDesc:
      'The requested mailbox duration has elapsed. All messages and the address were wiped automatically to protect your privacy.',

    // Not Found State
    notFoundTitle: 'Mailbox not found',
    notFoundDesc: 'The link you followed does not correspond to an active mailbox, or it has already been deleted.',

    // How It Works
    howItWorksTitle: 'How Email Times works',
    step1Title: '1. Select Lifespan',
    step1Desc: 'Choose how long you need the address: from 10 minutes up to 7 days.',
    step2Title: '2. Receive Live Emails',
    step2Desc: 'Get instant verification codes, confirmations, and file attachments in real time.',
    step3Title: '3. Disappears Automatically',
    step3Desc: 'When the timer hits zero, the mailbox and all its records are permanently deleted.',

    // Features
    featuresTitle: 'Built for speed, convenience & privacy',
    feature1Title: 'No Registration Required',
    feature1Desc: 'No phone number, no password, and zero personal data needed. Instant creation.',
    feature2Title: 'Persistent Private Link',
    feature2Desc: 'Bookmark or share your unique private link to check incoming messages from any device.',
    feature3Title: 'True Expiry & Cleanup',
    feature3Desc: 'Strict server-side enforcement deletes accounts on mail.tm after your chosen duration.',
    feature4Title: 'Dual Language & RTL',
    feature4Desc: 'Crafted with complete Arabic and English parity, natural phrasing, and clean typography.',

    // FAQ
    faqTitle: 'Frequently Asked Questions',
    faq1Q: 'Is Email Times really free to use?',
    faq1A: 'Yes, 100% free with no registration or payment required.',
    faq2Q: 'How long can I keep an email address?',
    faq2A:
      'You can select any duration between 10 minutes and a maximum of 7 days. Once the timer reaches zero, the mailbox is automatically destroyed.',
    faq3Q: 'Can I access this inbox on my phone and computer at the same time?',
    faq3A:
      'Yes. Simply click "Copy Link" or "Share" and open the private URL on any browser or device. All emails and countdown sync automatically.',
    faq4Q: 'Are verification codes and attachments supported?',
    faq4A:
      'Yes! We automatically detect 4-8 digit one-time PINs and verification codes with 1-click copy chips, and attachments can be safely downloaded.',
    faq5Q: 'Can anyone else read my emails?',
    faq5A:
      'Addresses are generated with unguessable random identifiers and unique private links. Anyone with your private link can view the inbox, so keep it secure.',
    faq6Q: 'Can I delete my inbox earlier before the timer ends?',
    faq6A: 'Yes, click "Delete now" at any time to instantly and permanently wipe the address and all messages.',

    // Footer & Legal
    footerTagline: 'Free disposable temporary email for a cleaner, spam-free inbox.',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    contact: 'Contact',
    poweredBy: 'Powered by mail.tm',

    // Errors
    errorGeneric: 'An unexpected error occurred. Please try again.',
    errorNetwork: 'Unable to reach the mail server. Please check your internet connection.',
    errorCreation: 'Could not create mailbox. Retrying with a different domain...',
  },
  ar: {
    brand: 'الايميل المؤقت',
    tagline: 'بريد إلكتروني مؤقت يختفي في الوقت الذي تحدده.',
    subtitle:
      'احصل على عنوان بريد حقيقي وصندوق وارد مباشر. اختر مدة الصلاحية من 10 دقائق حتى 7 أيام. يمكنك الرجوع إليه أو مشاركته عبر رابط خاص حتى يتم حذفه تلقائياً.',
    badgeSecure: 'خصوصية تامة 100% وبدون تسجيل',

    // Generator & Address Card
    generatorTitle: 'أنشئ بريدك المؤقت الآن',
    generatorDesc: 'حدد مدة بقاء البريد واحصل على عنوانك الفعّال خلال ثوانٍ.',
    chooseLifespan: 'اختر مدة الصلاحية',
    maxLifespanNote: 'الحد الأقصى للصلاحية هو 7 أيام، ويتم تطبيق الحذف تلقائياً.',
    createButton: 'إنشاء البريد',
    creatingButton: 'جاري إنشاء الصندوق...',
    activeAddressLabel: 'عنوان بريدك المؤقت الفعّال',
    copyAddress: 'نسخ العنوان',
    copiedToast: 'تم نسخ عنوان البريد إلى الحافظة!',
    linkCopiedToast: 'تم نسخ الرابط الخاص إلى الحافظة!',
    codeCopiedToast: 'تم نسخ رمز التحقق بنجاح!',

    // Actions
    actionCopy: 'نسخ',
    actionCopied: 'تم النسخ',
    actionShare: 'مشاركة',
    actionCopyLink: 'نسخ الرابط',
    actionChangeEmail: 'تغيير البريد',
    actionDeleteNow: 'حذف الآن',
    actionCreateNew: 'إنشاء بريد جديد',

    // Countdown
    timeRemaining: 'الوقت المتبقي حتى الحذف التلقائي',
    days: 'يوم',
    hours: 'س',
    minutes: 'د',
    seconds: 'ث',
    daysFull: 'أيام',
    hoursFull: 'ساعات',
    minutesFull: 'دقائق',
    secondsFull: 'ثوانٍ',
    expiresAt: 'ينتهي في',

    // Inbox
    inboxTitle: 'صندوق الوارد',
    unreadCount: 'غير مقروءة',
    refreshButton: 'تحديث صندوق الوارد',
    refreshing: 'جاري جلب الرسائل...',
    lastUpdated: 'آخر تحديث',
    justNow: 'الآن',
    secondsAgo: 'منذ ثوانٍ',
    minutesAgo: 'منذ دقيقة',
    hoursAgo: 'منذ ساعة',
    noSubject: '(بدون موضوع)',
    noSender: 'مرسل غير معروف',
    emptyInboxTitle: 'في انتظار الرسائل الواردة…',
    emptyInboxDesc:
      'يتم تحديث هذه الصفحة تلقائياً كل 10 ثوانٍ. ستظهر الرسائل المرسلة إلى هذا العنوان هنا على الفور.',
    sendTestTip: 'تلميح: استخدم هذا البريد لتأكيد الحسابات، التسجيل لمرة واحدة، أو تجنب الرسائل الدعائية.',
    loadMore: 'تحميل رسائل أقدم',
    allMessagesLoaded: 'تم عرض جميع الرسائل',

    // Message Viewer
    from: 'من',
    to: 'إلى',
    date: 'التاريخ',
    viewHtml: 'عرض منسق (HTML)',
    viewText: 'نص عادي',
    deleteMessage: 'حذف الرسالة',
    messageDeletedToast: 'تم حذف الرسالة بنجاح',
    remoteImagesBlocked: 'تم حجب الصور الخارجية وأدوات التتبع لحماية خصوصيتك.',
    loadImages: 'عرض الصور',
    attachmentsTitle: 'المرفقات',
    download: 'تحميل',
    verificationCodeDetected: 'رمز التحقق المكتشف',
    copyCode: 'نسخ الرمز',
    socialCodeTip:
      'تنبيه: إذا ظهر خطأ أثناء إدخال الكود في إنستغرام أو فيسبوك ("An error occurred during registration")، فإن إنستغرام قد يقيد النطاقات المؤقتة لمنع الحسابات الآلية. يُنصح بفتح المتصفح في وضع التخفي (Incognito) أو مسح بيانات تطبيق إنستغرام والمحاولة مرة أخرى.',
    backToInbox: 'العودة للبريد',
    noMessageSelected: 'اختر رسالة من القائمة لعرض تفاصيلها ومحتواها.',

    // Modals
    // Change Email Modal
    changeEmailTitle: 'تغيير عنوان البريد',
    changeEmailWarning:
      'تنبيه: سيؤدي تغيير العنوان إلى حذف صندوق الوارد الحالي وجميع رسائله نهائياً دون إمكانية للاسترجاع.',
    tabRandom: 'عنوان عشوائي',
    tabCustom: 'اسم مخصص',
    usernamePlaceholder: 'اكتب اسم المستخدم (6-30 حرفاً)',
    domainLabel: 'النطاق',
    changeLifespanLabel: 'حدد مدة الصلاحية للعنوان الجديد',
    confirmChange: 'استبدال وإنشاء الجديد',
    cancel: 'إلغاء',
    usernameRequirements: 'من 6 إلى 30 حرفاً: حروف إنجليزية، أرقام، نقاط، شرطات.',

    // Share Modal
    shareTitle: 'مشاركة الوصول للصندوق',
    shareSubtitle: 'يمكن لأي شخص يملك هذا الرابط الخاص قراءة هذا الصندوق حتى انتهاء صلاحيته.',
    nativeShare: 'مشاركة عبر النظام',
    privateLinkWarning:
      'احتفظ بهذا الرابط خاصاً إذا كنت تتلقى رسائل تأكيد مهمة؛ فهو يمنح صلاحية القراءة لهذا الصندوق.',
    scanQrCode: 'امسح رمز QR لفتح الصندوق على هاتفك',
    close: 'إغلاق',

    // Delete Confirm Modal
    deleteTitle: 'حذف الصندوق نهائياً؟',
    deleteWarning:
      'سيتم حذف هذا الصندوق فوراً من خوادم mail.tm ومسح جميع الرسائل المستلمة. لن تتمكن من استعادة هذا العنوان.',
    confirmDelete: 'نعم، احذف نهائياً',

    // Expired State
    expiredTitle: 'انتهت صلاحية هذا الصندوق وتم حذفه',
    expiredDesc:
      'انتهت المدة المحددة لهذا البريد، وتم مسح جميع الرسائل والعنوان بالكامل لحماية خصوصيتك وأمان بياناتك.',

    // Not Found State
    notFoundTitle: 'لم يتم العثور على الصندوق',
    notFoundDesc: 'الرابط الذي اتبعته غير موجود أو تم حذفه مسبقاً بعد انتهاء صلاحيته.',

    // How It Works
    howItWorksTitle: 'كيف يعمل الايميل المؤقت؟',
    step1Title: '1. حدد مدة الصلاحية',
    step1Desc: 'اختر المدة التي تحتاج فيها العنوان: من 10 دقائق حتى 7 أيام كاملة.',
    step2Title: '2. استقبل الرسائل فوراً',
    step2Desc: 'احصل على أكواد التفعيل وتأكيدات التسجيل والمرفقات بشكل مباشر ولحظي.',
    step3Title: '3. يختفي تلقائياً',
    step3Desc: 'بمجرد انتهاء العداد الزمني، يتم تدمير الصندوق ومسح كل السجلات للأبد.',

    // Features
    featuresTitle: 'صُمم للسرعة، الأمان، والراحة',
    feature1Title: 'بدون تسجيل أو بيانات',
    feature1Desc: 'لا حاجة لرقم هاتف، كلمة مرور، أو أي بيانات شخصية. جاهز للاستخدام فوراً.',
    feature2Title: 'رابط خاص يدوم معك',
    feature2Desc: 'احفظ أو شارك رابطك الخاص لمتابعة الرسائل من أي جهاز طوال فترة صلاحيته.',
    feature3Title: 'حذف صارم وتلقائي',
    feature3Desc: 'تنفيذ فعلي على الخادم لحذف الحسابات نهائياً من mail.tm فور انتهاء الوقت.',
    feature4Title: 'دعم كامل للغة العربية',
    feature4Desc: 'واجهة عربية أصيلة بتخطيط RTL متقن وأرقام واضحة وتوافق لغوي كامل.',

    // FAQ
    faqTitle: 'الأسئلة الشائعة',
    faq1Q: 'هل خدمة الايميل المؤقت مجانية تماماً؟',
    faq1A: 'نعم، الخدمة مجانية 100% ولا تتطلب أي تسجيل أو اشتراك.',
    faq2Q: 'كم أطول مدة يمكنني الاحتفاظ بالبريد خلالها؟',
    faq2A:
      'يمكنك اختيار أي مدة تبدأ من 10 دقائق وحتى 7 أيام كحد أقصى. يتم الحذف التلقائي فور انتهاء المدة.',
    faq3Q: 'هل يمكنني فتح الصندوق من هاتفي وجهازي المكتبي معاً؟',
    faq3A:
      'نعم بالتأكيد! اضغط على "نسخ الرابط" أو "مشاركة" وافتح الرابط في أي متصفح، وستجد رسائلك والعداد الزمني متزامناً.',
    faq4Q: 'هل تدعم الخدمة أكواد التفعيل والمرفقات؟',
    faq4A:
      'نعم! يتم استخراج أكواد التأكيد (OTP) المكونة من 4-8 أرقام تلقائياً مع زر نسخ سريع، كما يمكنك تنزيل المرفقات بسهولة.',
    faq5Q: 'هل يستطيع شخص آخر قراءة رسائلي؟',
    faq5A:
      'العناوين والروابط الخاصة غير قابلة للتخمين. طالما لم تشارك الرابط الخاص مع أحد، فلن يتمكن أحد من الوصول لصندوقك.',
    faq6Q: 'هل أستطيع حذف البريد قبل انتهاء الوقت المحدد؟',
    faq6A: 'نعم، يمكنك النقر على "حذف الآن" في أي وقت لحذف العنوان وكل محتوياته فوراً بشكل نهائي.',

    // Footer & Legal
    footerTagline: 'بريد إلكتروني مؤقت ومجاني لحماية خصوصيتك والتخلص من الرسائل المزعجة.',
    privacyPolicy: 'سياسة الخصوصية',
    termsOfService: 'شروط الاستخدام',
    contact: 'اتصل بنا',
    poweredBy: 'بدعم من mail.tm',

    // Errors
    errorGeneric: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
    errorNetwork: 'تعذر الاتصال بخادم البريد. يرجى التحقق من اتصالك بالإنترنت.',
    errorCreation: 'تعذر إنشاء الصندوق. جاري المحاولة بنطاق آخر...',
  },
};
