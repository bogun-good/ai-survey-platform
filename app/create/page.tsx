'use client';

import { useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Copy, Check, QrCode, Download } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

const TEXTS: Record<string, any> = {
  ko: { 
    back: "메인으로 돌아가기", title: "주제와 대상 입력으로 자동 생성", topic: "설문 주제", topicPh: "예: 강의 만족도 조사", target: "설문 대상", targetPh: "예: 20~30대 직장인", 
    obj: "객관식 문항 수", mcqTypeLabel: "객관식 유형", mcqTypeOX: "O/X형", mcqType4: "4지 선다형", mcqType5: "5지 선다형",
    subj: "주관식 문항 수", btn: "총 {n}문항 설문지 생성하기", loading: "AI가 맞춤형 설문을 생성 중입니다...", 
    alert1: "주제와 대상을 모두 입력해주세요.", alert2: "최소 1개 이상의 문항 수를 설정해주세요.", preview: "📋 생성된 설문지 미리보기", 
    shareTitle: "🚀 설문지 공유 및 배포", copyLink: "설문 링크 복사", copied: "링크 복사 완료!", downloadQr: "QR 코드 이미지 다운로드" 
  },
  en: { 
    back: "Back to Main", title: "Auto-Generate by Topic & Target", topic: "Survey Topic", topicPh: "Ex: Cafeteria satisfaction", target: "Target Audience", targetPh: "Ex: Employees in 20s-30s", 
    obj: "Multiple Choice", mcqTypeLabel: "MCQ Type", mcqTypeOX: "True/False (O/X)", mcqType4: "4 Options", mcqType5: "5 Options",
    subj: "Open-ended", btn: "Generate {n} Questions", loading: "AI is generating survey...", 
    alert1: "Please enter both topic and target.", alert2: "Set at least 1 question.", preview: "📋 Survey Preview",
    shareTitle: "🚀 Share & Distribute Survey", copyLink: "Copy Survey Link", copied: "Copied!", downloadQr: "Download QR Code" 
  },
  ja: { 
    back: "メインに戻る", title: "テーマと対象で自動生成", topic: "アンケートテーマ", topicPh: "例：社内食堂の満足度", target: "対象者", targetPh: "例：20〜30代の会社員", 
    obj: "選択式 設問数", mcqTypeLabel: "選択式の種類", mcqTypeOX: "マルバツ (O/X)", mcqType4: "4択", mcqType5: "5択",
    subj: "記述式 設問数", btn: "計{n}問のアンケートを作成", loading: "作成中...", 
    alert1: "テーマと対象を入力してください。", alert2: "1問以上設定してください。", preview: "📋 プレビュー", 
    shareTitle: "🚀 アンケート共有", copyLink: "リンクをコピー", copied: "コピー完了!", downloadQr: "QRコードをダウンロード" 
  },
  zh: { 
    back: "返回主页", title: "按主题和对象自动生成", topic: "问卷主题", topicPh: "例：公司食堂满意度调查", target: "调查对象", targetPh: "例：20~30岁上班族", 
    obj: "客观题数量", mcqTypeLabel: "题型选项", mcqTypeOX: "判断题 (O/X)", mcqType4: "4个选项", mcqType5: "5个选项",
    subj: "主观题数量", btn: "生成 {n} 道题", loading: "生成中...", 
    alert1: "请填写主题和对象。", alert2: "请至少设置1个问题。", preview: "📋 问卷预览", 
    shareTitle: "🚀 分享问卷", copyLink: "复制问卷链接", copied: "已复制!", downloadQr: "下载二维码" 
  },
  vi: { 
    back: "Quay lại", title: "Tự động tạo theo Chủ đề & Đối tượng", topic: "Chủ đề khảo sát", topicPh: "VD: Sự hài lòng về căng tin", target: "Đối tượng", targetPh: "VD: Nhân viên 20-30 tuổi", 
    obj: "Câu trắc nghiệm", mcqTypeLabel: "Loại trắc nghiệm", mcqTypeOX: "Đúng/Sai (O/X)", mcqType4: "4 lựa chọn", mcqType5: "5 lựa chọn",
    subj: "Câu tự luận", btn: "Tạo {n} câu hỏi", loading: "Đang tạo...", 
    alert1: "Vui lòng nhập chủ đề và đối tượng.", alert2: "Đặt ít nhất 1 câu hỏi.", preview: "📋 Xem trước", 
    shareTitle: "🚀 Chia sẻ khảo sát", copyLink: "Sao chép liên kết", copied: "Đã sao chép!", downloadQr: "Tải mã QR" 
  },
  es: { 
    back: "Volver al inicio", title: "Generar por Tema y Público", topic: "Tema", topicPh: "Ej: Satisfacción en la cafetería", target: "Público Objetivo", targetPh: "Ej: Empleados de 20-30 años", 
    obj: "Opción Múltiple", mcqTypeLabel: "Tipo de opciones", mcqTypeOX: "Verdadero/Falso (O/X)", mcqType4: "4 Opciones", mcqType5: "5 Opciones",
    subj: "Preguntas Abiertas", btn: "Generar {n} preguntas", loading: "Generando...", 
    alert1: "Ingrese tema y público.", alert2: "Configure al menos 1 pregunta.", preview: "📋 Vista Previa", 
    shareTitle: "🚀 Compartir encuesta", copyLink: "Copiar enlace", copied: "¡Copiado!", downloadQr: "Descargar código QR" 
  },
  fr: { 
    back: "Retour", title: "Générer par Sujet et Cible", topic: "Sujet", topicPh: "Ex: Satisfaction à la cafétéria", target: "Public Cible", targetPh: "Ex: Employés de 20-30 ans", 
    obj: "Choix Multiples", mcqTypeLabel: "Type de QCM", mcqTypeOX: "Vrai/Faux (O/X)", mcqType4: "4 Options", mcqType5: "5 Options",
    subj: "Questions Ouvertes", btn: "Générer {n} questions", loading: "Génération...", 
    alert1: "Veuillez entrer le sujet et la cible.", alert2: "Définissez au moins 1 question.", preview: "📋 Aperçu", 
    shareTitle: "🚀 Partager le sondage", copyLink: "Copier le lien", copied: "Copié !", downloadQr: "Télécharger le QR code" 
  },
  de: { 
    back: "Zurück", title: "Generieren nach Thema & Ziel", topic: "Thema", topicPh: "Bsp: Kantinenzufriedenheit", target: "Zielgruppe", targetPh: "Bsp: Mitarbeiter 20-30 Jahre", 
    obj: "Multiple Choice", mcqTypeLabel: "MC-Typ", mcqTypeOX: "Wahr/Falsch (O/X)", mcqType4: "4 Optionen", mcqType5: "5 Optionen",
    subj: "Offene Fragen", btn: "{n} Fragen generieren", loading: "Wird generiert...", 
    alert1: "Bitte Thema und Ziel eingeben.", alert2: "Mindestens 1 Frage festlegen.", preview: "📋 Vorschau", 
    shareTitle: "🚀 Umfrage teilen", copyLink: "Link kopieren", copied: "Kopiert!", downloadQr: "QR-Code herunterladen" 
  },
  ru: { 
    back: "На главную", title: "Генерация по теме и аудитории", topic: "Тема", topicPh: "Пример: Удовлетворенность кафетерием", target: "Аудитория", targetPh: "Пример: Сотрудники 20-30 лет", 
    obj: "Тестовые вопросы", mcqTypeLabel: "Тип теста", mcqTypeOX: "Правда/Ложь (O/X)", mcqType4: "4 Варианта", mcqType5: "5 Вариантов",
    subj: "Открытые вопросы", btn: "Создать {n} вопросов", loading: "Создание...", 
    alert1: "Введите тему и аудиторию.", alert2: "Установите хотя бы 1 вопрос.", preview: "📋 Предпросмотр", 
    shareTitle: "🚀 Поделиться опросом", copyLink: "Копировать ссылку", copied: "Скопировано!", downloadQr: "Скачать QR-код" 
  },
  ar: { 
    back: "العودة للرئيسية", title: "توليد حسب الموضوع والهدف", topic: "الموضوع", topicPh: "مثال: رضا الكافتيريا", target: "الجمهور الهدف", targetPh: "مثال: الموظفين 20-30 سنة", 
    obj: "خيارات متعددة", mcqTypeLabel: "نوع الخيارات", mcqTypeOX: "صح/خطأ (O/X)", mcqType4: "4 خيارات", mcqType5: "5 خيارات",
    subj: "أسئلة مقالية", btn: "توليد {n} أسئلة", loading: "جاري التوليد...", 
    alert1: "الرجاء إدخال الموضوع والهدف.", alert2: "عيّن سؤالاً واحداً على الأقل.", preview: "📋 معاينة الاستطلاع", 
    shareTitle: "🚀 مشاركة الاستطلاع", copyLink: "نسخ الرابط", copied: "تم النسخ!", downloadQr: "تحميل رمز الاستجابة السريعة" 
  },
  pt: { 
    back: "Voltar", title: "Gerar por Tema e Público", topic: "Tema", topicPh: "Ex: Satisfação no refeitório", target: "Público", targetPh: "Ex: Funcionários de 20-30 anos", 
    obj: "Múltipla Escolha", mcqTypeLabel: "Tipo de múltipla escolha", mcqTypeOX: "Verdadeiro/Falso (O/X)", mcqType4: "4 Opções", mcqType5: "5 Opções",
    subj: "Abertas", btn: "Gerar {n} Questões", loading: "Gerando...", 
    alert1: "Insira tema e público.", alert2: "Defina pelo menos 1 questão.", preview: "📋 Pré-visualização", 
    shareTitle: "🚀 Compartilhar pesquisa", copyLink: "Copiar link", copied: "Copiado!", downloadQr: "Baixar QR Code" 
  },
  id: { 
    back: "Kembali", title: "Buat dengan Topik & Target", topic: "Topik", topicPh: "Cth: Kepuasan kafetaria", target: "Target", targetPh: "Cth: Karyawan usia 20-30an", 
    obj: "Pilihan Ganda", mcqTypeLabel: "Tipe Pilihan Ganda", mcqTypeOX: "Benar/Salah (O/X)", mcqType4: "4 Pilihan", mcqType5: "5 Pilihan",
    subj: "Esai", btn: "Buat {n} Pertanyaan", loading: "Membuat...", 
    alert1: "Masukkan topik dan target.", alert2: "Setel minimal 1 pertanyaan.", preview: "📋 Pratinjau", 
    shareTitle: "🚀 Bagikan Survei", copyLink: "Salin Tautan", copied: "Disalin!", downloadQr: "Unduh Kode QR" 
  },
  hi: { 
    back: "वापस जाएं", title: "विषय और लक्ष्य द्वारा बनाएं", topic: "विषय", topicPh: "उदा: कैफेटेरिया संतुष्टि", target: "लक्ष्य", targetPh: "उदा: 20-30 वर्ष के कर्मचारी", 
    obj: "बहुविकल्पीय", mcqTypeLabel: "विकल्प प्रकार", mcqTypeOX: "सही/गलत (O/X)", mcqType4: "4 विकल्प", mcqType5: "5 विकल्प",
    subj: "निबंध", btn: "{n} प्रश्न बनाएं", loading: "बनाया जा रहा है...", 
    alert1: "विषय और लक्ष्य दर्ज करें।", alert2: "कम से कम 1 प्रश्न सेट करें।", preview: "📋 पूर्वावलोकन", 
    shareTitle: "🚀 सर्वेक्षण साझा करें", copyLink: "लिंक कॉपी करें", copied: "कॉपी किया गया!", downloadQr: "QR कोड डाउनलोड करें" 
  },
  th: { 
    back: "กลับสู่หน้าหลัก", title: "สร้างจากหัวข้อและเป้าหมาย", topic: "หัวข้อ", topicPh: "เช่น: ความพึงพอใจในโรงอาหาร", target: "เป้าหมาย", targetPh: "เช่น: พนักงานอายุ 20-30 ปี", 
    obj: "ปรนัย", mcqTypeLabel: "ประเภทตัวเลือก", mcqTypeOX: "ถูก/ผิด (O/X)", mcqType4: "4 ตัวเลือก", mcqType5: "5 ตัวเลือก",
    subj: "อัตนัย", btn: "สร้าง {n} คำถาม", loading: "กำลังสร้าง...", 
    alert1: "กรุณาใส่หัวข้อและเป้าหมาย", alert2: "ตั้งค่าอย่างน้อย 1 คำถาม", preview: "📋 ตัวอย่างแบบสอบถาม", 
    shareTitle: "🚀 แชร์แบบสอบถาม", copyLink: "คัดลอกลิงก์", copied: "คัดลอกแล้ว!", downloadQr: "ดาวน์โหลด QR Code" 
  },
  fil: { 
    back: "Bumalik", title: "Bumuo sa Paksa at Target", topic: "Paksa", topicPh: "Hal: Kasiyahan sa cafeteria", target: "Target", targetPh: "Hal: Mga empleyado (20-30s)", 
    obj: "Multiple Choice", mcqTypeLabel: "Uri ng Multiple Choice", mcqTypeOX: "Tama/Mali (O/X)", mcqType4: "4 na Pagpipilian", mcqType5: "5 na Pagpipilian",
    subj: "Essay", btn: "Bumuo ng {n} Tanong", loading: "Binubuo...", 
    alert1: "Ilagay ang paksa at target.", alert2: "Maglagay ng kahit 1 tanong.", preview: "📋 Preview", 
    shareTitle: "🚀 Ibahagi ang Survey", copyLink: "Kopyahin ang Link", copied: "Nakopya!", downloadQr: "I-download ang QR Code" 
  },
  tr: { 
    back: "Geri", title: "Konu ve Hedefle Oluştur", topic: "Konu", topicPh: "Örn: Kafeterya memnuniyeti", target: "Hedef Kitle", targetPh: "Örn: 20-30 yaş çalışanlar", 
    obj: "Çoktan Seçmeli", mcqTypeLabel: "Seçenek Türü", mcqTypeOX: "Doğru/Yanlış (O/X)", mcqType4: "4 Seçenekli", mcqType5: "5 Seçenekli",
    subj: "Açık Uçlu", btn: "{n} Soru Oluştur", loading: "Oluşturuluyor...", 
    alert1: "Lütfen konu ve hedefi girin.", alert2: "En az 1 soru belirleyin.", preview: "📋 Önizleme", 
    shareTitle: "🚀 Anketi Paylaş", copyLink: "Bağlantıyı Kopyala", copied: "Kopylandı!", downloadQr: "QR Kodunu İndir" 
  },
  it: { 
    back: "Indietro", title: "Genera per Argomento e Target", topic: "Argomento", topicPh: "Es: Soddisfazione mensa", target: "Pubblico", targetPh: "Es: Dipendenti 20-30 anni", 
    obj: "Scelta Multipla", mcqTypeLabel: "Tipo di scelta multipla", mcqTypeOX: "Vero/Falso (O/X)", mcqType4: "4 Opzioni", mcqType5: "5 Opzioni",
    subj: "Domande Aperte", btn: "Genera {n} Domande", loading: "Generazione...", 
    alert1: "Inserisci argomento e target.", alert2: "Imposta almeno 1 domanda.", preview: "📋 Anteprima", 
    shareTitle: "🚀 Condividi Sondaggio", copyLink: "Copia Link", copied: "Copiato!", downloadQr: "Scarica Codice QR" 
  },
  nl: { 
    back: "Terug", title: "Genereren op Thema & Doel", topic: "Thema", topicPh: "Bijv: Kantine tevredenheid", target: "Doelgroep", targetPh: "Bijv: Werknemers 20-30 jaar", 
    obj: "Meerkeuze", mcqTypeLabel: "Type Meerkeuze", mcqTypeOX: "Waar/Niet waar (O/X)", mcqType4: "4 Opties", mcqType5: "5 Opties",
    subj: "Open Vragen", btn: "Genereer {n} Vragen", loading: "Genereren...", 
    alert1: "Voer thema en doelgroep in.", alert2: "Stel minimaal 1 vraag in.", preview: "📋 Voorbeeld", 
    shareTitle: "🚀 Enquête Delen", copyLink: "Link Kopiëren", copied: "Gekopieerd!", downloadQr: "QR-code Downloaden" 
  },
  uk: { 
    back: "Назад", title: "Генерація за темою та ціллю", topic: "Тема", topicPh: "Напр: Задоволеність їдальнею", target: "Аудиторія", targetPh: "Напр: Працівники 20-30 років", 
    obj: "Тестові", mcqTypeLabel: "Тип тесту", mcqTypeOX: "Правда/Брехня (O/X)", mcqType4: "4 Варіанти", mcqType5: "5 Варіантів",
    subj: "Відкриті", btn: "Створити {n} питань", loading: "Створення...", 
    alert1: "Введіть тему та аудиторію.", alert2: "Встановіть хоча б 1 питання.", preview: "📋 Попередній перегляд", 
    shareTitle: "🚀 Поділитися опитуванням", copyLink: "Копіювати посилання", copied: "Скопировано!", downloadQr: "Завантажити QR-код" 
  },
  ms: { 
    back: "Kembali", title: "Jana melalui Topik & Sasaran", topic: "Topik", topicPh: "Cth: Kepuasan kafetaria", target: "Sasaran", targetPh: "Cth: Pekerja 20-an", 
    obj: "Aneka Pilihan", mcqTypeLabel: "Jenis Pilihan", mcqTypeOX: "Betul/Salah (O/X)", mcqType4: "4 Pilihan", mcqType5: "5 Pilihan",
    subj: "Esei", btn: "Jana {n} Soalan", loading: "Menjana...", 
    alert1: "Masukkan topik dan sasaran.", alert2: "Tetapkan sekurang-kurangnya 1 soalan.", preview: "📋 Pratonton", 
    shareTitle: "🚀 Kongsi Tinjauan", copyLink: "Salin Pautan", copied: "Disalin!", downloadQr: "Muat Turun Kod QR" 
  }
};

function Mode1Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lang = searchParams.get('lang') || 'ko';
  const t = TEXTS[lang] || TEXTS['ko'];

  const [topic, setTopic] = useState('');
  const [target, setTarget] = useState('');
  
  // 객관식 유형 상태를 먼저 선언
  const [mcqType, setMcqType] = useState('4'); 
  const [objCount, setObjCount] = useState(3);
  
  const [subjCount, setSubjCount] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [surveyData, setSurveyData] = useState<any[]>([]);
  const [isCopied, setIsCopied] = useState(false);

  const qrRef = useRef<HTMLDivElement>(null);

  const productionDomain = 'https://ai-survey-platform-gamma.vercel.app';
  const shareUrl = typeof window !== 'undefined' 
    ? (window.location.hostname === 'localhost' 
        ? window.location.href 
        : productionDomain) 
    : productionDomain;

  const handleGenerate = async () => {
    if (!topic || !target) return alert(t.alert1);
    if (objCount + subjCount === 0) return alert(t.alert2);
    
    setIsLoading(true);
    setSurveyData([]);
    
    try {
      const response = await fetch('/api/generate-survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          target,
          mcqCount: objCount,
          mcqType, // 선택한 객관식 유형 전달
          subjectiveCount: subjCount,
          lang
        })
      });

      const result = await response.json();
      if (result.success && result.data && result.data.questions) {
        const formatted = result.data.questions.map((q: any) => ({
          type: q.type === 'mcq' ? 'radio' : 'textarea',
          question: q.question,
          options: q.options || []
        }));
        setSurveyData(formatted);
      } else {
        alert('설문 생성 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error(error);
      alert('서버 통신 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleDownloadQR = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;
    const imageUri = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = imageUri;
    link.download = 'survey-qr-code.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-2xl w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <button onClick={() => router.push('/')} className="text-gray-500 mb-6 text-sm hover:text-gray-800 flex items-center gap-2">
        &larr; {t.back}
      </button>
      <h1 className="text-2xl font-bold text-blue-900 mb-6">{t.title}</h1>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{t.topic}</label>
          <input type="text" placeholder={t.topicPh} className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" value={topic} onChange={(e) => setTopic(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{t.target}</label>
          <input type="text" placeholder={t.targetPh} className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" value={target} onChange={(e) => setTarget(e.target.value)} />
        </div>
        
        {/* 문항 설정 영역: 객관식 유형을 먼저 선택하고 문항 수를 입력하도록 순서 변경 */}
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          
          {/* 1. 객관식 유형 선택 */}
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1">{t.mcqTypeLabel}</label>
            <select 
              className="w-full border p-2.5 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500" 
              value={mcqType} 
              onChange={(e) => setMcqType(e.target.value)}
            >
              <option value="ox">{t.mcqTypeOX}</option>
              <option value="4">{t.mcqType4}</option>
              <option value="5">{t.mcqType5}</option>
            </select>
          </div>

          {/* 2. 객관식 문항 수 선택 */}
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1">{t.obj}</label>
            <input type="number" min="0" max="20" className="w-full border p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={objCount} onChange={(e) => setObjCount(Number(e.target.value))} />
          </div>

          {/* 3. 주관식 문항 수 선택 */}
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1">{t.subj}</label>
            <input type="number" min="0" max="10" className="w-full border p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={subjCount} onChange={(e) => setSubjCount(Number(e.target.value))} />
          </div>
        </div>
      </div>

      <button onClick={handleGenerate} disabled={isLoading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 cursor-pointer flex justify-center items-center gap-2">
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            {t.loading}
          </>
        ) : (
          t.btn.replace('{n}', (objCount + subjCount).toString())
        )}
      </button>

      {/* 설문 생성 완료 후 공유 패널 및 미리보기 */}
      {surveyData.length > 0 && (
        <div className="mt-8 pt-8 border-t border-gray-200">
          
          {/* 링크 및 QR 배포 영역 */}
          <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
            <h2 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-blue-600"/>
              {t.shareTitle}
            </h2>
            
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div ref={qrRef} className="bg-white p-3 rounded-lg shadow-sm border border-blue-200 flex flex-col items-center">
                <QRCodeCanvas value={shareUrl} size={130} level={"H"} includeMargin={true} />
                <button 
                  onClick={handleDownloadQR} 
                  className="mt-2 text-xs text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5"/> {t.downloadQr}
                </button>
              </div>

              <div className="flex-1 w-full space-y-3">
                <p className="text-xs text-blue-700 leading-relaxed">
                  설문 링크를 복사하여 공유하거나, QR 코드를 다운로드하여 모바일 참여를 유도해 보세요.
                </p>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={shareUrl} 
                    className="w-full bg-white border border-blue-200 rounded-lg px-3 py-2 text-xs text-gray-600 outline-none"
                  />
                  <button 
                    onClick={handleCopyLink}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    {isCopied ? <Check className="w-4 h-4"/> : <Copy className="w-4 h-4"/>}
                    {isCopied ? t.copied : t.copyLink}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-4">{t.preview}</h2>
          <div className="space-y-6">
            {surveyData.map((item, index) => (
              <div key={index} className="bg-gray-50 p-5 rounded-lg border border-gray-200 shadow-sm">
                <p className="font-semibold text-gray-800 mb-4 flex items-start gap-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                    {item.type === 'radio' ? t.obj : t.subj}
                  </span>
                  <span className="pt-0.5">Q{index + 1}. {item.question}</span>
                </p>
                {item.type === 'radio' && item.options && (
                  <div className="space-y-3 mt-4 ml-2">
                    {item.options.map((opt: string, i: number) => (
                      <label key={i} className="flex items-center space-x-3 text-sm text-gray-700 cursor-pointer p-2 hover:bg-white rounded border border-transparent hover:border-gray-200 transition">
                        <input type="radio" name={`q${index}`} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
                {item.type === 'textarea' && (
                  <div className="mt-4">
                     <textarea className="w-full border border-gray-300 bg-white rounded-lg p-3 h-28 text-sm outline-none resize-none" disabled></textarea>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreateMode1() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-8 font-sans">
      <Suspense fallback={<div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}>
        <Mode1Content />
      </Suspense>
    </div>
  );
}