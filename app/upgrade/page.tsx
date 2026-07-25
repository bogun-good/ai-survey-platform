'use client';

import { useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UploadCloud, AlertCircle, Copy, Check, QrCode, Download } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

// 지원 파일 형식 문구를 'Hwp, Doc, PDF'로 통일
const TEXTS: Record<string, any> = {
  ko: { 
    back: "메인으로 돌아가기", title: "문서 파일(Hwp, Doc, PDF) 업로드 변환", filePh: "클릭하여 문서를 첨부하세요 (Hwp, Doc, PDF)", 
    topicLabel: "퀴즈/설문 주제", topicPh: "예: 파일 내용 기반 핵심 개념 확인",
    targetLabel: "대상", targetPh: "예: 중학교 1학년",
    obj: "객관식 문항 수", mcqTypeLabel: "객관식 유형", mcqTypeOX: "O/X형", mcqType4: "4지 선다형", mcqType5: "5지 선다형",
    subj: "주관식 문항 수", btn: "총 {n}문항 설문지 생성하기", loading: "문서 분석 및 설문지 생성 중...", 
    alertTopic: "주제를 입력해주세요.", alertTarget: "대상을 입력해주세요.",
    alert1: "변환할 파일을 업로드해주세요.", alert2: "최소 1개 이상의 문항 수를 설정해주세요.", 
    apiError: "문서를 처리하는 중 오류가 발생했습니다. 지원되는 파일 형식인지 확인해주세요.",
    preview: "📋 생성된 설문지 미리보기", shareTitle: "🚀 설문지 공유 및 배포",
    copyLink: "설문 링크 복사", copied: "링크 복사 완료!", downloadQr: "QR 코드 이미지 다운로드",
    qObj: "[객관식]", qSubj: "[주관식]"
  },
  en: { 
    back: "Back to Main", title: "Document File (Hwp, Doc, PDF) Conversion", filePh: "Click to attach document (Hwp, Doc, PDF)", 
    topicLabel: "Quiz/Survey Topic", topicPh: "e.g., Key concepts from the file",
    targetLabel: "Target Audience", targetPh: "e.g., 7th Grade Students",
    obj: "Multiple Choice", mcqTypeLabel: "MCQ Type", mcqTypeOX: "True/False (O/X)", mcqType4: "4 Options", mcqType5: "5 Options",
    subj: "Open-ended", btn: "Generate {n} Questions", loading: "Analyzing & Generating...", 
    alertTopic: "Please enter a topic.", alertTarget: "Please enter a target audience.",
    alert1: "Please upload a file.", alert2: "Set at least 1 question.", 
    apiError: "Error processing document. Please check if format is supported.",
    preview: "📋 Survey Preview", shareTitle: "🚀 Share & Distribute Survey",
    copyLink: "Copy Survey Link", copied: "Copied!", downloadQr: "Download QR Code",
    qObj: "[Multiple Choice]", qSubj: "[Open-ended]"
  },
  ja: { 
    back: "メインに戻る", title: "文書ファイル(Hwp, Doc, PDF)変換", filePh: "クリックして文書を添付 (Hwp, Doc, PDF)", 
    topicLabel: "クイズ/アンケートのテーマ", topicPh: "例: ファイルに基づく主要概念の確認",
    targetLabel: "対象", targetPh: "例: 中学1年生",
    obj: "選択式", mcqTypeLabel: "選択式の種類", mcqTypeOX: "マルバツ (O/X)", mcqType4: "4択", mcqType5: "5択",
    subj: "記述式", btn: "計{n}問作成", loading: "スキャン・作成中...", 
    alertTopic: "テーマを入力してください。", alertTarget: "対象を入力してください。",
    alert1: "ファイルをアップロードしてください。", alert2: "1問以上設定してください。", apiError: "エラーが発生しました。", 
    preview: "📋 プレビュー", shareTitle: "🚀 アンケート共有", copyLink: "リンクをコピー", copied: "コピー完了!", downloadQr: "QRコードをダウンロード", qObj: "[選択式]", qSubj: "[記述式]" 
  },
  zh: { 
    back: "返回主页", title: "上传文档 (Hwp, Doc, PDF) 转换", filePh: "点击上传文档 (支持 Hwp, Doc, PDF)", 
    topicLabel: "测验/问卷主题", topicPh: "例如: 基于附件内容的核心概念",
    targetLabel: "目标受众", targetPh: "例如: 初一学生",
    obj: "客观题", mcqTypeLabel: "题型选项", mcqTypeOX: "判断题 (O/X)", mcqType4: "4个选项", mcqType5: "5个选项",
    subj: "主观题", btn: "生成 {n} 道题", loading: "扫描生成中...", 
    alertTopic: "请输入主题。", alertTarget: "请输入目标受众。",
    alert1: "请上传文件。", alert2: "至少设置1题。", apiError: "处理文档时出错。", 
    preview: "📋 问卷预览", shareTitle: "🚀 分享问卷", copyLink: "复制问卷链接", copied: "已复制!", downloadQr: "下载二维码", qObj: "[客观题]", qSubj: "[主观题]" 
  },
  vi: { 
    back: "Quay lại", title: "Chuyển đổi tài liệu (Hwp, Doc, PDF)", filePh: "Nhấp để đính kèm tài liệu (Hwp, Doc, PDF)", 
    topicLabel: "Chủ đề", topicPh: "Vd: Các khái niệm chính", targetLabel: "Đối tượng", targetPh: "Vd: Học sinh lớp 7",
    obj: "Trắc nghiệm", mcqTypeLabel: "Loại trắc nghiệm", mcqTypeOX: "Đúng/Sai (O/X)", mcqType4: "4 lựa chọn", mcqType5: "5 lựa chọn",
    subj: "Tự luận", btn: "Tạo {n} câu hỏi", loading: "Đang tạo...", alertTopic: "Nhập chủ đề.", alertTarget: "Nhập đối tượng.",
    alert1: "Tải file lên.", alert2: "Đặt ít nhất 1 câu.", apiError: "Lỗi xử lý.", preview: "Xem trước", shareTitle: "Chia sẻ", 
    copyLink: "Sao chép liên kết", copied: "Đã sao chép!", downloadQr: "Tải QR", qObj: "[Trắc nghiệm]", qSubj: "[Tự luận]"
  },
  es: { 
    back: "Volver", title: "Conversión de Documentos (Hwp, Doc, PDF)", filePh: "Clic para adjuntar (Hwp, Doc, PDF)", 
    topicLabel: "Tema", topicPh: "Ej: Conceptos clave", targetLabel: "Audiencia", targetPh: "Ej: Estudiantes",
    obj: "Opción múltiple", mcqTypeLabel: "Tipo de opciones", mcqTypeOX: "Verdadero/Falso (O/X)", mcqType4: "4 Opciones", mcqType5: "5 Opciones",
    subj: "Abiertas", btn: "Generar {n} preguntas", loading: "Generando...", alertTopic: "Ingrese un tema.", alertTarget: "Ingrese audiencia.",
    alert1: "Suba un archivo.", alert2: "Mínimo 1 pregunta.", apiError: "Error de procesamiento.", preview: "Vista previa", 
    shareTitle: "Compartir", copyLink: "Copiar enlace", copied: "¡Copiado!", downloadQr: "Descargar QR", qObj: "[Opción múltiple]", qSubj: "[Abierta]"
  },
  fr: { 
    back: "Retour", title: "Conversion de documents (Hwp, Doc, PDF)", filePh: "Cliquez pour joindre (Hwp, Doc, PDF)", 
    topicLabel: "Sujet", topicPh: "Ex: Concepts clés", targetLabel: "Public cible", targetPh: "Ex: Étudiants",
    obj: "Choix multiple", mcqTypeLabel: "Type de QCM", mcqTypeOX: "Vrai/Faux (O/X)", mcqType4: "4 Options", mcqType5: "5 Options",
    subj: "Ouverte", btn: "Générer {n} questions", loading: "Génération...", alertTopic: "Entrez un sujet.", alertTarget: "Entrez le public.",
    alert1: "Téléchargez un fichier.", alert2: "Minimum 1 question.", apiError: "Erreur.", preview: "Aperçu", 
    shareTitle: "Partager", copyLink: "Copier le lien", copied: "Copié !", downloadQr: "Télécharger QR", qObj: "[QCM]", qSubj: "[Ouverte]"
  },
  de: { 
    back: "Zurück", title: "Dokumentenkonvertierung (Hwp, Doc, PDF)", filePh: "Klicken zum Anhängen (Hwp, Doc, PDF)", 
    topicLabel: "Thema", topicPh: "Z.B.: Schlüsselkonzepte", targetLabel: "Zielgruppe", targetPh: "Z.B.: Studenten",
    obj: "Multiple Choice", mcqTypeLabel: "MC-Typ", mcqTypeOX: "Wahr/Falsch (O/X)", mcqType4: "4 Optionen", mcqType5: "5 Optionen",
    subj: "Offene Fragen", btn: "{n} Fragen generieren", loading: "Generiere...", alertTopic: "Thema eingeben.", alertTarget: "Zielgruppe eingeben.",
    alert1: "Datei hochladen.", alert2: "Mindestens 1 Frage.", apiError: "Fehler.", preview: "Vorschau", 
    shareTitle: "Teilen", copyLink: "Link kopieren", copied: "Kopiert!", downloadQr: "QR herunterladen", qObj: "[Multiple Choice]", qSubj: "[Offen]"
  },
  ru: { 
    back: "Назад", title: "Конвертация документов (Hwp, Doc, PDF)", filePh: "Нажмите, чтобы прикрепить (Hwp, Doc, PDF)", 
    topicLabel: "Тема", topicPh: "Например: Ключевые концепции", targetLabel: "Аудитория", targetPh: "Например: Студенты",
    obj: "Тест", mcqTypeLabel: "Тип теста", mcqTypeOX: "Правда/Ложь (O/X)", mcqType4: "4 Варианта", mcqType5: "5 Вариантов",
    subj: "Открытые", btn: "Создать {n} вопросов", loading: "Создание...", alertTopic: "Введите тему.", alertTarget: "Введите аудиторию.",
    alert1: "Загрузите файл.", alert2: "Минимум 1 вопрос.", apiError: "Ошибка.", preview: "Предпросмотр", 
    shareTitle: "Поделиться", copyLink: "Копировать ссылку", copied: "Скопировано!", downloadQr: "Скачать QR", qObj: "[Тест]", qSubj: "[Открытый]"
  },
  ar: { 
    back: "رجوع", title: "تحويل المستند (Hwp, Doc, PDF)", filePh: "انقر لإرفاق مستند (Hwp, Doc, PDF)", 
    topicLabel: "الموضوع", topicPh: "مثال: المفاهيم الرئيسية", targetLabel: "الجمهور", targetPh: "مثال: الطلاب",
    obj: "خيارات متعددة", mcqTypeLabel: "نوع الخيارات", mcqTypeOX: "صح/خطأ (O/X)", mcqType4: "4 خيارات", mcqType5: "5 خيارات",
    subj: "أسئلة مقالية", btn: "إنشاء {n} أسئلة", loading: "جاري الإنشاء...", alertTopic: "أدخل الموضوع.", alertTarget: "أدخل الجمهور.",
    alert1: "ارفع ملف.", alert2: "سؤال واحد على الأقل.", apiError: "حدث خطأ.", preview: "معاينة", 
    shareTitle: "مشاركة", copyLink: "نسخ الرابط", copied: "تم النسخ!", downloadQr: "تحميل QR", qObj: "[خيارات متعددة]", qSubj: "[مقالي]"
  },
  pt: { 
    back: "Voltar", title: "Conversão de Documentos (Hwp, Doc, PDF)", filePh: "Clique para anexar (Hwp, Doc, PDF)", 
    topicLabel: "Tópico", topicPh: "Ex: Conceitos chave", targetLabel: "Público", targetPh: "Ex: Alunos",
    obj: "Múltipla escolha", mcqTypeLabel: "Tipo de múltipla escolha", mcqTypeOX: "Verdadeiro/Falso (O/X)", mcqType4: "4 Opções", mcqType5: "5 Opções",
    subj: "Dissertativa", btn: "Gerar {n} perguntas", loading: "Gerando...", alertTopic: "Insira o tópico.", alertTarget: "Insira o público.",
    alert1: "Envie um arquivo.", alert2: "Mínimo de 1 pergunta.", apiError: "Erro.", preview: "Pré-visualização", 
    shareTitle: "Compartilhar", copyLink: "Copiar link", copied: "Copiado!", downloadQr: "Baixar QR", qObj: "[Múltipla escolha]", qSubj: "[Dissertativa]"
  },
  id: { 
    back: "Kembali", title: "Konversi Dokumen (Hwp, Doc, PDF)", filePh: "Klik untuk melampirkan dokumen (Hwp, Doc, PDF)", 
    topicLabel: "Topik", topicPh: "Contoh: Konsep utama", targetLabel: "Target", targetPh: "Contoh: Siswa",
    obj: "Pilihan ganda", mcqTypeLabel: "Tipe Pilihan Ganda", mcqTypeOX: "Benar/Salah (O/X)", mcqType4: "4 Pilihan", mcqType5: "5 Pilihan",
    subj: "Esai", btn: "Buat {n} pertanyaan", loading: "Membuat...", alertTopic: "Masukkan topik.", alertTarget: "Masukkan target.",
    alert1: "Unggah file.", alert2: "Minimal 1 pertanyaan.", apiError: "Terjadi kesalahan.", preview: "Pratinjau", 
    shareTitle: "Bagikan", copyLink: "Salin Tautan", copied: "Tersalin!", downloadQr: "Unduh QR", qObj: "[Pilihan Ganda]", qSubj: "[Esai]"
  },
  hi: { 
    back: "वापस", title: "दस्तावेज़ रूपांतरण (Hwp, Doc, PDF)", filePh: "दस्तावेज़ संलग्न करें (Hwp, Doc, PDF)", 
    topicLabel: "विषय", topicPh: "उदाहरण: मुख्य अवधारणाएं", targetLabel: "लक्षित दर्शक", targetPh: "उदाहरण: छात्र",
    obj: "बहुविकल्पीय", mcqTypeLabel: "विकल्प प्रकार", mcqTypeOX: "सही/गलत (O/X)", mcqType4: "4 विकल्प", mcqType5: "5 विकल्प",
    subj: "विषयपरक", btn: "{n} प्रश्न बनाएं", loading: "बन रहा है...", alertTopic: "विषय दर्ज करें।", alertTarget: "दर्शक दर्ज करें।",
    alert1: "फ़ाइल अपलोड करें।", alert2: "कम से कम 1 प्रश्न।", apiError: "त्रुटि।", preview: "पूर्वावलोकन", 
    shareTitle: "साझा करें", copyLink: "लिंक कॉपी करें", copied: "कॉपी किया गया!", downloadQr: "QR डाउनलोड करें", qObj: "[बहुविकल्पीय]", qSubj: "[विषयपरक]"
  },
  th: { 
    back: "กลับ", title: "แปลงไฟล์เอกสาร (Hwp, Doc, PDF)", filePh: "คลิกเพื่อแนบเอกสาร (Hwp, Doc, PDF)", 
    topicLabel: "หัวข้อ", topicPh: "เช่น: แนวคิดหลัก", targetLabel: "กลุ่มเป้าหมาย", targetPh: "เช่น: นักเรียน",
    obj: "ปรนัย", mcqTypeLabel: "ประเภทตัวเลือก", mcqTypeOX: "ถูก/ผิด (O/X)", mcqType4: "4 ตัวเลือก", mcqType5: "5 ตัวเลือก",
    subj: "อัตนัย", btn: "สร้าง {n} คำถาม", loading: "กำลังสร้าง...", alertTopic: "ป้อนหัวข้อ", alertTarget: "ป้อนกลุ่มเป้าหมาย",
    alert1: "อัปโหลดไฟล์", alert2: "อย่างน้อย 1 คำถาม", apiError: "เกิดข้อผิดพลาด", preview: "ดูตัวอย่าง", 
    shareTitle: "แชร์", copyLink: "คัดลอกลิงก์", copied: "คัดลอกแล้ว!", downloadQr: "ดาวน์โหลด QR", qObj: "[ปรนัย]", qSubj: "[อัตนัย]"
  },
  fil: { 
    back: "Bumalik", title: "Conversion ng Dokumento (Hwp, Doc, PDF)", filePh: "I-click para mag-attach (Hwp, Doc, PDF)", 
    topicLabel: "Paksa", topicPh: "Halimbawa: Pangunahing konsepto", targetLabel: "Audience", targetPh: "Halimbawa: Mga Estudyante",
    obj: "Multiple Choice", mcqTypeLabel: "Uri ng Multiple Choice", mcqTypeOX: "Tama/Mali (O/X)", mcqType4: "4 na Pagpipilian", mcqType5: "5 na Pagpipilian",
    subj: "Sanaysay", btn: "Bumuo ng {n} tanong", loading: "Binubuo...", alertTopic: "Ilagay ang paksa.", alertTarget: "Ilagay ang audience.",
    alert1: "Mag-upload ng file.", alert2: "Minimum na 1 tanong.", apiError: "Error.", preview: "Preview", 
    shareTitle: "Ibahagi", copyLink: "Kopyahin ang Link", copied: "Nakopya!", downloadQr: "I-download ang QR", qObj: "[Multiple Choice]", qSubj: "[Sanaysay]"
  },
  tr: { 
    back: "Geri", title: "Belge Dönüştürme (Hwp, Doc, PDF)", filePh: "Belge eklemek için tıklayın (Hwp, Doc, PDF)", 
    topicLabel: "Konu", topicPh: "Ör: Temel kavramlar", targetLabel: "Hedef Kitle", targetPh: "Ör: Öğrenciler",
    obj: "Çoktan Seçmeli", mcqTypeLabel: "Seçenek Türü", mcqTypeOX: "Doğru/Yanlış (O/X)", mcqType4: "4 Seçenekli", mcqType5: "5 Seçenekli",
    subj: "Açık Uçlu", btn: "{n} Soru Oluştur", loading: "Oluşturuluyor...", alertTopic: "Konu girin.", alertTarget: "Kitle girin.",
    alert1: "Dosya yükleyin.", alert2: "En az 1 soru.", apiError: "Hata oluştu.", preview: "Önizleme", 
    shareTitle: "Paylaş", copyLink: "Bağlantıyı Kopyala", copied: "Kopyerildi!", downloadQr: "QR İndir", qObj: "[Çoktan Seçmeli]", qSubj: "[Açık Uçlu]"
  },
  it: { 
    back: "Indietro", title: "Conversione Documento (Hwp, Doc, PDF)", filePh: "Clicca per allegare (Hwp, Doc, PDF)", 
    topicLabel: "Argomento", topicPh: "Es: Concetti chiave", targetLabel: "Destinatari", targetPh: "Es: Studenti",
    obj: "Scelta multipla", mcqTypeLabel: "Tipo di scelta multipla", mcqTypeOX: "Vero/Falso (O/X)", mcqType4: "4 Opzioni", mcqType5: "5 Opzioni",
    subj: "Aperte", btn: "Genera {n} domande", loading: "Generazione in corso...", alertTopic: "Inserisci argomento.", alertTarget: "Inserisci destinatari.",
    alert1: "Carica file.", alert2: "Minimo 1 domanda.", apiError: "Errore.", preview: "Anteprima", 
    shareTitle: "Condividi", copyLink: "Copia Link", copied: "Copiato!", downloadQr: "Scarica QR", qObj: "[Scelta multipla]", qSubj: "[Aperta]"
  },
  nl: { 
    back: "Terug", title: "Document Conversie (Hwp, Doc, PDF)", filePh: "Klik om bij te voegen (Hwp, Doc, PDF)", 
    topicLabel: "Onderwerp", topicPh: "Bijv: Kernconcepten", targetLabel: "Doelgroep", targetPh: "Bijv: Studenten",
    obj: "Meerkeuze", mcqTypeLabel: "Type Meerkeuze", mcqTypeOX: "Waar/Niet waar (O/X)", mcqType4: "4 Opties", mcqType5: "5 Opties",
    subj: "Open vragen", btn: "Genereer {n} vragen", loading: "Genereren...", alertTopic: "Voer een onderwerp in.", alertTarget: "Voer doelgroep in.",
    alert1: "Upload een bestand.", alert2: "Minimaal 1 vraag.", apiError: "Fout opgetreden.", preview: "Voorbeeld", 
    shareTitle: "Delen", copyLink: "Link kopiëren", copied: "Gekopieerd!", downloadQr: "Download QR", qObj: "[Meerkeuze]", qSubj: "[Open]"
  },
  uk: { 
    back: "Назад", title: "Конвертація документів (Hwp, Doc, PDF)", filePh: "Натисніть, щоб прикріпити (Hwp, Doc, PDF)", 
    topicLabel: "Тема", topicPh: "Наприклад: Ключові концепції", targetLabel: "Аудиторія", targetPh: "Наприклад: Студенти",
    obj: "Тест", mcqTypeLabel: "Тип тесту", mcqTypeOX: "Правда/Брехня (O/X)", mcqType4: "4 Варіанти", mcqType5: "5 Варіантів",
    subj: "Відкриті", btn: "Створити {n} питань", loading: "Створення...", alertTopic: "Введіть тему.", alertTarget: "Введіть аудиторію.",
    alert1: "Завантажте файл.", alert2: "Мінімум 1 питання.", apiError: "Помилка.", preview: "Попередній перегляд", 
    shareTitle: "Поділитися", copyLink: "Копіювати посилання", copied: "Скопійовано!", downloadQr: "Завантажити QR", qObj: "[Тест]", qSubj: "[Відкрите]"
  },
  ms: { 
    back: "Kembali", title: "Penukaran Dokumen (Hwp, Doc, PDF)", filePh: "Klik untuk melampirkan (Hwp, Doc, PDF)", 
    topicLabel: "Topik", topicPh: "Contoh: Konsep utama", targetLabel: "Sasaran", targetPh: "Contoh: Pelajar",
    obj: "Pilihan ganda", mcqTypeLabel: "Jenis Pilihan", mcqTypeOX: "Betul/Salah (O/X)", mcqType4: "4 Pilihan", mcqType5: "5 Pilihan",
    subj: "Esei", btn: "Jana {n} soalan", loading: "Menjana...", alertTopic: "Masukkan topik.", alertTarget: "Masukkan sasaran.",
    alert1: "Muat naik fail.", alert2: "Minimum 1 soalan.", apiError: "Ralat berlaku.", preview: "Pratonton", 
    shareTitle: "Kongsi", copyLink: "Salin Pautan", copied: "Disalin!", downloadQr: "Muat turun QR", qObj: "[Pilihan Ganda]", qSubj: "[Esei]"
  }
};

function Mode3Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lang = searchParams.get('lang') || 'ko';
  const t = TEXTS[lang] || TEXTS['en'];

  const [topic, setTopic] = useState('');
  const [target, setTarget] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  const [objCount, setObjCount] = useState(5);
  const [mcqType, setMcqType] = useState('4'); 
  const [subjCount, setSubjCount] = useState(2);
  
  const [isLoading, setIsLoading] = useState(false);
  const [surveyData, setSurveyData] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // 추가된 상태 및 함수
  const [isSubmitted, setIsSubmitted] = useState(false);                                                
  const handleSubmitSurvey = () => {
    alert("설문이 성공적으로 제출되었습니다!");
    setIsSubmitted(true);
  };

  const qrRef = useRef<HTMLDivElement>(null);
  
  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'http://localhost:3000';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setErrorMsg('');
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return alert(t.alertTopic);
    if (!target.trim()) return alert(t.alertTarget);
    if (!file) return alert(t.alert1);
    if (objCount + subjCount === 0) return alert(t.alert2);
    
    setIsLoading(true);
    setSurveyData([]);
    setErrorMsg('');
    
    try {
      const fileName = file.name.toLowerCase();
      let fileBase64 = '';
      let mimeType = 'text/plain';

      if (fileName.endsWith('.pdf')) {
        mimeType = 'application/pdf';
        fileBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = error => reject(error);
        });
      } else {
        const textContent = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsText(file, 'utf-8');
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
        });
        
        fileBase64 = btoa(unescape(encodeURIComponent(textContent)));
        mimeType = 'text/plain';
      }

      const response = await fetch('/api/generate-survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          target,
          fileBase64,
          mimeType,
          fileName: file.name,
          mcqCount: objCount,
          mcqType,
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
        throw new Error(result.error || 'Server error');
      }

    } catch (error) {
      console.error("Generation error:", error);
      setErrorMsg(t.apiError);
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
    <div className="max-w-2xl w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100 my-auto">
      <button onClick={() => router.push('/')} className="text-gray-500 mb-6 text-sm hover:text-gray-800 flex items-center gap-2">
        &larr; {t.back}
      </button>
      
      <h1 className="text-2xl font-bold text-violet-900 mb-6">{t.title}</h1>
      
      {/* 1. 주제 및 대상 입력 영역 */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-1">{t.topicLabel}</label>
          <input 
            type="text" 
            className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition" 
            placeholder={t.topicPh} 
            value={topic} 
            onChange={(e) => setTopic(e.target.value)} 
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-1">{t.targetLabel}</label>
          <input 
            type="text" 
            className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition" 
            placeholder={t.targetPh} 
            value={target} 
            onChange={(e) => setTarget(e.target.value)} 
          />
        </div>
      </div>

      {/* 2. 파일 업로드 영역 (문구 통일) */}
      <div className="mb-6">
        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-violet-300 rounded-lg cursor-pointer bg-violet-50 hover:bg-violet-100 transition">
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
            <UploadCloud className="w-10 h-10 text-violet-500 mb-3"/>
            <p className="mb-2 text-sm text-violet-700 font-semibold">{file ? file.name : t.filePh}</p>
            <p className="text-xs text-gray-400">지원 형식: Hwp, Doc, PDF (문서 파일)</p>
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept=".hwp,.doc,.docx,.pdf,application/pdf" 
            onChange={handleFileChange} 
          />
        </label>
      </div>

      {/* 3. 객관식 유형 -> 문항 수 -> 주관식 수 설정 영역 */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-1">{t.mcqTypeLabel}</label>
          <select 
            className="w-full border p-2 rounded-lg bg-white outline-none focus:ring-2 focus:ring-violet-500" 
            value={mcqType} 
            onChange={(e) => setMcqType(e.target.value)}
          >
            <option value="ox">{t.mcqTypeOX}</option>
            <option value="4">{t.mcqType4}</option>
            <option value="5">{t.mcqType5}</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-1">{t.obj}</label>
          <input type="number" min="0" className="w-full border p-2 rounded-lg" value={objCount} onChange={(e) => setObjCount(Number(e.target.value))} />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-1">{t.subj}</label>
          <input type="number" min="0" className="w-full border p-2 rounded-lg" value={subjCount} onChange={(e) => setSubjCount(Number(e.target.value))} />
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0"/>
          <p>{errorMsg}</p>
        </div>
      )}

      {/* 제출 버튼 항상 노출 및 조건 완화 (원할 경우 파일만 필수가 아니게 검증할 수도 있으나 기존 로직 유지) */}
      <button 
        onClick={handleGenerate} 
        disabled={isLoading} 
        className="w-full bg-violet-600 text-white font-bold py-3 rounded-lg hover:bg-violet-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            {t.loading}
          </>
        ) : (
          t.btn.replace('{n}', (objCount + subjCount).toString())
        )}
      </button>

      {/* 설문 생성 완료 후 공유 및 미리보기 영역 */}
      {surveyData.length > 0 && (
        <div className="mt-8 pt-8 border-t border-gray-200">
          
          <div className="mb-8 p-6 bg-violet-50 rounded-xl border border-violet-100">
            <h2 className="text-lg font-bold text-violet-900 mb-4 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-violet-600"/>
              {t.shareTitle}
            </h2>
            
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div ref={qrRef} className="bg-white p-3 rounded-lg shadow-sm border border-violet-200 flex flex-col items-center">
                <QRCodeCanvas value={shareUrl} size={130} level={"H"} includeMargin={true} />
                <button 
                  onClick={handleDownloadQR} 
                  className="mt-2 text-xs text-violet-700 hover:text-violet-900 font-semibold flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5"/> {t.downloadQr}
                </button>
              </div>

              <div className="flex-1 w-full space-y-3">
                <p className="text-xs text-violet-700 leading-relaxed">
                  생성된 설문 링크를 복사하여 메신저로 공유하거나, QR 코드를 다운로드하여 인쇄물에 삽입하세요.
                </p>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={shareUrl} 
                    className="w-full bg-white border border-violet-200 rounded-lg px-3 py-2 text-xs text-gray-600 outline-none"
                  />
                  <button 
                    onClick={handleCopyLink}
                    className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap"
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
              <div key={index} className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
                <p className="font-semibold text-gray-800 mb-4 flex items-start gap-2">
                  <span className="bg-violet-100 text-violet-800 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                    {item.type === 'radio' ? t.qObj : t.qSubj}
                  </span>
                  <span className="pt-0.5">Q{index + 1}. {item.question}</span>
                </p>
                
                {item.type === 'radio' && item.options && (
                  <div className="space-y-3 mt-4 ml-2">
                    {item.options.map((opt: string, i: number) => (
                      <label key={i} className="flex items-center space-x-3 text-sm text-gray-700 cursor-pointer p-2 hover:bg-white rounded border border-transparent hover:border-gray-200 transition">
                        <input type="radio" name={`q${index}`} className="w-4 h-4 text-violet-600 border-gray-300 focus:ring-violet-500" />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
                
                {item.type === 'textarea' && (
                  <div className="mt-4">
                    <textarea 
                      className="w-full border border-gray-300 rounded-lg p-3 h-28 text-sm bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none resize-none" 
                      placeholder="Type answer here..."
                      disabled
                    ></textarea>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 설문 미리보기 목록 끝난 직후에 추가된 제출 버튼 영역 */}
          <div className="mt-8">
            <button
              onClick={handleSubmitSurvey}
              disabled={isSubmitted}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition disabled:bg-gray-400"
            >
              {isSubmitted ? "제출 완료되었습니다." : "설문 응답 제출하기"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreateMode3() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <Suspense fallback={<div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>}>
        <Mode3Content/>
      </Suspense>
    </div>
  );
}