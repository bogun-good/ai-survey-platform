'use client';

import { useState, Suspense, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Copy, Check, QrCode, Download } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { supabase } from '@/lib/supabase';
import { SURVEY_MODES } from '../../components/constants';
const TEXTS: Record<string, any> = {
  ko: { 
    back: "메인으로 돌아가기", 
    title: "주제와 대상 입력으로 퀴즈&설문 자동 생성", 
    topic: "퀴즈&설문 주제", 
    topicPh: "예: 강의 만족도 조사", 
    target: "퀴즈&설문 대상", 
    targetPh: "예: 20~30대 직장인", 
    obj: "객관식 문항 수", 
    mcqTypeLabel: "객관식 유형", 
    mcqTypeOX: "O/X형", 
    mcqType4: "4지 선다형", 
    mcqType5: "5지 선다형",
    subj: "주관식 문항 수", 
    btn: "총 {n}문항 퀴즈&설문 생성하기", 
    loading: "AI가 맞춤형 퀴즈&설문을 생성 중입니다...", 
    alert1: "주제와 대상을 모두 입력해주세요.", 
    alert2: "최소 1개 이상의 문항 수를 설정해주세요.", 
    preview: "📋 생성된 퀴즈&설문지 미리보기", 
    shareTitle: "🚀 퀴즈&설문지 공유 및 배포", 
    copyLink: "퀴즈&설문 링크 복사", 
    copied: "링크 복사 완료!", 
    downloadQr: "QR 코드 이미지 다운로드",
    shareDesc: "퀴즈&설문 링크를 복사하여 공유하거나, QR 코드를 다운로드하여 모바일 참여를 유도해 보세요.",
    answerPh: "답변을 입력해주세요...",
    submitBtn: "제출하기",
    errGenerate: "퀴즈&설문 생성 중 오류가 발생했습니다.",
    errServer: "서버 통신 중 오류가 발생했습니다.",
    successSubmit: "퀴즈&설문이 성공적으로 제출되었습니다."
  },
  en: { 
    back: "Back to Main", 
    title: "Auto-Generate Quiz & Survey by Topic & Target", 
    topic: "Quiz & Survey Topic", 
    topicPh: "Ex: Lecture satisfaction survey", 
    target: "Target Audience", 
    targetPh: "Ex: Employees in their 20s-30s", 
    obj: "Multiple Choice", 
    mcqTypeLabel: "MCQ Type", 
    mcqTypeOX: "True/False (O/X)", 
    mcqType4: "4 Options", 
    mcqType5: "5 Options",
    subj: "Open-ended", 
    btn: "Generate {n}-Question Quiz & Survey", 
    loading: "AI is generating your custom quiz & survey...", 
    alert1: "Please enter both topic and target.", 
    alert2: "Set at least 1 question.", 
    preview: "📋 Generated Quiz & Survey Preview",
    shareTitle: "🚀 Share & Distribute Quiz & Survey", 
    copyLink: "Copy Quiz & Survey Link", 
    copied: "Copied!", 
    downloadQr: "Download QR Code",
    shareDesc: "Copy the quiz & survey link to share, or download the QR code to encourage mobile participation.",
    answerPh: "Please enter your answer...",
    submitBtn: "Submit",
    errGenerate: "An error occurred while generating the quiz & survey.",
    errServer: "A server communication error occurred.",
    successSubmit: "Quiz & survey submitted successfully."
  },
  ja: { 
    back: "メインに戻る", 
    title: "テーマと対象でクイズ＆アンケートを自動生成", 
    topic: "クイズ＆アンケートのテーマ", 
    topicPh: "例：講義の満足度調査", 
    target: "対象者", 
    targetPh: "例：20〜30代の会社員", 
    obj: "選択式 設問数", 
    mcqTypeLabel: "選択式の種類", 
    mcqTypeOX: "マルバツ (O/X)", 
    mcqType4: "4択", 
    mcqType5: "5択",
    subj: "記述式 設問数", 
    btn: "計{n}問のクイズ＆アンケートを作成", 
    loading: "AIがカスタムクイズ＆アンケートを作成中...", 
    alert1: "テーマと対象を入力してください。", 
    alert2: "1問以上設定してください。", 
    preview: "📋 生成されたクイズ＆アンケートのプレビュー", 
    shareTitle: "🚀 クイズ＆アンケートの共有と配布", 
    copyLink: "クイズ＆アンケートのリンクをコピー", 
    copied: "コピー完了!", 
    downloadQr: "QRコードをダウンロード",
    shareDesc: "クイズ＆アンケートのリンクをコピーして共有するか、QRコードをダウンロードしてモバイル参加を促しましょう。",
    answerPh: "回答を入力してください...",
    submitBtn: "提出する",
    errGenerate: "クイズ＆アンケートの生成中にエラーが発生しました。",
    errServer: "サーバー通信中にエラーが発生しました。",
    successSubmit: "クイズ＆アンケートが正常に提出されました。"
  },
  zh: { 
    back: "返回主页", 
    title: "按主题和对象自动生成测验&问卷", 
    topic: "测验&问卷主题", 
    topicPh: "例：课程满意度调查", 
    target: "调查对象", 
    targetPh: "例：20~30岁上班族", 
    obj: "客观题数量", 
    mcqTypeLabel: "题型选项", 
    mcqTypeOX: "判断题 (O/X)", 
    mcqType4: "4个选项", 
    mcqType5: "5个选项",
    subj: "主观题数量", 
    btn: "生成 {n} 道题的测验&问卷", 
    loading: "AI正在生成定制测验&问卷...", 
    alert1: "请填写主题和对象。", 
    alert2: "请至少设置1个问题。", 
    preview: "📋 生成的测验&问卷预览", 
    shareTitle: "🚀 分享与分发测验&问卷", 
    copyLink: "复制测验&问卷链接", 
    copied: "已复制!", 
    downloadQr: "下载二维码",
    shareDesc: "复制测验&问卷链接进行分享，或下载二维码以促进移动端参与。",
    answerPh: "请输入您的回答...",
    submitBtn: "提交",
    errGenerate: "生成测验&问卷时发生错误。",
    errServer: "服务器通信时发生错误。",
    successSubmit: "测验&问卷已成功提交。"
  },
  vi: { 
    back: "Quay lại", 
    title: "Tự động tạo Câu đố & Khảo sát theo Chủ đề & Đối tượng", 
    topic: "Chủ đề Câu đố & Khảo sát", 
    topicPh: "VD: Khảo sát mức độ hài lòng về bài giảng", 
    target: "Đối tượng", 
    targetPh: "VD: Nhân viên 20-30 tuổi", 
    obj: "Câu trắc nghiệm", 
    mcqTypeLabel: "Loại trắc nghiệm", 
    mcqTypeOX: "Đúng/Sai (O/X)", 
    mcqType4: "4 lựa chọn", 
    mcqType5: "5 lựa chọn",
    subj: "Câu tự luận", 
    btn: "Tạo Câu đố & Khảo sát {n} câu hỏi", 
    loading: "AI đang tạo Câu đố & Khảo sát tùy chỉnh...", 
    alert1: "Vui lòng nhập chủ đề và đối tượng.", 
    alert2: "Đặt ít nhất 1 câu hỏi.", 
    preview: "📋 Xem trước Câu đố & Khảo sát đã tạo", 
    shareTitle: "🚀 Chia sẻ & Phân phối Câu đố & Khảo sát", 
    copyLink: "Sao chép liên kết Câu đố & Khảo sát", 
    copied: "Đã sao chép!", 
    downloadQr: "Tải mã QR",
    shareDesc: "Sao chép liên kết Câu đố & Khảo sát để chia sẻ, hoặc tải mã QR để khuyến khích tham gia trên di động.",
    answerPh: "Vui lòng nhập câu trả lời của bạn...",
    submitBtn: "Gửi",
    errGenerate: "Đã xảy ra lỗi khi tạo Câu đố & Khảo sát.",
    errServer: "Đã xảy ra lỗi giao tiếp máy chủ.",
    successSubmit: "Câu đố & Khảo sát đã được gửi thành công."
  },
  es: { 
    back: "Volver al inicio", 
    title: "Generar Cuestionario & Encuesta por Tema y Público", 
    topic: "Tema del Cuestionario & Encuesta", 
    topicPh: "Ej: Encuesta de satisfacción de la clase", 
    target: "Público Objetivo", 
    targetPh: "Ej: Empleados de 20-30 años", 
    obj: "Opción Múltiple", 
    mcqTypeLabel: "Tipo de opciones", 
    mcqTypeOX: "Verdadero/Falso (O/X)", 
    mcqType4: "4 Opciones", 
    mcqType5: "5 Opciones",
    subj: "Preguntas Abiertas", 
    btn: "Generar Cuestionario & Encuesta de {n} preguntas", 
    loading: "La IA está generando el cuestionario & encuesta personalizado...", 
    alert1: "Ingrese tema y público.", 
    alert2: "Configure al menos 1 pregunta.", 
    preview: "📋 Vista previa del Cuestionario & Encuesta generado", 
    shareTitle: "🚀 Compartir y Distribuir Cuestionario & Encuesta", 
    copyLink: "Copiar enlace del Cuestionario & Encuesta", 
    copied: "¡Copiado!", 
    downloadQr: "Descargar código QR",
    shareDesc: "Copia el enlace del cuestionario & encuesta para compartir, o descarga el código QR para fomentar la participación móvil.",
    answerPh: "Por favor, escribe tu respuesta...",
    submitBtn: "Enviar",
    errGenerate: "Ocurrió un error al generar el cuestionario & encuesta.",
    errServer: "Ocurrió un error de comunicación con el servidor.",
    successSubmit: "Cuestionario & encuesta enviado con éxito."
  },
  fr: { 
    back: "Retour", 
    title: "Générer Quiz & Sondage par Sujet et Cible", 
    topic: "Sujet du Quiz & Sondage", 
    topicPh: "Ex: Enquête de satisfaction du cours", 
    target: "Public Cible", 
    targetPh: "Ex: Employés de 20-30 ans", 
    obj: "Choix Multiples", 
    mcqTypeLabel: "Type de QCM", 
    mcqTypeOX: "Vrai/Faux (O/X)", 
    mcqType4: "4 Options", 
    mcqType5: "5 Options",
    subj: "Questions Ouvertes", 
    btn: "Générer un Quiz & Sondage de {n} questions", 
    loading: "L'IA génère votre quiz & sondage personnalisé...", 
    alert1: "Veuillez entrer le sujet et la cible.", 
    alert2: "Définissez au moins 1 question.", 
    preview: "📋 Aperçu du Quiz & Sondage généré", 
    shareTitle: "🚀 Partager et Diffuser le Quiz & Sondage", 
    copyLink: "Copier le lien du Quiz & Sondage", 
    copied: "Copié !", 
    downloadQr: "Télécharger le QR code",
    shareDesc: "Copiez le lien du quiz & sondage pour le partager, ou téléchargez le QR code pour encourager la participation mobile.",
    answerPh: "Veuillez saisir votre réponse...",
    submitBtn: "Soumettre",
    errGenerate: "Une erreur s'est produite lors de la génération du quiz & sondage.",
    errServer: "Une erreur de communication avec le serveur s'est produite.",
    successSubmit: "Quiz & sondage soumis avec succès."
  },
  de: { 
    back: "Zurück", 
    title: "Quiz & Umfrage nach Thema & Ziel generieren", 
    topic: "Quiz & Umfrage Thema", 
    topicPh: "Bsp: Zufriedenheitsumfrage zur Vorlesung", 
    target: "Zielgruppe", 
    targetPh: "Bsp: Mitarbeiter 20-30 Jahre", 
    obj: "Multiple Choice", 
    mcqTypeLabel: "MC-Typ", 
    mcqTypeOX: "Wahr/Falsch (O/X)", 
    mcqType4: "4 Optionen", 
    mcqType5: "5 Optionen",
    subj: "Offene Fragen", 
    btn: "{n}-Fragen Quiz & Umfrage generieren", 
    loading: "KI generiert Ihr individuelles Quiz & Umfrage...", 
    alert1: "Bitte Thema und Ziel eingeben.", 
    alert2: "Mindestens 1 Frage festlegen.", 
    preview: "📋 Vorschau des generierten Quiz & Umfrage", 
    shareTitle: "🚀 Quiz & Umfrage teilen und verteilen", 
    copyLink: "Quiz & Umfrage Link kopieren", 
    copied: "Kopiert!", 
    downloadQr: "QR-Code herunterladen",
    shareDesc: "Kopieren Sie den Quiz & Umfrage-Link zum Teilen oder laden Sie den QR-Code herunter, um die mobile Teilnahme zu fördern.",
    answerPh: "Bitte geben Sie Ihre Antwort ein...",
    submitBtn: "Absenden",
    errGenerate: "Beim Generieren des Quiz & der Umfrage ist ein Fehler aufgetreten.",
    errServer: "Es ist ein Serverkommunikationsfehler aufgetreten.",
    successSubmit: "Quiz & Umfrage erfolgreich übermittelt."
  },
  ru: { 
    back: "На главную", 
    title: "Автогенерация Викторины & Опроса по теме и аудитории", 
    topic: "Тема Викторины & Опроса", 
    topicPh: "Пример: Опрос удовлетворенности лекцией", 
    target: "Аудитория", 
    targetPh: "Пример: Сотрудники 20-30 лет", 
    obj: "Тестовые вопросы", 
    mcqTypeLabel: "Тип теста", 
    mcqTypeOX: "Правда/Ложь (O/X)", 
    mcqType4: "4 Варианта", 
    mcqType5: "5 Вариантов",
    subj: "Открытые вопросы", 
    btn: "Создать Викторину & Опрос из {n} вопросов", 
    loading: "ИИ создает индивидуальную викторину & опрос...", 
    alert1: "Введите тему и аудиторию.", 
    alert2: "Установите хотя бы 1 вопрос.", 
    preview: "📋 Предпросмотр созданной Викторины & Опроса", 
    shareTitle: "🚀 Поделиться и распространить Викторину & Опрос", 
    copyLink: "Копировать ссылку Викторины & Опроса", 
    copied: "Скопировано!", 
    downloadQr: "Скачать QR-код",
    shareDesc: "Скопируйте ссылку на викторину & опрос для обмена или загрузите QR-код, чтобы стимулировать участие с мобильных устройств.",
    answerPh: "Пожалуйста, введите ваш ответ...",
    submitBtn: "Отправить",
    errGenerate: "Произошла ошибка при создании викторины & опроса.",
    errServer: "Произошла ошибка связи с сервером.",
    successSubmit: "Викторина & опрос успешно отправлены."
  },
  ar: { 
    back: "العودة للرئيسية", 
    title: "توليد اختبار واستبيان تلقائي حسب الموضوع والهدف", 
    topic: "موضوع الاختبار والاستبيان", 
    topicPh: "مثال: استطلاع رضا المحاضرة", 
    target: "الجمهور الهدف", 
    targetPh: "مثال: الموظفين 20-30 سنة", 
    obj: "خيارات متعددة", 
    mcqTypeLabel: "نوع الخيارات", 
    mcqTypeOX: "صح/خطأ (O/X)", 
    mcqType4: "4 خيارات", 
    mcqType5: "5 خيارات",
    subj: "أسئلة مقالية", 
    btn: "توليد اختبار واستبيان من {n} أسئلة", 
    loading: "الذكاء الاصطناعي يقوم بإنشاء اختبار واستبيان مخصص...", 
    alert1: "الرجاء إدخال الموضوع والهدف.", 
    alert2: "عيّن سؤالاً واحداً على الأقل.", 
    preview: "📋 معاينة الاختبار والاستبيان المُنشأ", 
    shareTitle: "🚀 مشاركة وتوزيع الاختبار والاستبيان", 
    copyLink: "نسخ رابط الاختبار والاستبيان", 
    copied: "تم النسخ!", 
    downloadQr: "تحميل رمز الاستجابة السريعة",
    shareDesc: "انسخ رابط الاختبار والاستبيان للمشاركة، أو قم بتنزيل رمز QR لتشجيع المشاركة عبر الهاتف المحمول.",
    answerPh: "يرجى إدخال إجابتك...",
    submitBtn: "إرسال",
    errGenerate: "حدث خطأ أثناء إنشاء الاختبار والاستبيان.",
    errServer: "حدث خطأ في الاتصال بالخادم.",
    successSubmit: "تم إرسال الاختبار والاستبيان بنجاح."
  },
  pt: { 
    back: "Voltar", 
    title: "Gerar Quiz & Pesquisa por Tema e Público", 
    topic: "Tema do Quiz & Pesquisa", 
    topicPh: "Ex: Pesquisa de satisfação da aula", 
    target: "Público", 
    targetPh: "Ex: Funcionários de 20-30 anos", 
    obj: "Múltipla Escolha", 
    mcqTypeLabel: "Tipo de múltipla escolha", 
    mcqTypeOX: "Verdadeiro/Falso (O/X)", 
    mcqType4: "4 Opções", 
    mcqType5: "5 Opções",
    subj: "Abertas", 
    btn: "Gerar Quiz & Pesquisa com {n} Questões", 
    loading: "A IA está gerando seu quiz & pesquisa personalizado...", 
    alert1: "Insira tema e público.", 
    alert2: "Defina pelo menos 1 questão.", 
    preview: "📋 Pré-visualização do Quiz & Pesquisa gerado", 
    shareTitle: "🚀 Compartilhar e Distribuir Quiz & Pesquisa", 
    copyLink: "Copiar link do Quiz & Pesquisa", 
    copied: "Copiado!", 
    downloadQr: "Baixar QR Code",
    shareDesc: "Copie o link do quiz & pesquisa para compartilhar, ou baixe o QR Code para incentivar a participação mobile.",
    answerPh: "Por favor, digite sua resposta...",
    submitBtn: "Enviar",
    errGenerate: "Ocorreu um erro ao gerar o quiz & pesquisa.",
    errServer: "Ocorreu um erro de comunicação com o servidor.",
    successSubmit: "Quiz & pesquisa enviado com sucesso."
  },
  id: { 
    back: "Kembali", 
    title: "Buat Kuis & Survei Otomatis dengan Topik & Target", 
    topic: "Topik Kuis & Survei", 
    topicPh: "Cth: Survei kepuasan kuliah", 
    target: "Target", 
    targetPh: "Cth: Karyawan usia 20-30an", 
    obj: "Pilihan Ganda", 
    mcqTypeLabel: "Tipe Pilihan Ganda", 
    mcqTypeOX: "Benar/Salah (O/X)", 
    mcqType4: "4 Pilihan", 
    mcqType5: "5 Pilihan",
    subj: "Esai", 
    btn: "Buat Kuis & Survei {n} Pertanyaan", 
    loading: "AI sedang membuat kuis & survei kustom...", 
    alert1: "Masukkan topik dan target.", 
    alert2: "Setel minimal 1 pertanyaan.", 
    preview: "📋 Pratinjau Kuis & Survei yang Dibuat", 
    shareTitle: "🚀 Bagikan & Distribusikan Kuis & Survei", 
    copyLink: "Salin Tautan Kuis & Survei", 
    copied: "Disalin!", 
    downloadQr: "Unduh Kode QR",
    shareDesc: "Salin tautan kuis & survei untuk dibagikan, atau unduh kode QR untuk mendorong partisipasi mobile.",
    answerPh: "Silakan masukkan jawaban Anda...",
    submitBtn: "Kirim",
    errGenerate: "Terjadi kesalahan saat membuat kuis & survei.",
    errServer: "Terjadi kesalahan komunikasi server.",
    successSubmit: "Kuis & survei berhasil dikirim."
  },
  hi: { 
    back: "वापस जाएं", 
    title: "विषय और लक्ष्य द्वारा क्विज़ और सर्वेक्षण स्वचालित बनाएं", 
    topic: "क्विज़ और सर्वेक्षण विषय", 
    topicPh: "उदा: व्याख्यान संतुष्टि सर्वेक्षण", 
    target: "लक्ष्य", 
    targetPh: "उदा: 20-30 वर्ष के कर्मचारी", 
    obj: "बहुविकल्पीय", 
    mcqTypeLabel: "विकल्प प्रकार", 
    mcqTypeOX: "सही/गलत (O/X)", 
    mcqType4: "4 विकल्प", 
    mcqType5: "5 विकल्प",
    subj: "निबंध", 
    btn: "{n} प्रश्नों का क्विज़ और सर्वेक्षण बनाएं", 
    loading: "AI कस्टम क्विज़ और सर्वेक्षण बना रहा है...", 
    alert1: "विषय और लक्ष्य दर्ज करें।", 
    alert2: "कम से कम 1 प्रश्न सेट करें।", 
    preview: "📋 जेनरेट किए गए क्विज़ और सर्वेक्षण का पूर्वावलोकन", 
    shareTitle: "🚀 क्विज़ और सर्वेक्षण साझा और वितरित करें", 
    copyLink: "क्विज़ और सर्वेक्षण लिंक कॉपी करें", 
    copied: "कॉपी किया गया!", 
    downloadQr: "QR कोड डाउनलोड करें",
    shareDesc: "साझा करने के लिए क्विज़ और सर्वेक्षण लिंक कॉपी करें, या मोबाइल भागीदारी बढ़ाने के लिए QR कोड डाउनलोड करें।",
    answerPh: "कृपया अपना उत्तर दर्ज करें...",
    submitBtn: "जमा करें",
    errGenerate: "क्विज़ और सर्वेक्षण बनाते समय एक त्रुटि हुई।",
    errServer: "सर्वर संचार में एक त्रुटि हुई।",
    successSubmit: "क्विज़ और सर्वेक्षण सफलतापूर्वक जमा हो गया।"
  },
  th: { 
    back: "กลับสู่หน้าหลัก", 
    title: "สร้างแบบทดสอบและแบบสอบถามอัตโนมัติจากหัวข้อและเป้าหมาย", 
    topic: "หัวข้อแบบทดสอบและแบบสอบถาม", 
    topicPh: "เช่น: แบบสำรวจความพึงพอใจในการบรรยาย", 
    target: "เป้าหมาย", 
    targetPh: "เช่น: พนักงานอายุ 20-30 ปี", 
    obj: "ปรนัย", 
    mcqTypeLabel: "ประเภทตัวเลือก", 
    mcqTypeOX: "ถูก/ผิด (O/X)", 
    mcqType4: "4 ตัวเลือก", 
    mcqType5: "5 ตัวเลือก",
    subj: "อัตนัย", 
    btn: "สร้างแบบทดสอบและแบบสอบถาม {n} คำถาม", 
    loading: "AI กำลังสร้างแบบทดสอบและแบบสอบถามที่กำหนดเอง...", 
    alert1: "กรุณาใส่หัวข้อและเป้าหมาย", 
    alert2: "ตั้งค่าอย่างน้อย 1 คำถาม", 
    preview: "📋 ตัวอย่างแบบทดสอบและแบบสอบถามที่สร้างขึ้น", 
    shareTitle: "🚀 แชร์และแจกจ่ายแบบทดสอบและแบบสอบถาม", 
    copyLink: "คัดลอกลิงก์แบบทดสอบและแบบสอบถาม", 
    copied: "คัดลอกแล้ว!", 
    downloadQr: "ดาวน์โหลด QR Code",
    shareDesc: "คัดลอกลิงก์แบบทดสอบและแบบสอบถามเพื่อแชร์ หรือดาวน์โหลด QR Code เพื่อกระตุ้นการมีส่วนร่วมผ่านมือถือ",
    answerPh: "กรุณากรอกคำตอบของคุณ...",
    submitBtn: "ส่ง",
    errGenerate: "เกิดข้อผิดพลาดขณะสร้างแบบทดสอบและแบบสอบถาม",
    errServer: "เกิดข้อผิดพลาดในการสื่อสารกับเซิร์ฟเวอร์",
    successSubmit: "ส่งแบบทดสอบและแบบสอบถามเรียบร้อยแล้ว"
  },
  fil: { 
    back: "Bumalik", 
    title: "Awtomatikong Bumuo ng Quiz at Survey ayon sa Paksa at Target", 
    topic: "Paksa ng Quiz at Survey", 
    topicPh: "Hal: Survey ng kasiyahan sa lektura", 
    target: "Target", 
    targetPh: "Hal: Mga empleyado (20-30s)", 
    obj: "Multiple Choice", 
    mcqTypeLabel: "Uri ng Multiple Choice", 
    mcqTypeOX: "Tama/Mali (O/X)", 
    mcqType4: "4 na Pagpipilian", 
    mcqType5: "5 na Pagpipilian",
    subj: "Essay", 
    btn: "Bumuo ng Quiz at Survey na may {n} Tanong", 
    loading: "Gumagawa ang AI ng custom na quiz at survey...", 
    alert1: "Ilagay ang paksa at target.", 
    alert2: "Maglagay ng kahit 1 tanong.", 
    preview: "📋 Preview ng Nabuong Quiz at Survey", 
    shareTitle: "🚀 Ibahagi at Ipamahagi ang Quiz at Survey", 
    copyLink: "Kopyahin ang Link ng Quiz at Survey", 
    copied: "Nakopya!", 
    downloadQr: "I-download ang QR Code",
    shareDesc: "Kopyahin ang link ng quiz at survey para ibahagi, o i-download ang QR code upang hikayatin ang mobile participation.",
    answerPh: "Mangyaring ilagay ang iyong sagot...",
    submitBtn: "Isumite",
    errGenerate: "May naganap na error habang gumagawa ng quiz at survey.",
    errServer: "May naganap na error sa komunikasyon sa server.",
    successSubmit: "Matagumpay na naisumite ang quiz at survey."
  },
  tr: { 
    back: "Geri", 
    title: "Konu ve Hedefle Quiz & Anket Otomatik Oluştur", 
    topic: "Quiz & Anket Konusu", 
    topicPh: "Örn: Ders memnuniyeti anketi", 
    target: "Hedef Kitle", 
    targetPh: "Örn: 20-30 yaş çalışanlar", 
    obj: "Çoktan Seçmeli", 
    mcqTypeLabel: "Seçenek Türü", 
    mcqTypeOX: "Doğru/Yanlış (O/X)", 
    mcqType4: "4 Seçenekli", 
    mcqType5: "5 Seçenekli",
    subj: "Açık Uçlu", 
    btn: "{n} Soru Quiz & Anket Oluştur", 
    loading: "AI özel quiz & anket oluşturuyor...", 
    alert1: "Lütfen konu ve hedefi girin.", 
    alert2: "En az 1 soru belirleyin.", 
    preview: "📋 Oluşturulan Quiz & Anket Önizlemesi", 
    shareTitle: "🚀 Quiz & Anketi Paylaş ve Dağıt", 
    copyLink: "Quiz & Anket Bağlantısını Kopyala", 
    copied: "Kopyalandı!", 
    downloadQr: "QR Kodunu İndir",
    shareDesc: "Paylaşmak için quiz & anket bağlantısını kopyalayın veya mobil katılımı teşvik etmek için QR kodunu indirin.",
    answerPh: "Lütfen cevabınızı girin...",
    submitBtn: "Gönder",
    errGenerate: "Quiz & anket oluşturulurken bir hata oluştu.",
    errServer: "Sunucu iletişiminde bir hata oluştu.",
    successSubmit: "Quiz & anket başarıyla gönderildi."
  },
  it: { 
    back: "Indietro", 
    title: "Genera Quiz & Sondaggio automatico per Argomento e Target", 
    topic: "Argomento del Quiz & Sondaggio", 
    topicPh: "Es: Sondaggio di soddisfazione della lezione", 
    target: "Pubblico", 
    targetPh: "Es: Dipendenti 20-30 anni", 
    obj: "Scelta Multipla", 
    mcqTypeLabel: "Tipo di scelta multipla", 
    mcqTypeOX: "Vero/Falso (O/X)", 
    mcqType4: "4 Opzioni", 
    mcqType5: "5 Opzioni",
    subj: "Domande Aperte", 
    btn: "Genera Quiz & Sondaggio di {n} Domande", 
    loading: "L'IA sta generando il tuo quiz & sondaggio personalizzato...", 
    alert1: "Inserisci argomento e target.", 
    alert2: "Imposta almeno 1 domanda.", 
    preview: "📋 Anteprima del Quiz & Sondaggio generato", 
    shareTitle: "🚀 Condividi e Distribuisci Quiz & Sondaggio", 
    copyLink: "Copia Link del Quiz & Sondaggio", 
    copied: "Copiato!", 
    downloadQr: "Scarica Codice QR",
    shareDesc: "Copia il link del quiz & sondaggio per condividerlo, o scarica il codice QR per incoraggiare la partecipazione mobile.",
    answerPh: "Inserisci la tua risposta...",
    submitBtn: "Invia",
    errGenerate: "Si è verificato un errore durante la generazione del quiz & sondaggio.",
    errServer: "Si è verificato un errore di comunicazione con il server.",
    successSubmit: "Quiz & sondaggio inviato con successo."
  },
  nl: { 
    back: "Terug", 
    title: "Quiz & Enquête automatisch genereren op Thema & Doel", 
    topic: "Thema van Quiz & Enquête", 
    topicPh: "Bijv: Tevredenheidsenquête over de les", 
    target: "Doelgroep", 
    targetPh: "Bijv: Werknemers 20-30 jaar", 
    obj: "Meerkeuze", 
    mcqTypeLabel: "Type Meerkeuze", 
    mcqTypeOX: "Waar/Niet waar (O/X)", 
    mcqType4: "4 Opties", 
    mcqType5: "5 Opties",
    subj: "Open Vragen", 
    btn: "Genereer Quiz & Enquête met {n} Vragen", 
    loading: "AI genereert uw op maat gemaakte quiz & enquête...", 
    alert1: "Voer thema en doelgroep in.", 
    alert2: "Stel minimaal 1 vraag in.", 
    preview: "📋 Voorbeeld van gegenereerde Quiz & Enquête", 
    shareTitle: "🚀 Quiz & Enquête Delen en Verspreiden", 
    copyLink: "Quiz & Enquête Link Kopiëren", 
    copied: "Gekopieerd!", 
    downloadQr: "QR-code Downloaden",
    shareDesc: "Kopieer de quiz & enquête-link om te delen, of download de QR-code om mobiele deelname te stimuleren.",
    answerPh: "Voer alstublieft uw antwoord in...",
    submitBtn: "Verzenden",
    errGenerate: "Er is een fout opgetreden bij het genereren van de quiz & enquête.",
    errServer: "Er is een servercommunicatiefout opgetreden.",
    successSubmit: "Quiz & enquête succesvol verzonden."
  },
  uk: { 
    back: "Назад", 
    title: "Автогенерація Вікторини та Опитування за темою та ціллю", 
    topic: "Тема Вікторини та Опитування", 
    topicPh: "Напр: Опитування задоволеності лекцією", 
    target: "Аудиторія", 
    targetPh: "Напр: Працівники 20-30 років", 
    obj: "Тестові", 
    mcqTypeLabel: "Тип тесту", 
    mcqTypeOX: "Правда/Брехня (O/X)", 
    mcqType4: "4 Варіанти", 
    mcqType5: "5 Варіантів",
    subj: "Відкриті", 
    btn: "Створити Вікторину та Опитування з {n} питань", 
    loading: "ШІ створює індивідуальну вікторину та опитування...", 
    alert1: "Введіть тему та аудиторію.", 
    alert2: "Встановіть хоча б 1 питання.", 
    preview: "📋 Попередній перегляд створеної Вікторини та Опитування", 
    shareTitle: "🚀 Поділитися та розповсюдити Вікторину та Опитування", 
    copyLink: "Копіювати посилання Вікторини та Опитування", 
    copied: "Скопійовано!", 
    downloadQr: "Завантажити QR-код",
    shareDesc: "Скопіюйте посилання на вікторину та опитування для поширення або завантажте QR-код, щоб заохотити участь з мобільних пристроїв.",
    answerPh: "Будь ласка, введіть вашу відповідь...",
    submitBtn: "Надіслати",
    errGenerate: "Сталася помилка під час створення вікторини та опитування.",
    errServer: "Сталася помилка зв’язку з сервером.",
    successSubmit: "Вікторину та опитування успішно надіслано."
  },
  ms: { 
    back: "Kembali", 
    title: "Jana Kuiz & Tinjauan Automatik melalui Topik & Sasaran", 
    topic: "Topik Kuiz & Tinjauan", 
    topicPh: "Cth: Tinjauan kepuasan kuliah", 
    target: "Sasaran", 
    targetPh: "Cth: Pekerja 20-an", 
    obj: "Aneka Pilihan", 
    mcqTypeLabel: "Jenis Pilihan", 
    mcqTypeOX: "Betul/Salah (O/X)", 
    mcqType4: "4 Pilihan", 
    mcqType5: "5 Pilihan",
    subj: "Esei", 
    btn: "Jana Kuiz & Tinjauan {n} Soalan", 
    loading: "AI sedang menjana kuiz & tinjauan tersuai...", 
    alert1: "Masukkan topik dan sasaran.", 
    alert2: "Tetapkan sekurang-kurangnya 1 soalan.", 
    preview: "📋 Pratonton Kuiz & Tinjauan yang Dijana", 
    shareTitle: "🚀 Kongsi & Edarkan Kuiz & Tinjauan", 
    copyLink: "Salin Pautan Kuiz & Tinjauan", 
    copied: "Disalin!", 
    downloadQr: "Muat Turun Kod QR",
    shareDesc: "Salin pautan kuiz & tinjauan untuk dikongsi, atau muat turun kod QR untuk menggalakkan penyertaan mudah alih.",
    answerPh: "Sila masukkan jawapan anda...",
    submitBtn: "Hantar",
    errGenerate: "Ralat berlaku semasa menjana kuiz & tinjauan.",
    errServer: "Ralat komunikasi pelayan berlaku.",
    successSubmit: "Kuiz & tinjauan berjaya dihantar."
  }
};

function Mode1Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lang = searchParams.get('lang') || 'ko';
  const t = TEXTS[lang] || TEXTS['ko'];

  const [topic, setTopic] = useState('');
  const [target, setTarget] = useState('');
  
  const [mcqType, setMcqType] = useState('4'); 
  const [objCount, setObjCount] = useState(3);
  const [subjCount, setSubjCount] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [surveyData, setSurveyData] = useState<any[]>([]);
  const [isCopied, setIsCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');           // ★ 추가
  const [surveyId, setSurveyId] = useState('');           // ★ 추가

  const qrRef = useRef<HTMLDivElement>(null);

  // 고유 ID 생성 함수
  const generateUniqueId = () => {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 12); // 예: a8f3k2m9b1c4
  };

    const handleGenerate = async () => {
    if (!topic || !target) return alert(t.alert1);
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
          topic,
          target,
          mcqCount: objCount,
          mcqType,
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

        const { error } = await supabase.from('surveys').insert({
          id: newId,
          topic,
          target,
          lang,
          questions: formatted,
          mcq_type: mcqType,
          is_public: true,
        });

        if (error) {
          console.error('Supabase 저장 오류:', error);
          alert(t.errServer);
          return;
        }

        setSurveyId(newId);
        setSurveyData(formatted);

        // URL 생성
        try {
          const base = SURVEY_MODES.create;
          const urlObject = new URL(base.url);
          let path = urlObject.pathname.replace(/\/$/, '');
          urlObject.pathname = `${path}/s/${newId}`;
          urlObject.searchParams.set('lang', lang);
          setShareUrl(urlObject.toString());
        } catch (err) {
          console.error('URL 생성 오류:', err);
          setShareUrl(`https://ai-survey-platform-chi.vercel.app/create/s/${newId}?lang=${lang}`);
        }
      } else {
        alert(t.errGenerate);
      }
    } catch (err) {
      console.error(err);
      alert(t.errServer);
    } finally {
      setIsLoading(false);
    }
  };   // ← 여기서 handleGenerate를 반드시 닫아야 합니다!

  // ★ 이제부터 handleGenerate 바깥
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
        
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
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

          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1">{t.obj}</label>
            <input type="number" min="0" max="20" className="w-full border p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={objCount} onChange={(e) => setObjCount(Number(e.target.value))} />
          </div>

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

      {surveyData.length > 0 && (
        <div className="mt-8 pt-8 border-t border-gray-200">
          
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
                  className="mt-2 text-xs text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5"/> {t.downloadQr}
                </button>
              </div>

              <div className="flex-1 w-full space-y-3">
                <p className="text-xs text-blue-700 leading-relaxed">
                  {t.shareDesc}
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
                     <textarea className="w-full border border-gray-300 bg-white rounded-lg p-3 h-28 text-sm outline-none resize-none" placeholder={t.answerPh}></textarea>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-4">
            <div className="w-full flex items-center justify-between bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
              <span className="text-sm text-gray-600 truncate mr-2">
                {shareUrl}
              </span>
              <button 
                onClick={handleCopyLink}
                className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap cursor-pointer"
              >
                {t.copyLink}
              </button>
            </div>

            <button 
              onClick={() => {
                alert(t.successSubmit);
              }}
              className="w-full py-4 bg-blue-600 text-white font-bold text-base rounded-xl hover:bg-blue-700 transition-colors shadow-md cursor-pointer"
            >
              {t.submitBtn}
            </button>
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