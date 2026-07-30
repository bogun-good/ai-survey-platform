'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
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
  { code: 'ms', name: 'Bahasa Melayu (Malay)' },
  { code: 'tr', name: 'Türkçe (Turkish)' },
  { code: 'it', name: 'Italiano (Italian)' },
  { code: 'nl', name: 'Nederlands (Dutch)' },
  { code: 'pl', name: 'Polski (Polish)' },
  { code: 'sv', name: 'Svenska (Swedish)' },
];

const translations: Record<string, Record<string, string>> = {
  ko: {
    title: '회원가입',
    emailLabel: '이메일',
    emailPlaceholder: '이메일 주소 입력',
    duplicateCheck: '중복확인',
    checking: '확인 중...',
    availableEmail: '사용 가능한 이메일입니다.',
    passwordLabel: '비밀번호 (8자 이상, 영문/숫자/특수문자 조합)',
    passwordGuidance: '💡 본 서비스에서 사용할 새로운 비밀번호를 입력해 주세요. (보안을 위해 이메일 계정 비밀번호와 다르게 설정하는 것을 권장합니다.)',
    passwordConfirmLabel: '비밀번호 확인',
    allAgree: '이용약관, 개인정보 처리방침 및 AI 서비스 이용약관에 모두 동의합니다.',
    termsAgree: '[필수] 이용약관 동의',
    privacyAgree: '[필수] 개인정보 수집 및 이용 동의',
    aiAgree: '[필수] AI 생성 콘텐츠 책임 및 할루시네이션 면책 고지 동의',
    ageAgree: '[필수] 만 14세 이상입니다.',
    view: '[보기]',
    signupBtn: '회원가입',
    errPasswordMatch: '비밀번호가 일치하지 않습니다.',
    errPasswordPattern: '비밀번호는 8자 이상이며, 영문, 숫자, 특수문자를 모두 포함해야 합니다.',
    errEmailCheck: '이메일 중복확인을 진행해 주세요.',
    errDuplicate: '이미 가입된 이메일입니다.',
    errAgreements: '모든 필수 약관 및 정책에 동의해 주세요.',
    successSignup: '회원가입이 성공적으로 완료되었습니다.',
    errSignup: '회원가입 중 오류가 발생했습니다. 다시 시도해 주세요.',
    successTitle: '회원가입이 완료되었습니다!',
    successDesc: '이제 서비스를 자유롭게 이용하실 수 있습니다.',
    homeBtn: '홈으로',
    resultsBtn: '퀴즈와 설문 결과 보기',
  },
  en: {
    title: 'Sign Up',
    emailLabel: 'Email',
    emailPlaceholder: 'Enter your email',
    duplicateCheck: 'Check',
    checking: 'Checking...',
    availableEmail: 'This email is available.',
    passwordLabel: 'Password (8+ chars, letters, numbers, symbols)',
    passwordGuidance: '💡 Please create a new password for this service. (For security, we recommend not using your email account password.)',
    passwordConfirmLabel: 'Confirm Password',
    allAgree: 'I agree to all Terms, Privacy Policy, and AI Service Terms.',
    termsAgree: '[Required] Terms of Service',
    privacyAgree: '[Required] Privacy Policy',
    aiAgree: '[Required] AI Content & Disclaimer Notice',
    ageAgree: '[Required] I am 14 years of age or older.',
    view: '[View]',
    signupBtn: 'Sign Up',
    errPasswordMatch: 'Passwords do not match.',
    errPasswordPattern: 'Password must be at least 8 characters and include letters, numbers, and symbols.',
    errEmailCheck: 'Please verify your email availability.',
    errDuplicate: 'This email is already registered.',
    errAgreements: 'Please agree to all required terms and policies.',
    successSignup: 'Sign up completed successfully.',
    errSignup: 'An error occurred during sign up. Please try again.',
    successTitle: 'Sign up completed!',
    successDesc: 'You can now freely use the service.',
    homeBtn: 'Go Home',
    resultsBtn: 'View Quiz & Survey Results',
  },
  ja: {
    title: '会員登録',
    emailLabel: 'メールアドレス',
    emailPlaceholder: 'メールアドレスを入力',
    duplicateCheck: '重複確認',
    checking: '確認中...',
    availableEmail: '利用可能なメールアドレスです。',
    passwordLabel: 'パスワード (8文字以上、英字/数字/記号)',
    passwordGuidance: '💡 本サービス用の新しいパスワードを設定してください。（セキュリティのため、メールアカウントのパスワードとは別のものにすることをお勧めします。）',
    passwordConfirmLabel: 'パスワード確認',
    allAgree: '利用規約、プライバシーポリシー、AIサービス規約のすべてに同意します。',
    termsAgree: '[必須] 利用規約への同意',
    privacyAgree: '[必須] プライバシーポリシーへの同意',
    aiAgree: '[必須] AI生成コンテンツの責任および免責事項への同意',
    ageAgree: '[必須] 14歳以上です。',
    view: '[表示]',
    signupBtn: '会員登録',
    errPasswordMatch: 'パスワードが一致しません。',
    errPasswordPattern: 'パスワードは8文字以上で、英字、数字、特殊文字を含める必要があります。',
    errEmailCheck: 'メールアドレスの重複確認を行ってください。',
    errDuplicate: 'すでに登録されているメールアドレスです。',
    errAgreements: 'すべての必須規約に同意してください。',
    successSignup: '会員登録が完了しました。',
    errSignup: '登録中にエラーが発生しました。もう一度お試しください。',
    successTitle: '会員登録が完了しました！',
    successDesc: 'これでサービスを自由にご利用いただけます。',
    homeBtn: 'ホームへ',
    resultsBtn: 'クイズ＆アンケート結果を見る',
  },
  zh: {
    title: '注册',
    emailLabel: '邮箱',
    emailPlaceholder: '请输入邮箱',
    duplicateCheck: '检查可用性',
    checking: '检查中...',
    availableEmail: '此邮箱可用。',
    passwordLabel: '密码 (8位以上，含字母/数字/特殊字符)',
    passwordGuidance: '💡 请为此服务设置一个新密码。（为了安全起见，建议不要使用您的邮箱登录密码。）',
    passwordConfirmLabel: '确认密码',
    allAgree: '同意所有服务条款、隐私政策及AI服务条款。',
    termsAgree: '[必填] 服务条款',
    privacyAgree: '[必填] 隐私政策',
    aiAgree: '[必填] AI生成内容责任及免责声明',
    ageAgree: '[必填] 我已年满14周岁。',
    view: '[查看]',
    signupBtn: '注册',
    errPasswordMatch: '两次输入的密码不一致。',
    errPasswordPattern: '密码必须至少8位，且包含字母、数字和特殊字符。',
    errEmailCheck: '请先进行邮箱可用性检查。',
    errDuplicate: '该邮箱已被注册。',
    errAgreements: '请同意所有必填条款。',
    successSignup: '注册成功！',
    errSignup: '注册时发生错误，请重试。',
    successTitle: '注册成功！',
    successDesc: '您现在可以自由使用本服务。',
    homeBtn: '返回首页',
    resultsBtn: '查看测验与问卷结果',
  },
  es: {
    title: 'Registrarse',
    emailLabel: 'Correo electrónico',
    emailPlaceholder: 'Ingrese su correo',
    duplicateCheck: 'Verificar',
    checking: 'Comprobando...',
    availableEmail: 'Este correo está disponible.',
    passwordLabel: 'Contraseña (8+ caracteres, letras, números, símbolos)',
    passwordGuidance: '💡 Cree una nueva contraseña para este servicio. (Por seguridad, recomendamos no usar la contraseña de su cuenta de correo.)',
    passwordConfirmLabel: 'Confirmar contraseña',
    allAgree: 'Acepto todos los términos y políticas.',
    termsAgree: '[Obligatorio] Términos de servicio',
    privacyAgree: '[Obligatorio] Política de privacidad',
    aiAgree: '[Obligatorio] Aviso de contenido de IA y exención de responsabilidad',
    ageAgree: '[Obligatorio] Tengo 14 años o más.',
    view: '[Ver]',
    signupBtn: 'Registrarse',
    errPasswordMatch: 'Las contraseñas no coinciden.',
    errPasswordPattern: 'La contraseña debe tener al menos 8 caracteres, letras, números y símbolos.',
    errEmailCheck: 'Por favor verifique la disponibilidad del correo.',
    errDuplicate: 'Este correo ya está registrado.',
    errAgreements: 'Por favor acepte todos los términos obligatorios.',
    successSignup: 'Registro completado con éxito.',
    errSignup: 'Ocurrió un error. Inténtalo de nuevo.',
    successTitle: '¡Registro completado!',
    successDesc: 'Ya puede utilizar el servicio libremente.',
    homeBtn: 'Ir al inicio',
    resultsBtn: 'Ver resultados de Quiz y Encuesta',
  },
  fr: {
    title: "S'inscrire",
    emailLabel: 'E-mail',
    emailPlaceholder: "Saisir l'e-mail",
    duplicateCheck: 'Vérifier',
    checking: 'Vérification...',
    availableEmail: 'Cet e-mail est disponible.',
    passwordLabel: 'Mot de passe (8+ car., lettres, chiffres, symboles)',
    passwordGuidance: '💡 Veuillez créer un nouveau mot de passe pour ce service. (Pour des raisons de sécurité, nous recommandons de ne pas utiliser le mot de passe de votre messagerie.)',
    passwordConfirmLabel: 'Confirmer le mot de passe',
    allAgree: "J'accepte tous les termes et conditions.",
    termsAgree: "[Obligatoire] Conditions d'utilisation",
    privacyAgree: '[Obligatoire] Politique de confidentialité',
    aiAgree: '[Obligatoire] Avis sur le contenu IA et clause de non-responsabilité',
    ageAgree: '[Obligatoire] J\'ai 14 ans ou plus.',
    view: '[Voir]',
    signupBtn: "S'inscrire",
    errPasswordMatch: 'Les mots de passe ne correspondent pas.',
    errPasswordPattern: 'Le mot de passe doit contenir au moins 8 caractères (lettres, chiffres, symboles).',
    errEmailCheck: "Veuillez vérifier la disponibilité de l'e-mail.",
    errDuplicate: 'Cet e-mail est déjà utilisé.',
    errAgreements: 'Veuillez accepter tous les termes obligatoires.',
    successSignup: 'Inscription réussie.',
    errSignup: 'Une erreur est survenue. Veuillez réessayer.',
    successTitle: 'Inscription réussie !',
    successDesc: 'Vous pouvez maintenant utiliser le service librement.',
    homeBtn: 'Retour à l\'accueil',
    resultsBtn: 'Voir les résultats Quiz & Sondage',
  },
  de: {
    title: 'Registrieren',
    emailLabel: 'E-Mail',
    emailPlaceholder: 'E-Mail eingeben',
    duplicateCheck: 'Prüfen',
    checking: 'Prüfe...',
    availableEmail: 'Diese E-Mail ist verfügbar.',
    passwordLabel: 'Passwort (8+ Zeichen, Buchstaben, Zahlen, Symbole)',
    passwordGuidance: '💡 Bitte erstellen Sie ein neues Passwort für diesen Dienst. (Aus Sicherheitsgründen empfehlen wir, nicht Ihr E-Mail-Passwort zu verwenden.)',
    passwordConfirmLabel: 'Passwort bestätigen',
    allAgree: 'Ich stimme allen Bedingungen und Datenschutzbestimmungen zu.',
    termsAgree: '[Erforderlich] Nutzungsbedingungen',
    privacyAgree: '[Erforderlich] Datenschutzbestimmungen',
    aiAgree: '[Erforderlich] KI-Inhalts- und Haftungsausschluss',
    ageAgree: '[Erforderlich] Ich bin mindestens 14 Jahre alt.',
    view: '[Anzeigen]',
    signupBtn: 'Registrieren',
    errPasswordMatch: 'Passwörter stimmen nicht überein.',
    errPasswordPattern: 'Passwort muss mindestens 8 Zeichen lang sein und Buchstaben, Zahlen und Symbole enthalten.',
    errEmailCheck: 'Bitte überprüfen Sie die Verfügbarkeit der E-Mail.',
    errDuplicate: 'Diese E-Mail ist bereits registriert.',
    errAgreements: 'Bitte stimmen Sie allen erforderlichen Bedingungen zu.',
    successSignup: 'Registrierung erfolgreich.',
    errSignup: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
    successTitle: 'Registrierung abgeschlossen!',
    successDesc: 'Sie können den Dienst jetzt frei nutzen.',
    homeBtn: 'Zur Startseite',
    resultsBtn: 'Quiz- & Umfrageergebnisse ansehen',
  },
  ru: {
    title: 'Регистрация',
    emailLabel: 'Email',
    emailPlaceholder: 'Введите email',
    duplicateCheck: 'Проверить',
    checking: 'Проверка...',
    availableEmail: 'Этот email доступен.',
    passwordLabel: 'Пароль (8+ символов, буквы, цифры, знаки)',
    passwordGuidance: '💡 Пожалуйста, создайте новый пароль для этого сервиса. (В целях безопасности не используйте пароль от вашей электронной почты.)',
    passwordConfirmLabel: 'Подтвердите пароль',
    allAgree: 'Я согласен со всеми условиями и политикой конфиденциальности.',
    termsAgree: '[Обязательно] Условия использования',
    privacyAgree: '[Обязательно] Политика конфиденциальности',
    aiAgree: '[Обязательно] Уведомление об ИИ-контенте и отказе от ответственности',
    ageAgree: '[Обязательно] Мне исполнилось 14 лет.',
    view: '[Посмотреть]',
    signupBtn: 'Зарегистрироваться',
    errPasswordMatch: 'Пароли не совпадают.',
    errPasswordPattern: 'Пароль должен содержать от 8 символов (буквы, цифры, символы).',
    errEmailCheck: 'Пожалуйста, проверьте доступность email.',
    errDuplicate: 'Этот email уже зарегистрирован.',
    errAgreements: 'Пожалуйста, примите все обязательные условия.',
    successSignup: 'Регистрация прошла успешно.',
    errSignup: 'Произошла ошибка. Пожалуйста, повторите попытку.',
    successTitle: 'Регистрация завершена!',
    successDesc: 'Теперь вы можете свободно пользоваться сервисом.',
    homeBtn: 'На главную',
    resultsBtn: 'Посмотреть результаты викторины и опроса',
  },
  pt: {
    title: 'Cadastrar',
    emailLabel: 'E-mail',
    emailPlaceholder: 'Digite seu e-mail',
    duplicateCheck: 'Verificar',
    checking: 'Verificando...',
    availableEmail: 'Este e-mail está disponível.',
    passwordLabel: 'Senha (8+ caracteres, letras, números, símbolos)',
    passwordGuidance: '💡 Crie uma nova senha para este serviço. (Por segurança, recomendamos não usar a senha da sua conta de e-mail.)',
    passwordConfirmLabel: 'Confirmar senha',
    allAgree: 'Concordo com todos os termos e políticas.',
    termsAgree: '[Obrigatório] Termos de Serviço',
    privacyAgree: '[Obrigatório] Política de Privacidade',
    aiAgree: '[Obrigatório] Aviso de Conteúdo de IA e Isenção de Responsabilidade',
    ageAgree: '[Obrigatório] Tenho 14 anos ou mais.',
    view: '[Ver]',
    signupBtn: 'Cadastrar',
    errPasswordMatch: 'As senhas não coincidem.',
    errPasswordPattern: 'A senha deve ter pelo menos 8 caracteres (letras, números e símbolos).',
    errEmailCheck: 'Por favor, verifique a disponibilidade do e-mail.',
    errDuplicate: 'Este e-mail já está registrado.',
    errAgreements: 'Por favor, aceite todos os termos obrigatórios.',
    successSignup: 'Cadastro realizado com sucesso.',
    errSignup: 'Ocorreu um erro. Tente novamente.',
    successTitle: 'Cadastro concluído!',
    successDesc: 'Agora você pode usar o serviço livremente.',
    homeBtn: 'Ir para o início',
    resultsBtn: 'Ver resultados de Quiz e Pesquisa',
  },
  it: {
    title: 'Registrati',
    emailLabel: 'Email',
    emailPlaceholder: 'Inserisci email',
    duplicateCheck: 'Verifica',
    checking: 'Controllo...',
    availableEmail: 'Questa email è disponibile.',
    passwordLabel: 'Password (8+ caratteri, lettere, numeri, simboli)',
    passwordGuidance: '💡 Crea una nuova password per questo servizio. (Per sicurezza, ti consigliamo di non usare la password del tuo account email.)',
    passwordConfirmLabel: 'Conferma password',
    allAgree: 'Accetto tutti i termini e la privacy policy.',
    termsAgree: '[Obbligatorio] Termini di servizio',
    privacyAgree: '[Obbligatorio] Informativa sulla privacy',
    aiAgree: '[Obbligatorio] Avviso contenuti IA e limitazione di responsabilità',
    ageAgree: '[Obbligatorio] Ho almeno 14 anni.',
    view: '[Visualizza]',
    signupBtn: 'Registrati',
    errPasswordMatch: 'Le password non coincidono.',
    errPasswordPattern: 'La password deve avere almeno 8 caratteri (lettere, numeri, simboli).',
    errEmailCheck: "Si prega di verificare la disponibilità dell'email.",
    errDuplicate: 'Questa email è già registrata.',
    errAgreements: 'Si prega di accettare tutti i termini obbligatori.',
    successSignup: 'Registrazione completata con successo.',
    errSignup: 'Si è verificato un errore. Riprova.',
    successTitle: 'Registrazione completata!',
    successDesc: 'Ora puoi utilizzare liberamente il servizio.',
    homeBtn: 'Torna alla home',
    resultsBtn: 'Vedi risultati Quiz e Sondaggio',
  },
  vi: {
    title: 'Đăng ký',
    emailLabel: 'Email',
    emailPlaceholder: 'Nhập email',
    duplicateCheck: 'Kiểm tra',
    checking: 'Đang kiểm tra...',
    availableEmail: 'Email này có thể sử dụng.',
    passwordLabel: 'Mật khẩu (8+ ký tự, gồm chữ, số, ký tự đặc biệt)',
    passwordGuidance: '💡 Vui lòng tạo mật khẩu mới cho dịch vụ này. (Vì lý do bảo mật, không nên sử dụng mật khẩu email của bạn.)',
    passwordConfirmLabel: 'Xác nhận mật khẩu',
    allAgree: 'Tôi đồng ý với tất cả điều khoản và chính sách.',
    termsAgree: '[Bắt buộc] Điều khoản dịch vụ',
    privacyAgree: '[Bắt buộc] Chính sách bảo mật',
    aiAgree: '[Bắt buộc] Thông báo về nội dung AI & Miễn trừ trách nhiệm',
    ageAgree: '[Bắt buộc] Tôi từ 14 tuổi trở lên.',
    view: '[Xem]',
    signupBtn: 'Đăng ký',
    errPasswordMatch: 'Mật khẩu không khớp.',
    errPasswordPattern: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ, số và ký tự đặc biệt.',
    errEmailCheck: 'Vui lòng kiểm tra tính khả dụng của email.',
    errDuplicate: 'Email này đã được đăng ký.',
    errAgreements: 'Vui lòng đồng ý với tất cả các điều khoản bắt buộc.',
    successSignup: 'Đăng ký thành công.',
    errSignup: 'Đã xảy ra lỗi. Vui lòng thử lại.',
    successTitle: 'Đăng ký thành công!',
    successDesc: 'Bây giờ bạn có thể sử dụng dịch vụ tự do.',
    homeBtn: 'Về trang chủ',
    resultsBtn: 'Xem kết quả Câu đố & Khảo sát',
  },
  th: {
    title: 'สมัครสมาชิก',
    emailLabel: 'อีเมล',
    emailPlaceholder: 'ป้อนอีเมล',
    duplicateCheck: 'ตรวจสอบ',
    checking: 'กำลังตรวจสอบ...',
    availableEmail: 'อีเมลนี้สามารถใช้งานได้',
    passwordLabel: 'รหัสผ่าน (8+ ตัวอักษร, A-Z, 0-9, อักขระพิเศษ)',
    passwordGuidance: '💡 โปรดสร้างรหัสผ่านใหม่สำหรับบริการนี้ (เพื่อความปลอดภัย ขอแนะนำไม่ให้ใช้รหัสผ่านเดียวกับบัญชีอีเมลของคุณ)',
    passwordConfirmLabel: 'ยืนยันรหัสผ่าน',
    allAgree: 'ฉันยอมรับข้อกำหนด นโยบายความเป็นส่วนตัว และเงื่อนไข AI ทั้งหมด',
    termsAgree: '[จำเป็น] ข้อกำหนดการใช้งาน',
    privacyAgree: '[จำเป็น] นโยบายความเป็นส่วนตัว',
    aiAgree: '[จำเป็น] ประกาศความรับผิดชอบเนื้อหา AI และข้อจำกัดความรับผิด',
    ageAgree: '[จำเป็น] ฉันมีอายุ 14 ปีขึ้นไป',
    view: '[ดู]',
    signupBtn: 'สมัครสมาชิก',
    errPasswordMatch: 'รหัสผ่านไม่ตรงกัน',
    errPasswordPattern: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร และประกอบด้วยตัวอักษร ตัวเลข และอักขระพิเศษ',
    errEmailCheck: 'กรุณาตรวจสอบการใช้งานอีเมล',
    errDuplicate: 'อีเมลนี้ลงทะเบียนแล้ว',
    errAgreements: 'กรุณายอมรับเงื่อนไขที่จำเป็นทั้งหมด',
    successSignup: 'สมัครสมาชิกสำเร็จ',
    errSignup: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
    successTitle: 'สมัครสมาชิกสำเร็จ!',
    successDesc: 'ตอนนี้คุณสามารถใช้บริการได้อย่างอิสระ',
    homeBtn: 'กลับหน้าหลัก',
    resultsBtn: 'ดูผลแบบทดสอบและแบบสอบถาม',
  },
  id: {
    title: 'Daftar',
    emailLabel: 'Email',
    emailPlaceholder: 'Masukkan email',
    duplicateCheck: 'Cek',
    checking: 'Memeriksa...',
    availableEmail: 'Email ini tersedia.',
    passwordLabel: 'Kata Sandi (8+ karakter, huruf, angka, simbol)',
    passwordGuidance: '💡 Buat kata sandi baru untuk layanan ini. (Demi keamanan, kami menyarankan untuk tidak menggunakan kata sandi akun email Anda.)',
    passwordConfirmLabel: 'Konfirmasi Kata Sandi',
    allAgree: 'Saya menyetujui semua ketentuan dan kebijakan privasi.',
    termsAgree: '[Wajib] Syarat Layanan',
    privacyAgree: '[Wajib] Kebijakan Privasi',
    aiAgree: '[Wajib] Pemberitahuan Konten AI & Sanggahan',
    ageAgree: '[Wajib] Saya berusia 14 tahun ke atas.',
    view: '[Lihat]',
    signupBtn: 'Daftar',
    errPasswordMatch: 'Kata sandi tidak cocok.',
    errPasswordPattern: 'Kata sandi minimal 8 karakter, mencakup huruf, angka, dan simbol.',
    errEmailCheck: 'Harap periksa ketersediaan email.',
    errDuplicate: 'Email ini sudah terdaftar.',
    errAgreements: 'Harap setujui semua syarat wajib.',
    successSignup: 'Pendaftaran berhasil.',
    errSignup: 'Terjadi kesalahan. Silakan coba lagi.',
    successTitle: 'Pendaftaran berhasil!',
    successDesc: 'Sekarang Anda dapat menggunakan layanan dengan bebas.',
    homeBtn: 'Ke Beranda',
    resultsBtn: 'Lihat Hasil Kuis & Survei',
  },
  ms: {
    title: 'Daftar',
    emailLabel: 'E-mel',
    emailPlaceholder: 'Masukkan e-mel',
    duplicateCheck: 'Semak',
    checking: 'Menyemak...',
    availableEmail: 'E-mel ini boleh digunakan.',
    passwordLabel: 'Kata Laluan (8+ aksara, huruf, nombor, simbol)',
    passwordGuidance: '💡 Sila cipta kata laluan baharu untuk perkhidmatan ini. (Untuk keselamatan, jangan gunakan kata laluan akaun e-mel anda.)',
    passwordConfirmLabel: 'Sahkan Kata Laluan',
    allAgree: 'Saya bersetuju dengan semua terma dan dasar privasi.',
    termsAgree: '[Wajib] Terma Perkhidmatan',
    privacyAgree: '[Wajib] Dasar Privasi',
    aiAgree: '[Wajib] Notis Kandungan AI & Penafian',
    ageAgree: '[Wajib] Saya berumur 14 tahun ke atas.',
    view: '[Lihat]',
    signupBtn: 'Daftar',
    errPasswordMatch: 'Kata laluan tidak sepadan.',
    errPasswordPattern: 'Kata laluan mesti sekurang-kurangnya 8 aksara, mengandungi huruf, nombor, dan simbol.',
    errEmailCheck: 'Sila semak ketersediaan e-mel.',
    errDuplicate: 'E-mel ini sudah didaftarkan.',
    errAgreements: 'Sila bersetuju dengan semua terma wajib.',
    successSignup: 'Pendaftaran berjaya.',
    errSignup: 'Ralat berlaku. Sila cuba lagi.',
    successTitle: 'Pendaftaran berjaya!',
    successDesc: 'Sekarang anda boleh menggunakan perkhidmatan dengan bebas.',
    homeBtn: 'Ke Laman Utama',
    resultsBtn: 'Lihat Keputusan Kuiz & Tinjauan',
  },
  hi: {
    title: 'साइन अप करें',
    emailLabel: 'ईमेल',
    emailPlaceholder: 'ईमेल दर्ज करें',
    duplicateCheck: 'जांच करें',
    checking: 'जांच हो रही है...',
    availableEmail: 'यह ईमेल उपलब्ध है।',
    passwordLabel: 'पासवर्ड (8+ अक्षर, अंक, विशेष चिन्ह)',
    passwordGuidance: '💡 कृपया इस सेवा के लिए एक नया पासवर्ड बनाएं। (सुरक्षा के लिए, अपने ईमेल खाते के पासवर्ड का उपयोग न करने की सलाह दी जाती है।)',
    passwordConfirmLabel: 'पासवर्ड की पुष्टि करें',
    allAgree: 'मैं सभी नियमों और शर्तों से सहमत हूँ।',
    termsAgree: '[आवश्यक] सेवा की शर्तें',
    privacyAgree: '[आवश्यक] गोपनीयता नीति',
    aiAgree: '[आवश्यक] AI सामग्री जिम्मेदारी और अस्वीकरण',
    ageAgree: '[आवश्यक] मेरी आयु 14 वर्ष या उससे अधिक है।',
    view: '[देखें]',
    signupBtn: 'साइन अप करें',
    errPasswordMatch: 'पासवर्ड मेल नहीं खाते।',
    errPasswordPattern: 'पासवर्ड कम से कम 8 वर्ण का होना चाहिए जिसमें अक्षर, अंक और विशेष चिन्ह शामिल हों।',
    errEmailCheck: 'कृपया ईमेल उपलब्धता की जांच करें।',
    errDuplicate: 'यह ईमेल पहले से पंजीकृत है।',
    errAgreements: 'कृपया सभी आवश्यक शर्तों से सहमत हों।',
    successSignup: 'पंजीकरण सफलतापूर्वक पूर्ण हुआ।',
    errSignup: 'त्रुटि हुई। कृपया पुनः प्रयास करें।',
    successTitle: 'साइन अप पूरा हो गया!',
    successDesc: 'अब आप सेवा का स्वतंत्र रूप से उपयोग कर सकते हैं।',
    homeBtn: 'होम पर जाएं',
    resultsBtn: 'क्विज़ और सर्वेक्षण परिणाम देखें',
  },
  ar: {
    title: 'إنشاء حساب',
    emailLabel: 'البريد الإلكتروني',
    emailPlaceholder: 'أدخل بريدك الإلكتروني',
    duplicateCheck: 'تحقق',
    checking: 'جاري التحقق...',
    availableEmail: 'هذا البريد متاح.',
    passwordLabel: 'كلمة المرور (8+ أحرف، أرقام، رموز)',
    passwordGuidance: '💡 يرجى إنشاء كلمة مرور جديدة لهذه الخدمة. (لأسباب أمنية، نوصي بعدم استخدام كلمة مرور حساب البريد الإلكتروني الخاص بك.)',
    passwordConfirmLabel: 'تأكيد كلمة المرور',
    allAgree: 'أوافق على جميع الشروط والأحكام سياسة الخصوصية.',
    termsAgree: '[إلزامي] شروط الخدمة',
    privacyAgree: '[إلزامي] سياسة الخصوصية',
    aiAgree: '[إلزامي] إشعار محتوى الذكاء الاصطناعي وإخلاء المسؤولية',
    ageAgree: '[إلزامي] أنا أبلغ من العمر 14 عاماً أو أكثر.',
    view: '[عرض]',
    signupBtn: 'إنشاء حساب',
    errPasswordMatch: 'كلمات المرور غير متطابقة.',
    errPasswordPattern: 'يجب أن تكون كلمة المرور 8 أحرف على الأقل وتحتوي على حروف وأرقام ورموز.',
    errEmailCheck: 'يرجى التحقق من توفر البريد الإلكتروني.',
    errDuplicate: 'هذا البريد مسجل بالفعل.',
    errAgreements: 'يرجى الموافقة على جميع الشروط الإلزامية.',
    successSignup: 'تم التسجيل بنجاح.',
    errSignup: 'حدث خطأ. يرجى المحاولة مرة أخرى.',
    successTitle: 'تم التسجيل بنجاح!',
    successDesc: 'يمكنك الآن استخدام الخدمة بحرية.',
    homeBtn: 'العودة للرئيسية',
    resultsBtn: 'عرض نتائج الاختبار والاستبيان',
  },
  tr: {
    title: 'Kayıt Ol',
    emailLabel: 'E-posta',
    emailPlaceholder: 'E-posta girin',
    duplicateCheck: 'Kontrol Et',
    checking: 'Kontrol ediliyor...',
    availableEmail: 'Bu e-posta kullanılabilir.',
    passwordLabel: 'Şifre (8+ karakter, harf, rakam, özel karakter)',
    passwordGuidance: '💡 Lütfen bu hizmet için yeni bir şifre oluşturun. (Güvenlik için e-posta hesabı şifrenizi kullanmamanızı öneririz.)',
    passwordConfirmLabel: 'Şifreyi Onayla',
    allAgree: 'Tüm şartları ve gizlilik politikasını kabul ediyorum.',
    termsAgree: '[Zorunlu] Kullanım Şartları',
    privacyAgree: '[Zorunlu] Gizlilik Politikası',
    aiAgree: '[Zorunlu] Yapay Zeka İçerik Sorumluluğu ve Sorumluluk Reddi',
    ageAgree: '[Zorunlu] 14 yaş veya üzerindeyim.',
    view: '[Görüntüle]',
    signupBtn: 'Kayıt Ol',
    errPasswordMatch: 'Şifreler eşleşmiyor.',
    errPasswordPattern: 'Şifre en az 8 karakter olmalı, harf, rakam ve özel karakter içermelidir.',
    errEmailCheck: 'Lütfen e-posta uygunluğunu kontrol edin.',
    errDuplicate: 'Bu e-posta zaten kayıtlı.',
    errAgreements: 'Lütfen tüm zorunlu şartları kabul edin.',
    successSignup: 'Kayıt başarıyla tamamlandı.',
    errSignup: 'Bir hata oluştu. Lütfen tekrar deneyin.',
    successTitle: 'Kayıt tamamlandı!',
    successDesc: 'Artık hizmeti özgürce kullanabilirsiniz.',
    homeBtn: 'Ana Sayfaya Git',
    resultsBtn: 'Quiz ve Anket Sonuçlarını Gör',
  },
  nl: {
    title: 'Registreren',
    emailLabel: 'E-mail',
    emailPlaceholder: 'Voer e-mail in',
    duplicateCheck: 'Controleren',
    checking: 'Controleren...',
    availableEmail: 'Deze e-mail is beschikbaar.',
    passwordLabel: 'Wachtwoord (8+ tekens, letters, cijfers, symbolen)',
    passwordGuidance: '💡 Maak een nieuw wachtwoord aan voor deze service. (Voor de veiligheid raden we af om uw e-mailwachtwoord te gebruiken.)',
    passwordConfirmLabel: 'Wachtwoord bevestigen',
    allAgree: 'Ik ga akkoord met alle algemene voorwaarden en het privacybeleid.',
    termsAgree: '[Verplicht] Servicevoorwaarden',
    privacyAgree: '[Verplicht] Privacybeleid',
    aiAgree: '[Verplicht] AI-contentverantwoordelijkheid en Disclaimer',
    ageAgree: '[Verplicht] Ik ben 14 jaar of ouder.',
    view: '[Bekijken]',
    signupBtn: 'Registreren',
    errPasswordMatch: 'Wachtwoorden komen niet overeen.',
    errPasswordPattern: 'Wachtwoord moet minimaal 8 tekens, letters, cijfers en symbolen bevatten.',
    errEmailCheck: 'Controleer de beschikbaarheid van de e-mail.',
    errDuplicate: 'Deze e-mail is al geregistreerd.',
    errAgreements: 'Ga akkoord met alle verplichte voorwaarden.',
    successSignup: 'Registratie succesvol voltooid.',
    errSignup: 'Er is een fout opgetreden. Probeer het opnieuw.',
    successTitle: 'Registratie voltooid!',
    successDesc: 'U kunt de service nu vrij gebruiken.',
    homeBtn: 'Naar Home',
    resultsBtn: 'Bekijk Quiz- en Enquêteresultaten',
  },
  pl: {
    title: 'Rejestracja',
    emailLabel: 'E-mail',
    emailPlaceholder: 'Wprowadź e-mail',
    duplicateCheck: 'Sprawdź',
    checking: 'Sprawdzanie...',
    availableEmail: 'Ten e-mail jest dostępny.',
    passwordLabel: 'Hasło (8+ znaków, litery, cyfry, znaki spec.)',
    passwordGuidance: '💡 Utwórz nowe hasło dla tej usługi. (Ze względów bezpieczeństwa zalecamy nie używać hasła do konta e-mail.)',
    passwordConfirmLabel: 'Potwierdź hasło',
    allAgree: 'Akceptuję wszystkie regulaminy i politykę prywatności.',
    termsAgree: '[Wymagane] Regulamin serwisu',
    privacyAgree: '[Wymagane] Polityka prywatności',
    aiAgree: '[Wymagane] Ostrzeżenie dot. treści AI i wyłączenia odpowiedzialności',
    ageAgree: '[Wymagane] Mam ukończone 14 lat.',
    view: '[Zobacz]',
    signupBtn: 'Zarejestruj się',
    errPasswordMatch: 'Hasła nie pasują do siebie.',
    errPasswordPattern: 'Hasło musi mieć min. 8 znaków oraz zawierać litery, cyfry i znaki specjalne.',
    errEmailCheck: 'Proszę sprawdzić dostępność adresu e-mail.',
    errDuplicate: 'Ten e-mail jest już zarejestrowany.',
    errAgreements: 'Proszę zaakceptować wszystkie wymagane zgody.',
    successSignup: 'Rejestracja zakończona sukcesem.',
    errSignup: 'Wystąpił błąd. Spróbuj ponownie.',
    successTitle: 'Rejestracja zakończona!',
    successDesc: 'Możesz teraz swobodnie korzystać z usługi.',
    homeBtn: 'Strona główna',
    resultsBtn: 'Zobacz wyniki Quizu i Ankiety',
  },
  sv: {
    title: 'Registrera dig',
    emailLabel: 'E-post',
    emailPlaceholder: 'Ange e-post',
    duplicateCheck: 'Kontrollera',
    checking: 'Kontrollerar...',
    availableEmail: 'Denna e-post är tillgänglig.',
    passwordLabel: 'Lösenord (8+ tecken, bokstäver, siffror, symboler)',
    passwordGuidance: '💡 Skapa ett nytt lösenord för denna tjänst. (Av säkerhetsskäl rekommenderar vi att du inte använder ditt e-postlösenord.)',
    passwordConfirmLabel: 'Bekräfta lösenord',
    allAgree: 'Jag godkänner alla villkor och integritetspolicyn.',
    termsAgree: '[Obligatoriskt] Användarvillkor',
    privacyAgree: '[Obligatoriskt] Integritetspolicy',
    aiAgree: '[Obligatoriskt] AI-innehålls- och ansvarsfriskrivning',
    ageAgree: '[Obligatoriskt] Jag är 14 år eller äldre.',
    view: '[Visa]',
    signupBtn: 'Registrera dig',
    errPasswordMatch: 'Lösenorden matchar inte.',
    errPasswordPattern: 'Lösenordet måste vara minst 8 tecken och innehålla bokstäver, siffror och symboler.',
    errEmailCheck: 'Vänligen kontrollera e-postens tillgänglighet.',
    errDuplicate: 'Denna e-post är redan registrerad.',
    errAgreements: 'Vänligen godkänn alla obligatoriska villkor.',
    successSignup: 'Registrering genomförd.',
    errSignup: 'Ett fel uppstod. Försök igen.',
    successTitle: 'Registrering klar!',
    successDesc: 'Du kan nu använda tjänsten fritt.',
    homeBtn: 'Till startsidan',
    resultsBtn: 'Visa Quiz- och Enkätresultat',
  },
};

export default function SignupPage() {
  const router = useRouter();
  const [lang, setLang] = useState('ko');
  const [isMounted, setIsMounted] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [agreements, setAgreements] = useState({
    termsOfService: false,
    privacyPolicy: false,
    aiContentNotice: false,
    ageRestriction: false,
  });

  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // 언어 복원 + 마운트 처리
  useEffect(() => {
    const savedLang = localStorage.getItem('app_language');
    if (savedLang && translations[savedLang]) {
      setLang(savedLang);
    }
    setIsMounted(true);
  }, []);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLang(newLang);
    localStorage.setItem('app_language', newLang);
  };

  const t = translations[lang] || translations.ko;
  const allChecked = Object.values(agreements).every(Boolean);

  const handleAgreementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setAgreements((prev) => ({ ...prev, [name]: checked }));
  };
   
  


  const handleAllAgreementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setAgreements({
      termsOfService: checked,
      privacyPolicy: checked,
      aiContentNotice: checked,
      ageRestriction: checked,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
const handleSignup = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  // 1. 비밀번호 유효성 검사
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
  if (!passwordRegex.test(formData.password)) {
    setError(t.errPasswordPattern);
    return;
  }

  // 2. 비밀번호 일치 검사
  if (formData.password !== formData.confirmPassword) {
    setError(t.errPasswordMatch);
    return;
  }

  // 3. 약관 동의 검사
  if (
    !agreements.termsOfService ||
    !agreements.privacyPolicy ||
    !agreements.aiContentNotice ||
    !agreements.ageRestriction
  ) {
    setError(t.errAgreements);
    return;
  }

  try {
    // ★ 실제 Supabase 회원가입
    const { data, error: supabaseError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          agreements: {
            ...agreements,
            agreedAt: new Date().toISOString(),
          },
        },
      },
    });

    if (supabaseError) {
      console.error('Signup Error:', supabaseError);
      setError(supabaseError.message || t.errSignup);
      return;
    }
    localStorage.setItem('email', formData.email);
    setIsSuccess(true);
  } catch (err: any) {
    console.error(err);
    setError(t.errSignup);
  }
};
    
  // ==========================================
// 1️⃣ 회원가입 성공 시 화면
// ==========================================
if (isSuccess) {
  const handleDirectLogin = () => {
    localStorage.setItem('token', `user-token-${Date.now()}`);
    localStorage.setItem('email', formData.email);
    alert('로그인 되었습니다!');
    router.push('/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="p-10 bg-white border border-gray-200 rounded-2xl shadow-sm text-center max-w-md w-full">
        <h2 className="text-2xl font-bold mb-3 text-gray-900">
          회원가입이 완료되었습니다!
        </h2>
        
        <p className="text-sm text-gray-600 mb-6">
          계정이 정상적으로 등록되었습니다. 바로 서비스를 이용하실 수 있습니다.
        </p>
        
        <div className="flex flex-col gap-3">
          <button 
            onClick={handleDirectLogin} 
            className="w-full py-3 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm transition cursor-pointer"
          >
            바로 서비스 시작하기 (자동 로그인)
          </button>
          <button 
            onClick={() => router.push('/login')} 
            className="w-full py-3 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 shadow-sm transition cursor-pointer"
          >
            로그인 페이지로 이동
          </button>
        </div>
      </div>
    </div>
  );
}
  // ==========================================
  // 2️⃣ 회원가입 입력 폼
  // ==========================================
  return (
    <div style={{ maxWidth: '450px', margin: '40px auto', padding: '25px', fontFamily: 'sans-serif', backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      {/* 언어 선택 드롭다운 */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
        <select
          value={lang}
          onChange={handleLanguageChange}
          style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333', fontSize: '13px' }}
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>{l.name}</option>
          ))}
        </select>
      </div>

      <h2 style={{ color: '#222', marginBottom: '20px' }}>{t.title}</h2>
      {error && <p style={{ color: 'red', fontSize: '14px', marginBottom: '10px' }}>{error}</p>}

      <form onSubmit={handleSignup}>
        {/* 이메일 입력 */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>{t.emailLabel}</label>
          <input
            type="email"
            name="email"
            placeholder={t.emailPlaceholder}
            value={formData.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#fff', color: '#333' }}
          />
        </div>

        {/* 비밀번호 입력 */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>{t.passwordLabel}</label>
          <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#0070f3', lineHeight: '1.4' }}>
            {t.passwordGuidance}
          </p>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#fff', color: '#333' }}
          />
        </div>

        {/* 비밀번호 확인 입력 */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: '500' }}>{t.passwordConfirmLabel}</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#fff', color: '#333' }}
          />
        </div>

        {/* 약관 동의 영역 */}
        <div style={{ borderTop: '1px solid #ddd', paddingTop: '15px', marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', fontWeight: 'bold', fontSize: '14px', color: '#333' }}>
            <input
              type="checkbox"
              checked={allChecked}
              onChange={handleAllAgreementChange}
              style={{ marginRight: '8px', width: '16px', height: '16px' }}
            />
            {t.allAgree}
          </label>

          <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '10px 0' }} />

          {/* 1. 이용약관 동의 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: '#444' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="termsOfService"
                checked={agreements.termsOfService}
                onChange={handleAgreementChange}
                required
                style={{ marginRight: '8px' }}
              />
              {t.termsAgree}
            </label>
            <Link href="/terms" target="_blank" style={{ color: '#0070f3', textDecoration: 'underline', fontSize: '12px' }}>
              {t.view}
            </Link>
          </div>

          {/* 2. 개인정보 수집 및 이용 동의 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: '#444' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="privacyPolicy"
                checked={agreements.privacyPolicy}
                onChange={handleAgreementChange}
                required
                style={{ marginRight: '8px' }}
              />
              {t.privacyAgree}
            </label>
            <Link href="/privacy" target="_blank" style={{ color: '#0070f3', textDecoration: 'underline', fontSize: '12px' }}>
              {t.view}
            </Link>
          </div>

          {/* 3. AI 콘텐츠 이용 안내 동의 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: '#444' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="aiContentNotice"
                checked={agreements.aiContentNotice}
                onChange={handleAgreementChange}
                required
                style={{ marginRight: '8px' }}
              />
              {t.aiAgree}
            </label>
            <Link href="/disclaimer" target="_blank" style={{ color: '#0070f3', textDecoration: 'underline', fontSize: '12px' }}>
              {t.view}
            </Link>
          </div>

          {/* 4. 만 14세 이상 이용 동의 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', color: '#444' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="ageRestriction"
                checked={agreements.ageRestriction}
                onChange={handleAgreementChange}
                required
                style={{ marginRight: '8px' }}
              />
              {t.ageAgree}
            </label>
          </div>
        </div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          style={{ width: '100%', padding: '12px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {t.signupBtn}
        </button>
      </form>
    </div>
  );
}