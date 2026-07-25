'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquarePlus, ClipboardEdit, FileUp, Globe, LogIn, UserPlus, LogOut } from 'lucide-react';

const LANGUAGES = [
  { code: 'ko', name: '한국어 (Korean)' },
  { code: 'en', name: 'English (English)' },
  { code: 'ja', name: '日本語 (Japanese)' },
  { code: 'zh', name: '中文 (Chinese)' },
  { code: 'vi', name: 'Tiếng Việt (Vietnamese)' },
  { code: 'es', name: 'Español (Spanish)' },
  { code: 'fr', name: 'Français (French)' },
  { code: 'de', name: 'Deutsch (German)' },
  { code: 'ru', name: 'Русский (Russian)' },
  { code: 'ar', name: 'العربية (Arabic)' },
  { code: 'pt', name: 'Português (Portuguese)' },
  { code: 'id', name: 'Bahasa Indonesia (Indonesian)' },
  { code: 'hi', name: 'हिन्दी (Hindi)' },
  { code: 'th', name: 'ไทย (Thai)' },
  { code: 'fil', name: 'Filipino (Filipino)' },
  { code: 'tr', name: 'Türkçe (Turkish)' },
  { code: 'it', name: 'Italiano (Italian)' },
  { code: 'nl', name: 'Nederlands (Dutch)' },
  { code: 'uk', name: 'Українська (Ukrainian)' },
  { code: 'ms', name: 'Bahasa Melayu (Malay)' },
];

const TEXTS: Record<string, any> = {
  ko: { 
    title: "Q&S (Quiz & Survey) AI 생성 플랫폼", 
    subtitle: "시작 전 사용할 언어를 선택하고, 원하는 제작 방식을 골라주세요.", 
    selectLabel: "전체 서비스 언어 선택:", 
    startBtn: "시작하기", 
    mode1Title: "주제와 대상 입력으로\n퀴즈와 설문 자동 생성", 
    mode2Title: "텍스트 입력", 
    mode3Title: "문서 파일(Hwp, Doc, PDF)\n업로드 변환",
    login: "로그인",
    signup: "회원가입",
    logout: "로그아웃",
    logoutSuccess: "로그아웃 되었습니다.",
    userSuffix: " 님"
  },
  en: { 
    title: "Q&S (Quiz & Survey) AI Generation Platform", 
    subtitle: "Select your target language below and choose a creation method to get started.", 
    selectLabel: "Select Service Language:", 
    startBtn: "Get Started", 
    mode1Title: "Auto-Generate Survey\nby Topic & Target", 
    mode2Title: "Text Input", 
    mode3Title: "Document Upload\n(Hwp, Doc, PDF)",
    login: "Login",
    signup: "Sign Up",
    logout: "Logout",
    logoutSuccess: "You have been logged out.",
    userSuffix: ""
  },
  ja: { 
    title: "Q&S (Quiz & Survey) AI生成プラットフォーム", 
    subtitle: "使用する言語を選択し、ご希望の作成方法をお選びください。", 
    selectLabel: "サービス言語の選択:", 
    startBtn: "始める", 
    mode1Title: "テーマと対象入力で\nアンケート自動生成", 
    mode2Title: "テキスト入力", 
    mode3Title: "文書ファイル変換\n(Hwp, Doc, PDF)",
    login: "ログイン",
    signup: "会員登録",
    logout: "ログアウト",
    logoutSuccess: "ログアウトしました。",
    userSuffix: " 様"
  },
  zh: { 
    title: "Q&S (Quiz & Survey) AI生成平台", 
    subtitle: "请在开始前选择您要使用的语言，并选择您需要的创建方式。", 
    selectLabel: "选择服务语言:", 
    startBtn: "开始", 
    mode1Title: "输入主题和对象\n自动生成问卷", 
    mode2Title: "输入文本", 
    mode3Title: "上传文档\n(Hwp, Doc, PDF)",
    login: "登录",
    signup: "注册",
    logout: "退出登录",
    logoutSuccess: "已成功退出登录。",
    userSuffix: ""
  },
  vi: { 
    title: "Nền tảng tạo AI Q&S (Quiz & Survey)", 
    subtitle: "Chọn ngôn ngữ mục tiêu bên dưới và phương pháp tạo để bắt đầu.", 
    selectLabel: "Chọn ngôn ngữ dịch vụ:", 
    startBtn: "Bắt đầu", 
    mode1Title: "Tạo khảo sát tự động\nbằng Chủ đề & Đối tượng", 
    mode2Title: "Nhập văn bản", 
    mode3Title: "Tải lên tài liệu\n(Hwp, Doc, PDF)",
    login: "Đăng nhập",
    signup: "Đăng ký",
    logout: "Đăng xuất",
    logoutSuccess: "Bạn đã đăng xuất.",
    userSuffix: ""
  },
  es: { 
    title: "Plataforma de Generación de IA Q&S (Quiz & Survey)", 
    subtitle: "Seleccione su idioma y un método de creación para empezar.", 
    selectLabel: "Seleccionar Idioma del Servicio:", 
    startBtn: "Empezar", 
    mode1Title: "Generación automática\npor tema y público", 
    mode2Title: "Entrada de texto", 
    mode3Title: "Subir documento\n(Hwp, Doc, PDF)",
    login: "Iniciar sesión",
    signup: "Registrarse",
    logout: "Cerrar sesión",
    logoutSuccess: "Has cerrado sesión.",
    userSuffix: ""
  },
  fr: { 
    title: "Plateforme de Génération IA Q&S (Quiz & Survey)", 
    subtitle: "Sélectionnez votre langue et une méthode de création pour commencer.", 
    selectLabel: "Langue du service :", 
    startBtn: "Commencer", 
    mode1Title: "Génération automatique\npar sujet et cible", 
    mode2Title: "Saisie de texte", 
    mode3Title: "Téléchargement de fichier\n(Hwp, Doc, PDF)",
    login: "Connexion",
    signup: "S'inscrire",
    logout: "Déconnexion",
    logoutSuccess: "Vous avez été déconnecté.",
    userSuffix: ""
  },
  de: { 
    title: "Q&S (Quiz & Survey) KI-Generierungsplattform", 
    subtitle: "Wählen Sie Ihre Sprache und eine Erstellungsmethode, um zu beginnen.", 
    selectLabel: "Servicesprache auswählen:", 
    startBtn: "Loslegen", 
    mode1Title: "Automatische Generierung\nnach Thema & Ziel", 
    mode2Title: "Texteingabe", 
    mode3Title: "Dokument-Upload\n(Hwp, Doc, PDF)",
    login: "Anmelden",
    signup: "Registrieren",
    logout: "Abmelden",
    logoutSuccess: "Sie wurden abgemeldet.",
    userSuffix: ""
  },
  ru: { 
    title: "Платформа генерации ИИ Q&S (Quiz & Survey)", 
    subtitle: "Выберите язык и метод создания для начала работы.", 
    selectLabel: "Выберите язык сервиса:", 
    startBtn: "Начать", 
    mode1Title: "Авто-создание опроса\nпо теме и аудитории", 
    mode2Title: "Ввод текста", 
    mode3Title: "Загрузка документа\n(Hwp, Doc, PDF)",
    login: "Войти",
    signup: "Регистрация",
    logout: "Выйти",
    logoutSuccess: "Вы вышли из системы.",
    userSuffix: ""
  },
  ar: { 
    title: "منصة توليد الذكاء الاصطناعي Q&S (Quiz & Survey)", 
    subtitle: "اختر لغة الخدمة المطلوبة وحدد طريقة الإنشاء أدناه للبدء.", 
    selectLabel: "اختر لغة الخدمة:", 
    startBtn: "ابدأ", 
    mode1Title: "توليد استطلاع تلقائي\nبإدخال الموضوع والهدف", 
    mode2Title: "إدخال النص", 
    mode3Title: "تحويل المستندات\n(Hwp, Doc, PDF)",
    login: "تسجيل الدخول",
    signup: "إنشاء حساب",
    logout: "تسجيل الخروج",
    logoutSuccess: "تم تسجيل الخروج بنجاح.",
    userSuffix: ""
  },
  pt: { 
    title: "Plataforma de Geração de IA Q&S (Quiz & Survey)", 
    subtitle: "Selecione seu idioma e um método de criação para começar.", 
    selectLabel: "Selecionar Idioma:", 
    startBtn: "Começar", 
    mode1Title: "Geração automática\npor Tema e Público", 
    mode2Title: "Entrada de Texto", 
    mode3Title: "Upload de Documento\n(Hwp, Doc, PDF)",
    login: "Entrar",
    signup: "Cadastrar",
    logout: "Sair",
    logoutSuccess: "Você saiu da conta.",
    userSuffix: ""
  },
  id: { 
    title: "Platform Pembuatan AI Q&S (Quiz & Survey)", 
    subtitle: "Pilih bahasa target dan metode pembuatan untuk memulai.", 
    selectLabel: "Pilih Bahasa Layanan:", 
    startBtn: "Mulai", 
    mode1Title: "Buat Survei Otomatis\ndengan Topik & Target", 
    mode2Title: "Input Teks", 
    mode3Title: "Unggah Dokumen\n(Hwp, Doc, PDF)",
    login: "Masuk",
    signup: "Daftar",
    logout: "Keluar",
    logoutSuccess: "Anda telah keluar.",
    userSuffix: ""
  },
  hi: { 
    title: "Q&S (Quiz & Survey) AI जनरेशन प्लेटफॉर्म", 
    subtitle: "आरंभ करने के लिए नीचे अपनी भाषा और निर्माण विधि चुनें।", 
    selectLabel: "सेवा भाषा चुनें:", 
    startBtn: "शुरू करें", 
    mode1Title: "विषय और लक्ष्य द्वारा\nऑटो-जनरेट सर्वेक्षण", 
    mode2Title: "टेक्स्ट इनपुट", 
    mode3Title: "दस्तावेज़ अपलोड\n(Hwp, Doc, PDF)",
    login: "लॉग इन",
    signup: "साइन अप",
    logout: "लॉग आउट",
    logoutSuccess: "आप लॉग आउट हो गए हैं।",
    userSuffix: ""
  },
  th: { 
    title: "แพลตฟอร์มสร้าง AI Q&S (Quiz & Survey)", 
    subtitle: "เลือกภาษาและวิธีการสร้างด้านล่างเพื่อเริ่มต้น", 
    selectLabel: "เลือกภาษาของบริการ:", 
    startBtn: "เริ่มต้น", 
    mode1Title: "สร้างแบบสอบถามอัตโนมัติ\nจากหัวข้อและเป้าหมาย", 
    mode2Title: "ป้อนข้อความ", 
    mode3Title: "อัปโหลดเอกสาร\n(Hwp, Doc, PDF)",
    login: "เข้าสู่ระบบ",
    signup: "สมัครสมาชิก",
    logout: "ออกจากระบบ",
    logoutSuccess: "คุณได้ออกจากระบบแล้ว",
    userSuffix: ""
  },
  fil: { 
    title: "Q&S (Quiz & Survey) AI Generation Platform", 
    subtitle: "Piliin ang iyong wika at pamamaraan ng paglikha upang magsimula.", 
    selectLabel: "Piliin ang Wika ng Serbisyo:", 
    startBtn: "Magsimula", 
    mode1Title: "Awtomatikong Pagbuo\nsa pamamagitan ng Paksa", 
    mode2Title: "Input ng Teksto", 
    mode3Title: "Pag-upload ng Dokumento\n(Hwp, Doc, PDF)",
    login: "Mag-login",
    signup: "Mag-sign up",
    logout: "Mag-logout",
    logoutSuccess: "Naka-logout ka na.",
    userSuffix: ""
  },
  tr: { 
    title: "Q&S (Quiz & Survey) Yapay Zeka Üretim Platformu", 
    subtitle: "Başlamak için dilinizi ve oluşturma yönteminizi seçin.", 
    selectLabel: "Hizmet Dilini Seçin:", 
    startBtn: "Başla", 
    mode1Title: "Konu ve Hedef Kitleyle\nOtomatik Anket Oluştur", 
    mode2Title: "Metin Girişi", 
    mode3Title: "Belge Yükleme\n(Hwp, Doc, PDF)",
    login: "Giriş Yap",
    signup: "Kayıt Ol",
    logout: "Çıkış Yap",
    logoutSuccess: "Çıkış yaptınız.",
    userSuffix: ""
  },
  it: { 
    title: "Piattaforma di Generazione IA Q&S (Quiz & Survey)", 
    subtitle: "Seleziona la lingua e il metodo di creazione per iniziare.", 
    selectLabel: "Seleziona la lingua:", 
    startBtn: "Inizia", 
    mode1Title: "Generazione Automatica\nper Argomento e Target", 
    mode2Title: "Inserimento Testo", 
    mode3Title: "Caricamento Documento\n(Hwp, Doc, PDF)",
    login: "Accedi",
    signup: "Registrati",
    logout: "Esci",
    logoutSuccess: "Sei stato disconnesso.",
    userSuffix: ""
  },
  nl: { 
    title: "Q&S (Quiz & Survey) AI Generatie Platform", 
    subtitle: "Selecteer uw taal en een creatiemethode om te beginnen.", 
    selectLabel: "Selecteer Servicetaal:", 
    startBtn: "Beginnen", 
    mode1Title: "Automatisch genereren\nop Thema & Doelgroep", 
    mode2Title: "Tekstinvoer", 
    mode3Title: "Document Uploaden\n(Hwp, Doc, PDF)",
    login: "Inloggen",
    signup: "Registreren",
    logout: "Uitloggen",
    logoutSuccess: "U bent uitgelogd.",
    userSuffix: ""
  },
  uk: { 
    title: "Платформа генерації ШІ Q&S (Quiz & Survey)", 
    subtitle: "Виберіть мову та метод створення для початку роботи.", 
    selectLabel: "Виберіть мову сервісу:", 
    startBtn: "Почати", 
    mode1Title: "Авто-створення опитування\nза темою та аудиторією", 
    mode2Title: "Введення тексту", 
    mode3Title: "Завантаження документа\n(Hwp, Doc, PDF)",
    login: "Увійти",
    signup: "Зареєструватися",
    logout: "Вийти",
    logoutSuccess: "Ви вийшли з системи.",
    userSuffix: ""
  },
  ms: { 
    title: "Platform Penjanaan AI Q&S (Quiz & Survey)", 
    subtitle: "Pilih bahasa sasaran anda dan kaedah penciptaan untuk bermula.", 
    selectLabel: "Pilih Bahasa Perkhidmatan:", 
    startBtn: "Mula", 
    mode1Title: "Penjanaan Tinjauan Auto\nmelalui Topik & Sasaran", 
    mode2Title: "Input Teks", 
    mode3Title: "Muat Naik Dokumen\n(Hwp, Doc, PDF)",
    login: "Log Masuk",
    signup: "Daftar",
    logout: "Log Keluar",
    logoutSuccess: "Anda telah log keluar.",
    userSuffix: ""
  },
};

export default function Home() {
  const router = useRouter();
  const [selectedLang, setSelectedLang] = useState('ko');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  // 언어 + 로그인 상태 복원
  useEffect(() => {
    // 1. 저장된 언어 복원
    const savedLang = localStorage.getItem('app_language');
    if (savedLang) {
      setSelectedLang(savedLang);
    }

    // 2. 로그인 상태 확인
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    if (token && email) {
      setIsLoggedIn(true);
      setUserEmail(email);
    }

    setIsMounted(true);
  }, []);

  // 언어 변경 시 localStorage에 저장
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setSelectedLang(newLang);
    localStorage.setItem('app_language', newLang);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    setIsLoggedIn(false);
    setUserEmail('');
    alert(t.logoutSuccess);
  };

  // 서버 렌더링 시 깜빡임 방지
  if (!isMounted) {
    return null;
  }

  const t = TEXTS[selectedLang] || TEXTS['ko'];

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center font-sans">
      
      {/* --- 상단 네비게이션 바 (로그인/회원가입) --- */}
      <header className="w-full max-w-6xl flex justify-end items-center p-4 gap-3">
        {isLoggedIn ? (
          <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
            <span className="text-sm font-medium text-gray-700">{userEmail}{t.userSuffix}</span>
            <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 font-bold transition">
              <LogOut className="w-4 h-4" /> {t.logout}
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => router.push('/login')} className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-100 shadow-sm transition">
              <LogIn className="w-4 h-4" /> {t.login}
            </button>
            <button onClick={() => router.push('/signup')} className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-full hover:bg-blue-700 shadow-sm transition">
              <UserPlus className="w-4 h-4" /> {t.signup}
            </button>
          </div>
        )}
      </header> 
        
      <div className="w-full flex flex-col items-center justify-center p-6 mt-8">
        <div className="max-w-5xl w-full flex flex-col items-center mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
            {t.title}
          </h1>
          <p className="text-sm md:text-base text-gray-500 mb-8 max-w-xl">
            {t.subtitle}
          </p>

          <div className="flex items-center gap-2 bg-white px-5 py-3 rounded-full shadow-sm border border-gray-100">
            <Globe className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-semibold text-gray-700">{t.selectLabel}</span>
            <select 
              value={selectedLang}
              onChange={handleLanguageChange}
              className="bg-gray-50 border border-gray-200 text-gray-800 text-sm font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-gray-200 cursor-pointer"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Mode 1 */}
        <div onClick={() => router.push(`/create?lang=${selectedLang}`)} className="group relative flex flex-col items-center text-center p-8 bg-blue-50/50 rounded-3xl border border-blue-100 hover:bg-blue-50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
            <MessageSquarePlus className="w-8 h-8" />
          </div>
          <span className="text-xs font-bold text-blue-600 bg-blue-100/80 px-3 py-1.5 rounded-full mb-3">Mode 1</span>
          <h2 className="text-lg md:text-xl font-bold text-blue-950 mb-2 break-keep whitespace-pre-line leading-snug">{t.mode1Title}</h2>
          <div className="mt-auto pt-6 text-blue-600 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all duration-300">{t.startBtn} <span>&rarr;</span></div>
        </div>

        {/* Mode 2 */}
        <div onClick={() => router.push(`/text-create?lang=${selectedLang}`)} className="group relative flex flex-col items-center text-center p-8 bg-emerald-50/50 rounded-3xl border border-emerald-100 hover:bg-emerald-50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
            <ClipboardEdit className="w-8 h-8" />
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-100/80 px-3 py-1.5 rounded-full mb-3">Mode 2</span>
          <h2 className="text-lg md:text-xl font-bold text-emerald-950 mb-2 break-keep whitespace-pre-line leading-snug">{t.mode2Title}</h2>
          <div className="mt-auto pt-6 text-emerald-600 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all duration-300">{t.startBtn} <span>&rarr;</span></div>
        </div>

        {/* Mode 3 */}
        <div onClick={() => router.push(`/upgrade?lang=${selectedLang}`)} className="group relative flex flex-col items-center text-center p-8 bg-violet-50/50 rounded-3xl border border-violet-100 hover:bg-violet-50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
          <div className="w-16 h-16 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-violet-600 group-hover:text-white transition-all duration-300">
            <FileUp className="w-8 h-8" />
          </div>
          <span className="text-xs font-bold text-violet-600 bg-violet-100/80 px-3 py-1.5 rounded-full mb-3">Mode 3</span>
          <h2 className="text-lg md:text-xl font-bold text-violet-950 mb-2 break-keep whitespace-pre-line leading-snug">{t.mode3Title}</h2>
          <div className="mt-auto pt-6 text-violet-600 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all duration-300">{t.startBtn} <span>&rarr;</span></div>
        </div>

      </div>
    </main>
  );
}