'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
    title: '비밀번호 찾기',
    description: '가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.',
    emailLabel: '이메일 주소',
    emailPlaceholder: 'example@email.com',
    submitBtn: '재설정 링크 받기',
    loading: '전송 중...',
    successMsg: '입력하신 이메일로 비밀번호 재설정 링크가 발송되었습니다. 메일함을 확인해주세요.',
    spamTip: '메일이 오지 않는다면 스팸함을 확인하거나 다시 시도해주세요.',
    backToLogin: '로그인으로 돌아가기',
    goHome: '홈으로',
  },
  en: {
    title: 'Forgot Password',
    description: 'Enter the email address you registered with and we will send you a password reset link.',
    emailLabel: 'Email Address',
    emailPlaceholder: 'example@email.com',
    submitBtn: 'Send Reset Link',
    loading: 'Sending...',
    successMsg: 'A password reset link has been sent to your email. Please check your inbox.',
    spamTip: 'If you do not receive the email, please check your spam folder or try again.',
    backToLogin: 'Back to Login',
    goHome: 'Go to Home',
  },
  ja: {
    title: 'パスワードを忘れた場合',
    description: '登録したメールアドレスを入力すると、パスワード再設定用のリンクをお送りします。',
    emailLabel: 'メールアドレス',
    emailPlaceholder: 'example@email.com',
    submitBtn: '再設定リンクを受け取る',
    loading: '送信中...',
    successMsg: '入力されたメールアドレスにパスワード再設定リンクを送信しました。メールをご確認ください。',
    spamTip: 'メールが届かない場合は、迷惑メールフォルダをご確認いただくか、再度お試しください。',
    backToLogin: 'ログインに戻る',
    goHome: 'ホームへ',
  },
  zh: {
    title: '找回密码',
    description: '请输入您注册时使用的邮箱地址，我们将向您发送密码重置链接。',
    emailLabel: '邮箱地址',
    emailPlaceholder: 'example@email.com',
    submitBtn: '发送重置链接',
    loading: '发送中...',
    successMsg: '密码重置链接已发送至您的邮箱，请查收。',
    spamTip: '如果没有收到邮件，请检查垃圾邮件箱或重试。',
    backToLogin: '返回登录',
    goHome: '返回首页',
  },
  vi: {
    title: 'Quên mật khẩu',
    description: 'Nhập địa chỉ email bạn đã đăng ký, chúng tôi sẽ gửi liên kết đặt lại mật khẩu.',
    emailLabel: 'Địa chỉ Email',
    emailPlaceholder: 'example@email.com',
    submitBtn: 'Nhận liên kết đặt lại',
    loading: 'Đang gửi...',
    successMsg: 'Liên kết đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.',
    spamTip: 'Nếu không nhận được email, hãy kiểm tra thư mục spam hoặc thử lại.',
    backToLogin: 'Quay lại Đăng nhập',
    goHome: 'Về trang chủ',
  },
  es: {
    title: 'Olvidé mi contraseña',
    description: 'Ingrese el correo electrónico con el que se registró y le enviaremos un enlace para restablecer la contraseña.',
    emailLabel: 'Correo electrónico',
    emailPlaceholder: 'example@email.com',
    submitBtn: 'Enviar enlace de restablecimiento',
    loading: 'Enviando...',
    successMsg: 'Se ha enviado un enlace para restablecer la contraseña a su correo. Por favor revise su bandeja de entrada.',
    spamTip: 'Si no recibe el correo, revise la carpeta de spam o intente de nuevo.',
    backToLogin: 'Volver al inicio de sesión',
    goHome: 'Ir al inicio',
  },
  fr: {
    title: 'Mot de passe oublié',
    description: 'Entrez l’adresse e-mail avec laquelle vous vous êtes inscrit et nous vous enverrons un lien de réinitialisation.',
    emailLabel: 'Adresse e-mail',
    emailPlaceholder: 'example@email.com',
    submitBtn: 'Recevoir le lien de réinitialisation',
    loading: 'Envoi en cours...',
    successMsg: 'Un lien de réinitialisation a été envoyé à votre e-mail. Veuillez vérifier votre boîte de réception.',
    spamTip: 'Si vous ne recevez pas l’e-mail, vérifiez vos spams ou réessayez.',
    backToLogin: 'Retour à la connexion',
    goHome: 'Retour à l’accueil',
  },
  de: {
    title: 'Passwort vergessen',
    description: 'Geben Sie die E-Mail-Adresse ein, mit der Sie sich registriert haben, und wir senden Ihnen einen Link zum Zurücksetzen des Passworts.',
    emailLabel: 'E-Mail-Adresse',
    emailPlaceholder: 'example@email.com',
    submitBtn: 'Reset-Link erhalten',
    loading: 'Wird gesendet...',
    successMsg: 'Ein Link zum Zurücksetzen des Passworts wurde an Ihre E-Mail gesendet. Bitte prüfen Sie Ihren Posteingang.',
    spamTip: 'Wenn Sie die E-Mail nicht erhalten, prüfen Sie den Spam-Ordner oder versuchen Sie es erneut.',
    backToLogin: 'Zurück zur Anmeldung',
    goHome: 'Zur Startseite',
  },
  ru: {
    title: 'Забыли пароль',
    description: 'Введите адрес электронной почты, который вы использовали при регистрации, и мы отправим вам ссылку для сброса пароля.',
    emailLabel: 'Электронная почта',
    emailPlaceholder: 'example@email.com',
    submitBtn: 'Получить ссылку для сброса',
    loading: 'Отправка...',
    successMsg: 'Ссылка для сброса пароля отправлена на ваш email. Пожалуйста, проверьте почтовый ящик.',
    spamTip: 'Если письмо не пришло, проверьте папку «Спам» или попробуйте снова.',
    backToLogin: 'Вернуться к входу',
    goHome: 'На главную',
  },
  ar: {
    title: 'نسيت كلمة المرور',
    description: 'أدخل عنوان البريد الإلكتروني الذي سجلت به وسنرسل لك رابط إعادة تعيين كلمة المرور.',
    emailLabel: 'عنوان البريد الإلكتروني',
    emailPlaceholder: 'example@email.com',
    submitBtn: 'إرسال رابط إعادة التعيين',
    loading: 'جاري الإرسال...',
    successMsg: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد.',
    spamTip: 'إذا لم تصلك الرسالة، تحقق من مجلد الرسائل غير المرغوب فيها أو حاول مرة أخرى.',
    backToLogin: 'العودة لتسجيل الدخول',
    goHome: 'العودة للرئيسية',
  },
  pt: {
    title: 'Esqueci a senha',
    description: 'Digite o endereço de e-mail com o qual você se cadastrou e enviaremos um link para redefinir a senha.',
    emailLabel: 'Endereço de e-mail',
    emailPlaceholder: 'example@email.com',
    submitBtn: 'Receber link de redefinição',
    loading: 'Enviando...',
    successMsg: 'Um link para redefinir a senha foi enviado para o seu e-mail. Por favor, verifique sua caixa de entrada.',
    spamTip: 'Se não receber o e-mail, verifique a pasta de spam ou tente novamente.',
    backToLogin: 'Voltar para o login',
    goHome: 'Ir para o início',
  },
  id: {
    title: 'Lupa Kata Sandi',
    description: 'Masukkan alamat email yang Anda daftarkan dan kami akan mengirimkan tautan reset kata sandi.',
    emailLabel: 'Alamat Email',
    emailPlaceholder: 'example@email.com',
    submitBtn: 'Kirim Tautan Reset',
    loading: 'Mengirim...',
    successMsg: 'Tautan reset kata sandi telah dikirim ke email Anda. Silakan periksa kotak masuk.',
    spamTip: 'Jika email tidak diterima, periksa folder spam atau coba lagi.',
    backToLogin: 'Kembali ke Login',
    goHome: 'Ke Beranda',
  },
  hi: {
    title: 'पासवर्ड भूल गए',
    description: 'वह ईमेल पता दर्ज करें जिससे आपने पंजीकरण किया था, हम आपको पासवर्ड रीसेट लिंक भेजेंगे।',
    emailLabel: 'ईमेल पता',
    emailPlaceholder: 'example@email.com',
    submitBtn: 'रीसेट लिंक प्राप्त करें',
    loading: 'भेजा जा रहा है...',
    successMsg: 'पासवर्ड रीसेट लिंक आपके ईमेल पर भेज दिया गया है। कृपया अपना इनबॉक्स जांचें।',
    spamTip: 'यदि ईमेल नहीं मिला, तो स्पैम फ़ोल्डर जांचें या पुनः प्रयास करें।',
    backToLogin: 'लॉगिन पर वापस जाएं',
    goHome: 'होम पर जाएं',
  },
  th: {
    title: 'ลืมรหัสผ่าน',
    description: 'กรอกที่อยู่อีเมลที่คุณใช้สมัครสมาชิก เราจะส่งลิงก์รีเซ็ตรหัสผ่านให้คุณ',
    emailLabel: 'ที่อยู่อีเมล',
    emailPlaceholder: 'example@email.com',
    submitBtn: 'รับลิงก์รีเซ็ต',
    loading: 'กำลังส่ง...',
    successMsg: 'ลิงก์รีเซ็ตรหัสผ่านได้ถูกส่งไปยังอีเมลของคุณแล้ว กรุณาตรวจสอบกล่องจดหมาย',
    spamTip: 'หากไม่ได้รับอีเมล กรุณาตรวจสอบโฟลเดอร์สแปมหรือลองใหม่อีกครั้ง',
    backToLogin: 'กลับไปหน้าเข้าสู่ระบบ',
    goHome: 'กลับหน้าหลัก',
  },
  fil: {
    title: 'Nakalimutan ang Password',
    description: 'Ilagay ang email address na ginamit mo sa pagrehistro at padadalhan ka namin ng password reset link.',
    emailLabel: 'Email Address',
    emailPlaceholder: 'example@email.com',
    submitBtn: 'Kunin ang Reset Link',
    loading: 'Ipinapadala...',
    successMsg: 'Naipadala na ang password reset link sa iyong email. Pakisuri ang iyong inbox.',
    spamTip: 'Kung hindi mo natanggap ang email, suriin ang spam folder o subukan muli.',
    backToLogin: 'Bumalik sa Login',
    goHome: 'Pumunta sa Home',
  },
  tr: {
    title: 'Şifremi Unuttum',
    description: 'Kayıt olduğunuz e-posta adresini girin, size şifre sıfırlama bağlantısı göndereceğiz.',
    emailLabel: 'E-posta Adresi',
    emailPlaceholder: 'example@email.com',
    submitBtn: 'Sıfırlama Bağlantısı Al',
    loading: 'Gönderiliyor...',
    successMsg: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu kontrol edin.',
    spamTip: 'E-posta gelmezse spam klasörünü kontrol edin veya tekrar deneyin.',
    backToLogin: 'Girişe Geri Dön',
    goHome: 'Ana Sayfaya Git',
  },
  it: {
    title: 'Password dimenticata',
    description: 'Inserisci l’indirizzo email con cui ti sei registrato e ti invieremo un link per reimpostare la password.',
    emailLabel: 'Indirizzo email',
    emailPlaceholder: 'example@email.com',
    submitBtn: 'Ricevi link di reimpostazione',
    loading: 'Invio in corso...',
    successMsg: 'Un link per reimpostare la password è stato inviato alla tua email. Controlla la casella di posta.',
    spamTip: 'Se non ricevi l’email, controlla la cartella spam o riprova.',
    backToLogin: 'Torna al login',
    goHome: 'Vai alla Home',
  },
  nl: {
    title: 'Wachtwoord vergeten',
    description: 'Voer het e-mailadres in waarmee u zich heeft geregistreerd en we sturen u een link om het wachtwoord te resetten.',
    emailLabel: 'E-mailadres',
    emailPlaceholder: 'example@email.com',
    submitBtn: 'Resetlink ontvangen',
    loading: 'Verzenden...',
    successMsg: 'Er is een wachtwoord-resetlink naar uw e-mail gestuurd. Controleer uw inbox.',
    spamTip: 'Als u de e-mail niet ontvangt, controleer dan de spammap of probeer het opnieuw.',
    backToLogin: 'Terug naar inloggen',
    goHome: 'Naar Home',
  },
  uk: {
    title: 'Забули пароль',
    description: 'Введіть електронну адресу, з якою ви зареєструвалися, і ми надішлемо посилання для скидання пароля.',
    emailLabel: 'Електронна пошта',
    emailPlaceholder: 'example@email.com',
    submitBtn: 'Отримати посилання для скидання',
    loading: 'Надсилання...',
    successMsg: 'Посилання для скидання пароля надіслано на вашу електронну пошту. Перевірте вхідні.',
    spamTip: 'Якщо лист не надійшов, перевірте папку «Спам» або спробуйте ще раз.',
    backToLogin: 'Повернутися до входу',
    goHome: 'На головну',
  },
  ms: {
    title: 'Lupa Kata Laluan',
    description: 'Masukkan alamat e-mel yang anda daftar dan kami akan menghantar pautan tetapan semula kata laluan.',
    emailLabel: 'Alamat E-mel',
    emailPlaceholder: 'example@email.com',
    submitBtn: 'Terima Pautan Tetapan Semula',
    loading: 'Menghantar...',
    successMsg: 'Pautan tetapan semula kata laluan telah dihantar ke e-mel anda. Sila semak peti masuk.',
    spamTip: 'Jika e-mel tidak diterima, semak folder spam atau cuba lagi.',
    backToLogin: 'Kembali ke Log Masuk',
    goHome: 'Ke Laman Utama',
  },
};

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [lang, setLang] = useState('ko');
  const [isMounted, setIsMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem('app_language');
    if (savedLang && TEXTS[savedLang]) {
      setLang(savedLang);
    }
    setIsMounted(true);
  }, []);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLang(newLang);
    localStorage.setItem('app_language', newLang);
  };

  const t = TEXTS[lang] || TEXTS.ko;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);

    try {
      // TODO: 백엔드 API 호출 (예: /api/auth/forgot-password)
      // 보안상 가입된 이메일이 아니더라도 동일한 성공 메시지를 보여주는 것이 좋습니다.
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 통신 지연 시뮬레이션
      
      setSubmitted(true);
    } catch (error) {
      console.error('비밀번호 재설정 요청 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm text-center">
        {/* 언어 선택 */}
        <div className="flex justify-end mb-4">
          <select
            value={lang}
            onChange={handleLanguageChange}
            className="text-xs border border-gray-300 rounded px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        <h2 className="text-2xl font-bold mb-4 text-gray-800">{t.title}</h2>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="text-left">
            <p className="text-gray-600 mb-4 text-sm text-center">
              {t.description}
            </p>
            <div className="mb-4">
              <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                {t.emailLabel}
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={t.emailPlaceholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-md text-sm font-semibold hover:bg-blue-700 transition duration-200 disabled:bg-blue-300 mb-4"
            >
              {loading ? t.loading : t.submitBtn}
            </button>
          </form>
        ) : (
          <div className="mb-6">
            <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm mb-4">
              {t.successMsg}
            </div>
            <p className="text-gray-500 text-xs">
              {t.spamTip}
            </p>
          </div>
        )}

        <div className="mt-4 space-y-2">
          <div>
            <Link href="/login" className="text-blue-600 hover:underline text-sm">
              {t.backToLogin}
            </Link>
          </div>
          <div>
            <Link href="/" className="text-gray-500 hover:text-gray-700 hover:underline text-sm">
              {t.goHome}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}