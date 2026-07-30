'use client';

import { useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Copy, Check, QrCode, Download } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { supabase } from '@/lib/supabase';
import { SURVEY_MODES } from '../../components/constants';


const TEXTS: Record<string, any> = {
  ko: { 
    back: "메인으로 돌아가기", title: "텍스트 초안 입력으로 생성", text: "설문 초안 내용", textPh: "질문 리스트나 관련 자료를 자유롭게 붙여넣어 주세요.", objType: "객관식 유형", typeOX: "O/X형", type4: "4지 선다형", type5: "5지 선다형", obj: "객관식 문항 수", subj: "주관식 문항 수", btn: "총 {n}문항 설문지 생성하기", loading: "텍스트 분석 및 생성 중...", alert1: "설문 초안 텍스트를 입력해주세요.", alert2: "최소 1개 이상의 문항 수를 설정해주세요.", preview: "📋 생성된 설문지 미리보기", 
    shareTitle: "🚀 설문지 공유 및 배포", copyLink: "설문 링크 복사", copied: "링크 복사 완료!", downloadQr: "QR 코드 이미지 다운로드" 
  },
  en: { 
    back: "Back to Main", title: "Generate via Text Input", text: "Draft Content", textPh: "Paste your question list or reference material here.", objType: "MCQ Type", typeOX: "True/False (O/X)", type4: "4 Choices", type5: "5 Choices", obj: "Multiple Choice", subj: "Open-ended", btn: "Generate {n} Questions", loading: "Analyzing and Generating...", alert1: "Please enter text.", alert2: "Set at least 1 question.", preview: "📋 Survey Preview", 
    shareTitle: "🚀 Share & Distribute Survey", copyLink: "Copy Survey Link", copied: "Copied!", downloadQr: "Download QR Code" 
  },
  ja: { back: "メインに戻る", title: "テキスト入力で作成", text: "草案の内容", textPh: "質問リストや関連資料を自由に貼り付けてください。", objType: "選択式の種類", typeOX: "マルバツ(O/X)", type4: "4択", type5: "5択", obj: "選択式 設問数", subj: "記述式 設問数", btn: "計{n}問のアンケートを作成", loading: "テキスト分析・作成中...", alert1: "テキストを入力してください。", alert2: "1問以上設定してください。", preview: "📋 プレビュー", shareTitle: "🚀 アンケート共有", copyLink: "リンクをコピー", copied: "コピー完了!", downloadQr: "QRコードをダウンロード" },
  zh: { back: "返回主页", title: "通过文本输入生成", text: "问卷草稿", textPh: "请粘贴问题列表或相关资料。", objType: "客观题类型", typeOX: "判断题(O/X)", type4: "4个选项", type5: "5个选项", obj: "客观题数量", subj: "主观题数量", btn: "生成 {n} 道题", loading: "分析及生成中...", alert1: "请输入草稿文本。", alert2: "请至少设置1个问题。", preview: "📋 问卷预览", shareTitle: "🚀 分享问卷", copyLink: "复制问卷链接", copied: "已复制!", downloadQr: "下载二维码" },
  vi: { back: "Quay lại", title: "Tạo qua Văn bản", text: "Nội dung dự thảo", textPh: "Dán danh sách câu hỏi hoặc tài liệu tại đây.", objType: "Loại trắc nghiệm", typeOX: "Đúng/Sai (O/X)", type4: "4 Lựa chọn", type5: "5 Lựa chọn", obj: "Trắc nghiệm", subj: "Tự luận", btn: "Tạo {n} câu hỏi", loading: "Đang phân tích...", alert1: "Vui lòng nhập văn bản.", alert2: "Đặt ít nhất 1 câu.", preview: "📋 Xem trước", shareTitle: "🚀 Chia sẻ khảo sát", copyLink: "Sao chép liên kết", copied: "Đã sao chép!", downloadQr: "Tải mã QR" },
  es: { back: "Volver", title: "Generar vía Texto", text: "Borrador", textPh: "Pegue su lista de preguntas o material aquí.", objType: "Tipo de opción múltiple", typeOX: "Verdadero/Falso", type4: "4 Opciones", type5: "5 Opciones", obj: "Opción Múltiple", subj: "Abierta", btn: "Generar {n} preguntas", loading: "Analizando...", alert1: "Ingrese texto.", alert2: "Mínimo 1 pregunta.", preview: "📋 Vista Previa", shareTitle: "🚀 Compartir encuesta", copyLink: "Copiar enlace", copied: "¡Copiado!", downloadQr: "Descargar código QR" },
  fr: { back: "Retour", title: "Générer via Texte", text: "Brouillon", textPh: "Collez votre texte ou matériel ici.", objType: "Type de choix multiple", typeOX: "Vrai/Faux", type4: "4 Choix", type5: "5 Choix", obj: "Choix Multiple", subj: "Ouverte", btn: "Générer {n} questions", loading: "Analyse...", alert1: "Veuillez entrer du texte.", alert2: "Minimum 1 question.", preview: "📋 Aperçu", shareTitle: "🚀 Partager le sondage", copyLink: "Copier le lien", copied: "Copié !", downloadQr: "Télécharger le QR code" },
  de: { back: "Zurück", title: "Über Texteingabe generieren", text: "Entwurf", textPh: "Fügen Sie hier Ihren Text ein.", objType: "Multiple-Choice-Typ", typeOX: "Wahr/Falsch", type4: "4 Optionen", type5: "5 Optionen", obj: "Multiple Choice", subj: "Offen", btn: "{n} Fragen generieren", loading: "Analysieren...", alert1: "Bitte Text eingeben.", alert2: "Mindestens 1 Frage.", preview: "📋 Vorschau", shareTitle: "🚀 Umfrage teilen", copyLink: "Link kopieren", copied: "Kopiert!", downloadQr: "QR-Code herunterladen" },
  ru: { back: "На главную", title: "Генерация из текста", text: "Черновик", textPh: "Вставьте ваш текст здесь.", objType: "Тип теста", typeOX: "Да/Нет (O/X)", type4: "4 варианта", type5: "5 вариантов", obj: "Тест", subj: "Открытый", btn: "Создать {n} вопросов", loading: "Анализ...", alert1: "Введите текст.", alert2: "Минимум 1 вопрос.", preview: "📋 Предпросмотр", shareTitle: "🚀 Поделиться опросом", copyLink: "Копировать ссылку", copied: "Скопировано!", downloadQr: "Скачать QR-код" },
  ar: { back: "العودة", title: "توليد من النص", text: "المسودة", textPh: "الصق النص هنا.", objType: "نوع الخيارات", typeOX: "صح/خطأ", type4: "4 خيارات", type5: "5 خيارات", obj: "خيارات", subj: "مقالي", btn: "توليد {n} أسئلة", loading: "جاري التحليل...", alert1: "أدخل النص.", alert2: "سؤال واحد على الأقل.", preview: "📋 معاينة", shareTitle: "🚀 مشاركة الاستطلاع", copyLink: "نسخ الرابط", copied: "تم النسخ!", downloadQr: "تحميل رمز الاستجابة السريعة" },
  pt: { back: "Voltar", title: "Gerar via Texto", text: "Rascunho", textPh: "Cole o material aqui.", objType: "Tipo de múltipla escolha", typeOX: "Verdadeiro/Falso", type4: "4 Opções", type5: "5 Opções", obj: "Múltipla Escolha", subj: "Aberta", btn: "Gerar {n} Questões", loading: "Analisando...", alert1: "Insira texto.", alert2: "Mínimo de 1.", preview: "📋 Pré-visualização", shareTitle: "🚀 Compartilhar pesquisa", copyLink: "Copiar link", copied: "Copiado!", downloadQr: "Baixar QR Code" },
  id: { back: "Kembali", title: "Buat via Teks", text: "Draf", textPh: "Tempel materi Anda di sini.", objType: "Jenis Pilihan Ganda", typeOX: "Benar/Salah (O/X)", type4: "4 Pilihan", type5: "5 Pilihan", obj: "Pilihan Ganda", subj: "Esai", btn: "Buat {n} Pertanyaan", loading: "Menganalisis...", alert1: "Masukkan teks.", alert2: "Minimal 1 pertanyaan.", preview: "📋 Pratinjau", shareTitle: "🚀 Bagikan Survei", copyLink: "Salin Tautan", copied: "Disalin!", downloadQr: "Unduh Kode QR" },
  hi: { back: "वापस", title: "टेक्स्ट द्वारा बनाएं", text: "प्रारूप", textPh: "अपना टेक्स्ट यहाँ पेस्ट करें।", objType: "बहुविकल्पीय प्रकार", typeOX: "सही/गलत (O/X)", type4: "4 विकल्प", type5: "5 विकल्प", obj: "बहुविकल्पीय", subj: "निबंध", btn: "{n} प्रश्न बनाएं", loading: "विश्लेषण...", alert1: "टेक्स्ट दर्ज करें।", alert2: "न्यूनतम 1 प्रश्न।", preview: "📋 पूर्वावलोकन", shareTitle: "🚀 सर्वेक्षण साझा करें", copyLink: "लिंक कॉपी करें", copied: "कॉपी किया गया!", downloadQr: "QR कोड डाउनलोड करें" },
  th: { back: "กลับ", title: "สร้างจากข้อความ", text: "ร่างข้อความ", textPh: "วางข้อความที่นี่", objType: "ประเภทปรนัย", typeOX: "ถูก/ผิด (O/X)", type4: "4 ตัวเลือก", type5: "5 ตัวเลือก", obj: "ปรนัย", subj: "อัตนัย", btn: "สร้าง {n} คำถาม", loading: "กำลังวิเคราะห์...", alert1: "กรุณาใส่ข้อความ", alert2: "อย่างน้อย 1 คำถาม", preview: "📋 ตัวอย่าง", shareTitle: "🚀 แชร์แบบสอบถาม", copyLink: "คัดลอกลิงก์", copied: "คัดลอกแล้ว!", downloadQr: "ดาวน์โหลด QR Code" },
  fil: { back: "Bumalik", title: "Bumuo sa Teksto", text: "Draft", textPh: "I-paste ang teksto rito.", objType: "Uri ng Multiple Choice", typeOX: "Tama/Mali (O/X)", type4: "4 Pagpipilian", type5: "5 Pagpipilian", obj: "Multiple Choice", subj: "Essay", btn: "Bumuo ng {n} Tanong", loading: "Sinusuri...", alert1: "Ilagay ang teksto.", alert2: "Kahit 1 tanong.", preview: "📋 Preview", shareTitle: "🚀 Ibahagi ang Survey", copyLink: "Kopyahin ang Link", copied: "Nakopya!", downloadQr: "I-download ang QR Code" },
  tr: { back: "Geri", title: "Metin ile Oluştur", text: "Taslak", textPh: "Metni buraya yapıştırın.", objType: "Seçmeli Türü", typeOX: "Doğru/Yanlış", type4: "4 Seçenek", type5: "5 Seçenek", obj: "Seçmeli", subj: "Açık Uçlu", btn: "{n} Soru Oluştur", loading: "Analiz ediliyor...", alert1: "Metin girin.", alert2: "En az 1 soru.", preview: "📋 Önizleme", shareTitle: "🚀 Anketi Paylaş", copyLink: "Bağlantıyı Kopyala", copied: "Kopylandı!", downloadQr: "QR Kodunu İndir" },
  it: { back: "Indietro", title: "Genera da Testo", text: "Bozza", textPh: "Incolla il testo qui.", objType: "Tipo di scelta multipla", typeOX: "Vero/Falso", type4: "4 Opzioni", type5: "5 Opzioni", obj: "Scelta Multipla", subj: "Aperta", btn: "Genera {n} Domande", loading: "Analisi...", alert1: "Inserisci testo.", alert2: "Minimo 1 domanda.", preview: "📋 Anteprima", shareTitle: "🚀 Condividi Sondaggio", copyLink: "Copia Link", copied: "Copiato!", downloadQr: "Scarica Codice QR" },
  nl: { back: "Terug", title: "Genereren via Tekst", text: "Concept", textPh: "Plak tekst hier.", objType: "Meerkeuze type", typeOX: "Waar/Onwaar", type4: "4 Keuzes", type5: "5 Keuzes", obj: "Meerkeuze", subj: "Open", btn: "Genereer {n} Vragen", loading: "Analyseren...", alert1: "Voer tekst in.", alert2: "Minimaal 1 vraag.", preview: "📋 Voorbeeld", shareTitle: "🚀 Enquête Delen", copyLink: "Link Kopiëren", copied: "Gekopieerd!", downloadQr: "QR-code Downloaden" },
  uk: { back: "Назад", title: "Створення з тексту", text: "Чернетка", textPh: "Вставте текст тут.", objType: "Тип тесту", typeOX: "Так/Ні (O/X)", type4: "4 варіанти", type5: "5 варіантів", obj: "Тестові", subj: "Відкриті", btn: "Створити {n} питань", loading: "Аналіз...", alert1: "Введіть текст.", alert2: "Мінімум 1 питання.", preview: "📋 Перегляд", shareTitle: "🚀 Поділитися опитуванням", copyLink: "Копіювати посилання", copied: "Скопійовано!", downloadQr: "Завантажити QR-код" },
  ms: { back: "Kembali", title: "Jana via Teks", text: "Draf", textPh: "Tampal teks di sini.", objType: "Jenis Aneka Pilihan", typeOX: "Betul/Salah (O/X)", type4: "4 Pilihan", type5: "5 Pilihan", obj: "Aneka Pilihan", subj: "Esei", btn: "Jana {n} Soalan", loading: "Menganalisis...", alert1: "Masukkan teks.", alert2: "Minimum 1 soalan.", preview: "📋 Pratonton", shareTitle: "🚀 Kongsi Tinjauan", copyLink: "Salin Pautan", copied: "Disalin!", downloadQr: "Muat Turun Kod QR" }
};


function Mode2Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lang = searchParams.get('lang') || 'ko';
  const t = TEXTS[lang] || TEXTS['ko'];

  const [draftText, setDraftText] = useState('');
  const [objType, setObjType] = useState('4');
  const [objCount, setObjCount] = useState(3);
  const [subjCount, setSubjCount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [surveyData, setSurveyData] = useState<any[]>([]);
  const [isCopied, setIsCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [surveyId, setSurveyId] = useState('');

  const qrRef = useRef<HTMLDivElement>(null);

  const generateUniqueId = () => {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 12);
  };

  // ★ 핵심: 생성 + DB 저장 + URL/QR 생성
  const handleGenerate = async () => {
    if (!draftText || !draftText.trim()) return alert(t.alert1);
    if (objCount + subjCount === 0) return alert(t.alert2);

    setIsLoading(true);
    setSurveyData([]);
    setShareUrl('');
    setSurveyId('');

    try {
      const response = await fetch('/api/generate-survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftText,
          mcqCount: objCount,
          mcqType: objType,
          subjectiveCount: subjCount,
          lang
        })
      });

      const result = await response.json();

      if (result.success && result.data?.questions) {
        const formatted = result.data.questions.map((q: any) => ({
          type: q.type === 'mcq' ? 'radio' : 'textarea',
          question: q.question,
          options: q.options || []
        }));

        const newId = generateUniqueId();

        // ★ 실제 테이블 구조에 맞춘 저장
        // topic/target은 텍스트 모드이므로 초안 일부로 대체
        const shortTopic = draftText.trim().slice(0, 50) + (draftText.length > 50 ? '...' : '');

        const { error } = await supabase.from('surveys').insert({
          id: newId,
          topic: shortTopic || 'Text Draft Survey',
          target: 'Text Input',
          lang,
          questions: formatted,
          mcq_type: objType,        // 'ox' | '4' | '5'
          is_public: true,
        });

        if (error) {
          console.error('Supabase 저장 오류:', error);
          alert(t.errServer || '저장 중 오류가 발생했습니다.');
          return;
        }

        setSurveyId(newId);
        setSurveyData(formatted);

        // ★ 모드 2 URL 생성
        try {
          const base = SURVEY_MODES.textCreate;
          const urlObject = new URL(base.url);

          // /text-create → /text-create/s/{id}
          let path = urlObject.pathname.replace(/\/$/, '');
          urlObject.pathname = `${path}/s/${newId}`;
          urlObject.searchParams.set('lang', lang);

          setShareUrl(urlObject.toString());
        } catch (err) {
          console.error('URL 생성 오류:', err);
          setShareUrl(`https://ai-survey-platform-chi.vercel.app/text-create/s/${newId}?lang=${lang}`);
        }
      } else {
        alert(t.errGenerate || '생성 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error(err);
      alert(t.errServer || '서버 통신 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // ★ 반드시 handleGenerate 바깥에 위치
  const handleCopyLink = () => {
    if (!shareUrl) return;
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
    link.download = `survey-qr-${surveyId || 'code'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-2xl w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <button
        onClick={() => router.push('/')}
        className="text-gray-500 mb-6 text-sm hover:text-gray-800 flex items-center gap-2"
      >
        &larr; {t.back}
      </button>
      <h1 className="text-2xl font-bold text-emerald-900 mb-6">{t.title}</h1>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">{t.text}</label>
        <textarea
          placeholder={t.textPh}
          className="w-full border p-3 rounded-lg h-40 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-1">{t.objType}</label>
          <select
            className="w-full border p-2 rounded-lg bg-white outline-none focus:ring-2 focus:ring-emerald-500"
            value={objType}
            onChange={(e) => setObjType(e.target.value)}
          >
            <option value="ox">{t.typeOX}</option>
            <option value="4">{t.type4}</option>
            <option value="5">{t.type5}</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-1">{t.obj}</label>
          <input
            type="number"
            min="0"
            max="20"
            className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            value={objCount}
            onChange={(e) => setObjCount(Number(e.target.value))}
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-1">{t.subj}</label>
          <input
            type="number"
            min="0"
            max="10"
            className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            value={subjCount}
            onChange={(e) => setSubjCount(Number(e.target.value))}
          />
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={isLoading}
        className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 transition disabled:bg-gray-400 cursor-pointer flex justify-center items-center gap-2"
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

      {surveyData.length > 0 && (
        <div className="mt-8 pt-8 border-t border-gray-200">
          {/* 공유 & QR 영역 */}
          <div className="mb-8 p-6 bg-emerald-50 rounded-xl border border-emerald-100">
            <h2 className="text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-600" />
              {t.shareTitle}
            </h2>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div
                ref={qrRef}
                className="bg-white p-3 rounded-lg shadow-sm border border-emerald-200 flex flex-col items-center"
              >
                <QRCodeCanvas value={shareUrl} size={130} level={"H"} includeMargin={true} />
                <button
                  onClick={handleDownloadQR}
                  className="mt-2 text-xs text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> {t.downloadQr}
                </button>
              </div>

              <div className="flex-1 w-full space-y-3">
                <p className="text-xs text-emerald-700 leading-relaxed">
                  설문 링크를 복사하여 공유하거나, QR 코드를 다운로드하여 모바일 참여를 유도해 보세요.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="w-full bg-white border border-emerald-200 rounded-lg px-3 py-2 text-xs text-gray-600 outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {isCopied ? t.copied : t.copyLink}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 미리보기 */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t.preview}</h2>
          <div className="space-y-6">
            {surveyData.map((item, index) => (
              <div key={index} className="bg-gray-50 p-5 rounded-lg border border-gray-200 shadow-sm">
                <p className="font-semibold text-gray-800 mb-4 flex items-start gap-2">
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                    {item.type === 'radio' ? t.obj : t.subj}
                  </span>
                  <span className="pt-0.5">
                    Q{index + 1}. {item.question}
                  </span>
                </p>
                {item.type === 'radio' && item.options && (
                  <div className="space-y-3 mt-4 ml-2">
                    {item.options.map((opt: string, i: number) => (
                      <label
                        key={i}
                        className="flex items-center space-x-3 text-sm text-gray-700 cursor-pointer p-2 hover:bg-white rounded border border-transparent hover:border-gray-200 transition"
                      >
                        <input
                          type="radio"
                          name={`q${index}`}
                          className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
                {item.type === 'textarea' && (
                  <div className="mt-4">
                    <textarea
                      className="w-full border border-gray-300 bg-white rounded-lg p-3 h-28 text-sm outline-none resize-none"
                      placeholder="답변을 입력해주세요..."
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 하단 복사 + 제출 버튼 */}
          <div className="mt-8 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-4">
            <div className="w-full flex items-center justify-between bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
              <span className="text-sm text-gray-600 truncate mr-2">{shareUrl}</span>
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap cursor-pointer"
              >
                {t.copyLink}
              </button>
            </div>

            <button
              onClick={() => alert('설문이 성공적으로 제출되었습니다.')}
              className="w-full py-4 bg-emerald-600 text-white font-bold text-base rounded-xl hover:bg-emerald-700 transition-colors shadow-md cursor-pointer"
            >
              제출하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreateMode2() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-8 font-sans">
      <Suspense fallback={<div>Loading...</div>}>
        <Mode2Content />
      </Suspense>
    </div>
  );
}