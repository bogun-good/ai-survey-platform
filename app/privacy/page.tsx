'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// 20개국 언어별 개인정보 수집 및 이용 동의 데이터 (9번 항목 삭제 완료)
const privacyTranslations: Record<string, { title: string; backBtn: string; intro: string; sections: { title: string; content: string | string[] }[] }> = {
  ko: {
    title: '개인정보 수집 및 이용 동의',
    backBtn: '돌아가기',
    intro: '서비스는 「개인정보 보호법」 등 관계 법령에 따라 회원의 개인정보를 안전하게 처리합니다.',
    sections: [
      {
        title: '1. 수집하는 개인정보',
        content: [
          '[필수항목]',
          '• 이메일 주소',
          '• 암호화된 비밀번호',
          '• 회원 식별 정보',
          '[자동 수집 항목]',
          '• 서비스 이용기록, 접속 로그, 쿠키, 접속 IP 주소, 브라우저 정보, 운영체제(OS) 정보, 접속기기 정보'
        ]
      },
      {
        title: '2. 개인정보 이용 목적',
        content: [
          '수집한 개인정보는 다음의 목적으로 이용됩니다:',
          '• 회원 식별 및 본인 확인, 회원가입 의사 확인',
          '• 중복가입 및 부정이용 방지',
          '• 고객 문의 및 민원 처리, 공지사항 전달',
          '• AI 설문 생성 서비스 제공, AI 퀴즈 생성 서비스 제공, AI 콘텐츠 생성 결과 제공',
          '• 서비스 품질 향상, 보안 관리 및 이상 접속 탐지, 통계 분석 및 서비스 개선'
        ]
      },
      {
        title: '3. 개인정보 보유 및 이용기간',
        content: [
          '① 회원 탈퇴 시 개인정보는 지체 없이 파기합니다.',
          '② 다음의 경우에는 관련 법령에 따라 일정 기간 보관할 수 있습니다: 계약 또는 청약철회 등에 관한 기록, 대금결제 및 재화 등의 공급에 관한 기록, 소비자 불만 또는 분쟁처리 기록, 접속기록 등 관계 법령에서 보존을 요구하는 정보',
          '③ 부정 이용자의 재가입 방지를 위해 최소한의 식별정보를 일정 기간 보관할 수 있으며, 그 내용은 별도로 고지합니다.'
        ]
      },
      {
        title: '4. 개인정보 제3자 제공',
        content: '서비스는 회원의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 다만 관계 법령에 따른 경우에는 예외로 합니다.'
      },
      {
        title: '5. 개인정보 처리 위탁',
        content: '서비스 운영을 위하여 필요한 경우 일부 업무를 외부 전문업체에 위탁할 수 있으며, 이 경우 관련 법령에 따라 안전하게 관리합니다.'
      },
      {
        title: '6. 개인정보의 파기',
        content: '보유기간이 종료되거나 처리 목적이 달성된 개인정보는 복구가 불가능한 방법으로 즉시 파기합니다.'
      },
      {
        title: '7. 개인정보 보호',
        content: '서비스는 개인정보의 안전한 처리를 위하여 암호화, 접근통제, 보안관리 등 필요한 기술적·관리적 보호조치를 시행합니다.'
      }
    ]
  },
  en: {
    title: 'Consent to Collection and Use of Personal Information',
    backBtn: 'Go Back',
    intro: 'The service securely processes members personal information in accordance with relevant laws such as the Personal Information Protection Act.',
    sections: [
      {
        title: '1. Personal Information Collected',
        content: ['[Required Items]', '• Email address', '• Encrypted password', '• Member identification info', '[Automatically Collected Items]', '• Service usage records, access logs, cookies, IP addresses, browser info, OS info, device info']
      },
      {
        title: '2. Purpose of Use',
        content: ['Collected information is used for:', '• Member identification, verification, and registration confirmation', '• Prevention of duplicate registration and fraudulent use', '• Customer inquiries, complaints, and notices', '• Providing AI survey, quiz, and content generation results', '• Service quality improvement, security management, and statistical analysis']
      },
      {
        title: '3. Retention and Use Period',
        content: ['① Personal info is destroyed without delay upon withdrawal.', '② Can be retained for a certain period according to laws regarding contracts, payments, disputes, or connection records.', '③ Minimum identification info may be kept to prevent fraudulent re-registration.']
      },
      {
        title: '4. Provision to Third Parties',
        content: 'The service does not provide personal information to third parties without consent, except as required by law.'
      },
      {
        title: '5. Consignment of Processing',
        content: 'Some tasks may be outsourced to external experts for operations, managed safely under relevant laws.'
      },
      {
        title: '6. Destruction of Personal Information',
        content: 'Personal info whose retention period has expired is destroyed immediately in an irrecoverable manner.'
      },
      {
        title: '7. Rights of Members',
        content: ['Members can exercise rights including:', '• Access, correction, account withdrawal, deletion request, and suspension of processing.']
      },
      {
        title: '8. Protection of Personal Information',
        content: 'The service implements technical and administrative protective measures such as encryption, access control, and security management.'
      }
    ]
  },
  ja: {
    title: '個人情報の収集および利用に関する同意',
    backBtn: '戻る',
    intro: 'サービスは「個人情報保護法」等の関連法令に基づき、会員の個人情報を安全に処理します。',
    sections: [
      { title: '1. 収集する個人情報', content: ['[必須項目]', '• メールアドレス', '• 暗号化されたパスワード', '• 会員識別情報', '[自動収集項目]', '• サービス利用記録、アクセスログ、クッキー、IPアドレス、ブラウザ情報、OS情報、端末情報'] },
      { title: '2. 個人情報の利用目的', content: ['収集した個人情報は以下の目的に利用されます：', '• 会員識別および本人確認、登録意思の確認', '• 不正利用の防止', '• 問い合わせ対応、お知らせの伝達', '• AIアンケート・クイズ・コンテンツ生成サービスの提供', '• 品質向上、セキュリティ管理'] },
      { title: '3. 個人情報の保有および利用期間', content: ['① 退会時、個人情報は遅滞なく破棄されます。', '② 関連法令に基づき一定期間保管される場合があります。', '③ 不正再登録防止のため最小限の識別情報を一定期間保管する場合があります。'] },
      { title: '4. 個人情報の第三者提供', content: '法令に基づく場合を除き、同意なく第三者に提供しません。' },
      { title: '5. 個人情報処理の委託', content: '運営のために一部業務を外部に委託する場合があります。' },
      { title: '6. 個人情報の破棄', content: '保有期間終了後、復元不可能な方法で直ちに破棄します。' },
      { title: '7. 会員の権利', content: ['閲覧、修正、退会、削除要請、処理停止要請の権利を行使できます。'] },
      { title: '8. 個人情報保護', content: '暗号化やアクセス制限などの保護措置を実施します。' }
    ]
  },
  zh: {
    title: '个人信息收集及使用同意书',
    backBtn: '返回',
    intro: '本服务根据《个人信息保护法》等相关法律法规安全处理会员的个人信息。',
    sections: [
      { title: '1. 收集的个人信息', content: ['[必填项]', '• 邮箱地址', '• 加密密码', '• 会员识别信息', '[自动收集项]', '• 服务使用记录、访问日志、Cookie、IP地址、浏览器信息、操作系统信息、设备信息'] },
      { title: '2. 个人信息使用目的', content: ['收集的信息用于：', '• 会员识别、身份验证及注册确认', '• 防止重复注册及违规使用', '• 客户咨询及客诉处理、公告传达', '• 提供AI问卷、测验及内容生成服务', '• 提升服务质量、安全管理'] },
      { title: '3. 个人信息保留及使用期限', content: ['① 会员注销后将立即销毁个人信息。', '② 根据相关法律法规可能保留一定期限。', '③ 为防止违规用户重新注册，可保留最低限度的识别信息。'] },
      { title: '4. 个人信息向第三方提供', content: '未经会员同意，不向第三方提供个人信息，法律法规另有规定除外。' },
      { title: '5. 个人信息处理委托', content: '为运营服务可委托外部专业机构处理，并将依法安全管理。' },
      { title: '6. 个人信息的销毁', content: '保留期满后将立即以无法恢复的方式销毁。' },
      { title: '7. 会员的权利', content: ['会员可随时行使查阅、修改、注销、删除请求及停止处理请求等权利。'] },
      { title: '8. 个人信息保护', content: '为安全处理个人信息，采取加密、访问控制及安全管理等技术与管理保护措施。' }
    ]
  },
  es: {
    title: 'Consentimiento para la Recopilación y Uso de Información Personal',
    backBtn: 'Volver',
    intro: 'El servicio procesa de forma segura la información personal de los miembros de acuerdo con las leyes pertinentes.',
    sections: [
      { title: '1. Información Personal Recopilada', content: ['[Elementos obligatorios]', '• Dirección de correo electrónico', '• Contraseña encriptada', '• Información de identificación', '[Elementos automáticos]', '• Registros de uso, cookies, IP, navegador, OS, dispositivo'] },
      { title: '2. Propósito del Uso', content: ['Se utiliza para identificación, prevención de fraudes, atención al cliente y provisión de servicios de IA.'] },
      { title: '3. Período de Retención', content: ['Se destruye sin demora al retirar la membresía, excepto cuando la ley exija lo contrario.'] },
      { title: '4. Cesión a Terceros', content: 'No se cede a terceros sin consentimiento, salvo excepciones legales.' },
      { title: '5. Tercerización', content: 'Se puede delegar parte de la operación a expertos externos bajo normas de seguridad.' },
      { title: '6. Destrucción', content: 'Se destruye de forma irreversible al finalizar el período.' },
      { title: '7. Derechos del Miembro', content: ['Derecho a consulta, modificación, baja, eliminación y cese del tratamiento.'] },
      { title: '8. Protección', content: 'Se implementan medidas técnicas como encriptación y control de acceso.' }
    ]
  },
  fr: {
    title: 'Consentement à la collecte et à l’utilisation des données personnelles',
    backBtn: 'Retour',
    intro: 'Le service traite les informations personnelles conformément aux lois applicables.',
    sections: [
      { title: '1. Informations collectées', content: ['[Obligatoire]', '• Adresse e-mail', '• Mot de passe crypté', '• Identifiants', '[Automatique]', '• Journaux de connexion, cookies, IP, etc.'] },
      { title: '2. Finalité de l’utilisation', content: ['Identification, support client, services IA et amélioration de la qualité.'] },
      { title: '3. Durée de conservation', content: ['Suppression immédiate lors de la désinscription, sauf obligation légale.'] },
      { title: '4. Fourniture à des tiers', content: 'Pas de transmission sans consentement, sauf dispositions légales.' },
      { title: '5. Sous-traitance', content: 'Possibilité de confier des tâches à des prestataires externes sécurisés.' },
      { title: '6. Destruction', content: 'Destruction irrécupérable à l’expiration du délai.' },
      { title: '7. Droits des membres', content: ['Accès, modification, suppression et opposition au traitement.'] },
      { title: '8. Protection', content: 'Mise en place de mesures de sécurité techniques et organisationnelles.' }
    ]
  },
  de: {
    title: 'Einwilligung zur Erhebung und Nutzung personenbezogener Daten',
    backBtn: 'Zurück',
    intro: 'Der Dienst verarbeitet personenbezogene Daten gemäß den geltenden Datenschutzgesetzen.',
    sections: [
      { title: '1. Erhobene Daten', content: ['[Pflichtangaben]', '• E-Mail-Adresse', '• Verschlüsseltes Passwort', '• Mitglieder-ID', '[Automatisch]', '• Nutzungsdaten, Logs, Cookies, IP-Adresse'] },
      { title: '2. Zweck der Nutzung', content: ['Identifikation, Betrugsprävention, Support und Bereitstellung von KI-Diensten.'] },
      { title: '3. Aufbewahrungsfrist', content: ['Löschung bei Kontoschließung, sofern keine gesetzlichen Aufbewahrungspflichten bestehen.'] },
      { title: '4. Weitergabe an Dritte', content: 'Keine Weitergabe ohne Zustimmung, außer bei gesetzlicher Pflicht.' },
      { title: '5. Auftragsverarbeitung', content: ['Auslagerung bestimmter Aufgaben an externe Dienstleister unter Beachtung der Gesetze.'] },
      { title: '6. Vernichtung', content: ['Unwiederbringliche Löschung nach Ablauf der Frist.'] },
      { title: '7. Rechte der Mitglieder', content: ['Recht auf Auskunft, Berichtigung, Löschung und Einschränkung.'] },
      { title: '8. Schutz', content: 'Technische und organisatorische Schutzmaßnahmen wie Verschlüsselung.' }
    ]
  },
  ru: {
    title: 'Согласие на сбор и использование персональных данных',
    backBtn: 'Назад',
    intro: 'Сервис обрабатывает персональные данные в соответствии с законодательством.',
    sections: [
      { title: '1. Собираемые данные', content: ['[Обязательно]', '• Электронная почта', '• Зашифрованный пароль', '• Идентификационные данные', '[Автоматически]', '• История использования, логи, cookies, IP-адрес'] },
      { title: '2. Цель использования', content: ['Идентификация, предотвращение мошенничества, поддержка и предоставление ИИ-услуг.'] },
      { title: '3. Срок хранения', content: ['Удаление при расторжении, за исключением случаев, предусмотренных законом.'] },
      { title: '4. Передача третьим лицам', content: 'Без согласия не передается, за исключением требований закона.' },
      { title: '5. Поручение обработки', content: ['Возможность привлечения внешних специалистов при соблюдении безопасности.'] },
      { title: '6. Уничтожение', content: ['Немедленное безвозвратное уничтожение после окончания срока.'] },
      { title: '7. Права пользователей', content: ['Право на доступ, исправление, удаление и ограничение обработки.'] },
      { title: '8. Защита данных', content: ['Шифрование, контроль доступа и другие меры безопасности.'] }
    ]
  },
  pt: {
    title: 'Consentimento para Coleta e Uso de Informações Pessoais',
    backBtn: 'Voltar',
    intro: 'O serviço processa dados pessoais de acordo com as leis aplicáveis.',
    sections: [
      { title: '1. Dados Coletados', content: ['[Obrigatório]', '• E-mail', '• Senha criptografada', '• ID do usuário', '[Automático]', '• Registros de uso, cookies, IP'] },
      { title: '2. Finalidade', content: ['Identificação, suporte e serviços de IA.'] },
      { title: '3. Período de Retenção', content: ['Exclusão imediata após o encerramento da conta, exceto por exigência legal.'] },
      { title: '4. Divulgação a Terceiros', content: 'Não fornecido sem consentimento, exceto por lei.' },
      { title: '5. Terceirização', content: ['Prestadores externos podem ser contratados com segurança jurídica.'] },
      { title: '6. Destruição', content: ['Eliminação irreversível após o prazo.'] },
      { title: '7. Direitos do Membro', content: ['Consulta, alteração, exclusão e suspensão.'] },
      { title: '8. Proteção', content: ['Criptografia e controle de acesso.'] }
    ]
  },
  it: {
    title: 'Consenso alla Raccolta e Uso dei Dati Personali',
    backBtn: 'Indietro',
    intro: 'Il servizio tratta i dati personali in conformità alle leggi vigenti.',
    sections: [
      { title: '1. Dati Raccolti', content: ['[Obbligatori]', '• Email', '• Password cifrata', '• Dati identificativi', '[Automatici]', '• Log di accesso, cookie, IP'] },
      { title: '2. Finalità d’Uso', content: ['Identificazione, supporto e fornitura di servizi IA.'] },
      { title: '3. Periodo di Conservazione', content: ['Cancellazione immediata alla disiscrizione, salvo obblighi di legge.'] },
      { title: '4. Comunicazione a Terzi', content: 'Nessuna cessione senza consenso, salvo eccezioni di legge.' },
      { title: '5. Esternalizzazione', content: ['Affidamento parziale a esperti esterni con standard di sicurezza.'] },
      { title: '6. Distruzione', content: ['Eliminazione irreversibile alla scadenza.'] },
      { title: '7. Diritti dell’Utente', content: ['Accesso, modifica, cancellazione e blocco del trattamento.'] },
      { title: '8. Protezione', content: ['Misure tecniche di cifratura e controllo accessi.'] }
    ]
  },
  vi: {
    title: 'Sự đồng ý thu thập và sử dụng thông tin cá nhân',
    backBtn: 'Quay lại',
    intro: 'Dịch vụ xử lý thông tin cá nhân của thành viên theo đúng pháp luật hiện hành.',
    sections: [
      { title: '1. Thông tin thu thập', content: ['[Bắt buộc]', '• Địa chỉ email', '• Mật khẩu mã hóa', '• Thông tin định danh', '[Tự động]', '• Lịch sử sử dụng, cookie, địa chỉ IP'] },
      { title: '2. Mục đích sử dụng', content: ['Xác thực danh tính, hỗ trợ khách hàng và cung cấp dịch vụ AI.'] },
      { title: '3. Thời hạn lưu trữ', content: ['Tiêu hủy ngay khi hủy tài khoản, trừ trường hợp pháp luật yêu cầu giữ lại.'] },
      { title: '4. Cung cấp cho bên thứ ba', content: 'Không cung cấp mà không có sự đồng ý, trừ khi luật định.' },
      { title: '5. Ủy quyền xử lý', content: ['Có thể ủy thác cho đơn vị chuyên môn bên ngoài đảm bảo an toàn bảo mật.'] },
      { title: '6. Tiêu hủy', content: ['Tiêu hủy không thể khôi phục khi hết hạn.'] },
      { title: '7. Quyền của thành viên', content: ['Tra cứu, sửa đổi, rút lui, yêu cầu xóa hoặc dừng xử lý.'] },
      { title: '8. Bảo vệ thông tin', content: ['Áp dụng mã hóa và kiểm soát truy cập an toàn.'] }
    ]
  },
  th: {
    title: 'ความยินยอมในการเก็บรวบรวมและใช้ข้อมูลส่วนบุคคล',
    backBtn: 'ย้อนกลับ',
    intro: 'บริการนี้ประมวลผลข้อมูลส่วนบุคคลอย่างปลอดภัยตามกฎหมายคุ้มครองข้อมูลส่วนบุคคล',
    sections: [
      { title: '1. ข้อมูลส่วนบุคคลที่เก็บรวบรวม', content: ['[รายการที่จำเป็น]', '• อีเมล', '• รหัสผ่านที่เข้ารหัส', '• ข้อมูลระบุตัวตน', '[รายการอัตโนมัติ]', '• ประวัติการใช้งาน, คุกกี้, IP, ข้อมูลเบราว์เซอร์'] },
      { title: '2. วัตถุประสงค์ในการใช้', content: ['ใช้เพื่อการระบุตัวตน, ป้องกันการใช้งานผิดประเภท, และให้บริการ AI'] },
      { title: '3. ระยะเวลาการเก็บรักษา', content: ['ทำลายทันทีเมื่อยกเลิกสมาชิก เว้นแต่กฎหมายกำหนดไว้เป็นอย่างอื่น'] },
      { title: '4. การเปิดเผยแก่บุคคลที่สาม', content: 'ไม่เปิดเผยข้อมูลแก่บุคคลที่สามโดยปราศจากความยินยอม' },
      { title: '5. การมอบหมายประมวลผล', content: ['อาจมอบหมายให้ผู้เชี่ยวชาญภายนอกดำเนินการภายใต้ความปลอดภัย'] },
      { title: '6. การทำลายข้อมูล', content: ['ทำลายด้วยวิธีที่ไม่สามารถกู้คืนได้เมื่อสิ้นสุดระยะเวลา'] },
      { title: '7. สิทธิของสมาชิก', content: ['สิทธิในการเข้าถึง, แก้ไข, ลบ หรือระงับการประมวลผลข้อมูล'] },
      { title: '8. การคุ้มครองข้อมูล', content: ['ใช้มาตรการรักษาความปลอดภัยทางเทคนิค เช่น การเข้ารหัสและการควบคุมการเข้าถึง'] }
    ]
  },
  id: {
    title: 'Persetujuan Pengumpulan dan Penggunaan Informasi Pribadi',
    backBtn: 'Kembali',
    intro: 'Layanan memproses informasi pribadi dengan aman sesuai dengan hukum yang berlaku.',
    sections: [
      { title: '1. Informasi yang Dikumpulkan', content: ['[Wajib]', '• Alamat email', '• Kata sandi terenkripsi', '• Info identifikasi', '[Otomatis]', '• Riwayat penggunaan, log akses, cookie, IP'] },
      { title: '2. Tujuan Penggunaan', content: ['Identifikasi anggota, pencegahan kecurangan, dukungan pelanggan, dan layanan AI.'] },
      { title: '3. Periode Retensi', content: ['Segera dimusnahkan saat keanggotaan berakhir, kecuali diwajibkan oleh undang-undang.'] },
      { title: '4. Penyediaan ke Pihak Ketiga', content: 'Tidak diberikan kepada pihak ketiga tanpa persetujuan, kecuali diwajibkan hukum.' },
      { title: '5. Konsinyasi Pemrosesan', content: ['Dapat diserahkan kepada pihak eksternal yang aman sesuai regulasi.'] },
      { title: '6. Pemusnahan', content: ['Dihancurkan secara permanen setelah masa retensi habis.'] },
      { title: '7. Hak Anggota', content: ['Hak akses, koreksi, penarikan, penghapusan, dan penghentian pemrosesan.'] },
      { title: '8. Perlindungan', content: ['Menerapkan enkripsi, kontrol akses, dan manajemen keamanan.'] }
    ]
  },
  ms: {
    title: 'Persetujuan Pengumpulan dan Penggunaan Maklumat Peribadi',
    backBtn: 'Kembali',
    intro: 'Perkhidmatan memproses maklumat peribadi dengan selamat mengikut undang-undang berkaitan.',
    sections: [
      { title: '1. Maklumat yang Dikumpul', content: ['[Perkara Wajib]', '• Alamat e-mel', '• Kata laluan disulitkan', '• Maklumat pengenalan ahli', '[Automatik]', '• Rekod penggunaan, log akses, kuki, IP'] },
      { title: '2. Tujuan Penggunaan', content: ['Pengenalan ahli, pencegahan penipuan, sokongan pelanggan, dan perkhidmatan AI.'] },
      { title: '3. Tempoh Simpanan', content: ['Dilupuskan serta-merta apabila keahlian ditamatkan, kecuali dikehendaki undang-undang.'] },
      { title: '4. Pemberian Kepada Pihak Ketiga', content: ['Tidak diberikan kepada pihak ketiga tanpa kebenaran kecuali atas sebab undang-undang.'] },
      { title: '5. Perwakilan Pemprosesan', content: ['Boleh diagihkan kepada pakar luaran dengan kawalan keselamatan yang ketat.'] },
      { title: '6. Pelupusan Maklumat', content: ['Dilupuskan dengan kaedah yang tidak boleh dipulihkan selepas tempoh tamat.'] },
      { title: '7. Hak Ahli', content: ['Hak untuk menyemak, mengubah, membatalkan, atau meminta pemadaman data.'] },
      { title: '8. Perlindungan Maklumat', content: ['Melaksanakan penyulitan, kawalan akses, dan perlindungan teknikal.'] }
    ]
  },
  hi: {
    title: 'व्यक्तिगत जानकारी के संग्रह और उपयोग की सहमति',
    backBtn: 'वापस जाएं',
    intro: 'सेवा प्रासंगिक कानूनों के अनुसार सदस्यों की व्यक्तिगत जानकारी को सुरक्षित रूप से संसाधित करती है।',
    sections: [
      { title: '1. एकत्रित व्यक्तिगत जानकारी', content: ['[आवश्यक वस्तुएं]', '• ईमेल पता', '• एन्क्रिप्टेड पासवर्ड', '• सदस्य पहचान जानकारी', '[स्वचालित]', '• उपयोग रिकॉर्ड, कुकीज़, आईपी पता'] },
      { title: '2. उपयोग का उद्देश्य', content: ['पहचान, सुरक्षा, समर्थन और एआई सेवाएं प्रदान करना।'] },
      { title: '3. प्रतिधारण अवधि', content: ['सदस्यता समाप्त होने पर तुरंत नष्ट कर दिया जाता है, सिवाय कानून के अनुसार।'] },
      { title: '4. तीसरे पक्ष को प्रावधान', content: ['सहमति के बिना तीसरे पक्ष को प्रदान नहीं किया जाता है।'] },
      { title: '5. प्रसंस्करण का उप-ठेका', content: ['बाहरी विशेषज्ञों को काम सौंपा जा सकता है।'] },
      { title: '6. विनाश', content: ['अवधि समाप्त होने पर स्थायी रूप से नष्ट कर दिया जाता है।'] },
      { title: '7. सदस्यों के अधिकार', content: ['देखने, सुधारने, हटाने और प्रसंस्करण रोकने का अनुरोध।'] },
      { title: '8. सुरक्षा', content: ['एन्क्रिप्शन और एक्सेस कंट्रोल लागू किए जाते हैं।'] }
    ]
  },
  ar: {
    title: 'الموافقة على جمع واستخدام المعلومات الشخصية',
    backBtn: 'رجوع',
    intro: 'تقوم الخدمة معالجة المعلومات الشخصية بأمان وفقاً للقوانين ذات الصلة.',
    sections: [
      { title: '1. المعلومات الشخصية المجمعة', content: ['[العناصر الإلزامية]', '• عنوان البريد الإلكتروني', '• كلمة المرور المشفرة', '• معلومات الهوية', '[عناصر الجمع التلقائي]', '• سجلات الاستخدام، ملفات تعريف الارتباط، عنوان IP'] },
      { title: '2. غرض استخدام المعلومات', content: ['تحديد هوية الأعضاء، منع الاستخدام الاحتيالي، ودعم العملاء وخدمات الذكاء الاصطناعي.'] },
      { title: '3. فترة الاحتفاظ والاستخدام', content: ['يتم تدمير المعلومات الشخصية فور الانسحاب، باستثناء ما تقتضيه القوانين.'] },
      { title: '4. توفير المعلومات لأطراف ثالثة', content: 'لا تقدم الخدمة البيانات لأطراف ثالثة دون موافقة إلا بموجب القانون.' },
      { title: '5. تفويض معالجة البيانات', content: 'يجوز الاستعانة بمصادر خارجية متخصصة مع ضمان الأمان.' },
      { title: '6. تدمير المعلومات الشخصية', content: 'يتم إتلاف البيانات بطريقة غير قابلة للاسترداد عند انتهاء الغرض.' },
      { title: '7. حقوق الأعضاء', content: ['يحق للاعضاء الاستعلام، التعديل، الانسحاب، أو طلب حذف البيانات.'] },
      { title: '8. حماية المعلومات الشخصية', content: ['تطبق الخدمة تدابير أمنية تقنية وإدارية مثل التشفير وتقييد الوصول.'] }
    ]
  },
  tr: {
    title: 'Kişisel Verilerin Toplanması ve Kullanılmasına İlişkin Onay',
    backBtn: 'Geri Dön',
    intro: 'Hizmet, üyelerin kişisel verilerini ilgili yasalara uygun olarak güvenli bir şekilde işler.',
    sections: [
      { title: '1. Toplanan Kişisel Veriler', content: ['[Zorunlu Alanlar]', '• E-posta adresi', '• Şifrelenmiş şifre', '• Üye kimlik bilgileri', '[Otomatik Toplananlar]', '• Kullanım geçmişi, çerezler, IP adresi'] },
      { title: '2. Kullanım Amacı', content: ['Üye kimlik doğrulama, dolandırıcılığı önleme ve yapay zeka hizmetleri sağlama.'] },
      { title: '3. Saklama Süresi', content: ['Üyelik iptal edildiğinde imha edilir, yasal zorunluluklar hariç.'] },
      { title: '4. Üçüncü Taraflara Aktarım', content: 'Onay olmadan üçüncü taraflara aktarılmaz.' },
      { title: '5. İşleme Yetkilendirmesi', content: ['Gerekirse harici uzmanlara devredilebilir.'] },
      { title: '6. İmha Edilmesi', content: ['Süresi dolan veriler geri döndürülemez şekilde yok edilir.'] },
      { title: '7. Üyenin Hakları', content: ['Erişim, düzeltme, silme ve işleme durdurma talebinde bulunma hakkı.'] },
      { title: '8. Veri Koruma', content: ['Şifreleme ve erişim kontrolü gibi teknik tedbirler uygulanır.'] }
    ]
  },
  nl: {
    title: 'Toestemming voor het verzamelen en gebruiken van persoonsgegevens',
    backBtn: 'Terug',
    intro: 'De dienst verwerkt persoonsgegevens veilig in overeenstemming met de wetgeving.',
    sections: [
      { title: '1. Verzamelde persoonsgegevens', content: ['[Verplichte velden]', '• E-mailadres', '• Versleuteld wachtwoord', '• Gebruikersidentificatie', '[Automatisch verzameld]', '• Gebruikslogs, cookies, IP-adres'] },
      { title: '2. Doel van gebruik', content: ['Gebruikersidentificatie, fraudepreventie en AI-diensten leveren.'] },
      { title: '3. Bewaartermijn', content: ['Direct vernietigd bij beëindiging, tenzij de wet anders vereist.'] },
      { title: '4. Verstrekking aan derden', content: 'Niet verstrekt zonder toestemming, behalve wettelijke verplichtingen.' },
      { title: '5. Uitbesteding verwerking', content: ['Kan worden uitbesteed aan externe deskundigen onder strenge beveiliging.'] },
      { title: '6. Vernietiging', content: ['Onherroepelijk vernietigd na afloop van de termijn.'] },
      { title: '7. Rechten van leden', content: ['Recht op inzage, rectificatie, verwijdering en beperking.'] },
      { title: '8. Bescherming', content: ['Technische en organisatorische beveiligingsmaatregelen zoals encryptie.'] }
    ]
  },
  pl: {
    title: 'Zgoda na gromadzenie i wykorzystywanie danych osobowych',
    backBtn: 'Wróć',
    intro: 'Usługa przetwarza dane osobowe w sposób bezpieczny, zgodnie z przepisami prawa.',
    sections: [
      { title: '1. Gromadzone dane', content: ['[Wymagane]', '• Adres e-mail', '• Zaszyfrowane hasło', '• Informacje identyfikacyjne', '[Automatyczne]', '• Historia użycia, pliki cookies, adres IP'] },
      { title: '2. Cel wykorzystania', content: ['Identyfikacja użytkownika, zapobieganie nadużyciom oraz świadczenie usług AI.'] },
      { title: '3. Okres przechowywania', content: ['Usunięcie niezwłocznie po rezygnacji, chyba że przepisy prawa stanowią inaczej.'] },
      { title: '4. Przekazywanie osobom trzecim', content: 'Dane nie są przekazywane bez zgody, z wyjątkiem wymogów prawnych.' },
      { title: '5. Powierzenie przetwarzania', content: ['Możliwość powierzenia zadań zewnętrznym specjalistom z zachowaniem bezpieczeństwa.'] },
      { title: '6. Zniszczenie danych', content: ['Nieodwracalne zniszczenie danych po wygaśnięciu okresu przechowywania.'] },
      { title: '7. Prawa użytkownika', content: ['Prawo wglądu, sprostowania, usunięcia oraz żądania zaprzestania przetwarzania.'] },
      { title: '8. Ochrona danych', content: ['Stosowanie szyfrowania, kontroli dostępu i środków bezpieczeństwa.'] }
    ]
  },
  sv: {
    title: 'Samtycke till insamling och användning av personuppgifter',
    backBtn: 'Tillbaka',
    intro: 'Tjänsten behandlar personuppgifter säkert i enlighet med gällande lagar.',
    sections: [
      { title: '1. Insamlade personuppgifter', content: ['[Obligatoriska uppgifter]', '• E-postadress', '• Krypterat lösenord', '• Användar-ID', '[Automatiskt insamlade]', '• Användningshistorik, cookies, IP-adress'] },
      { title: '2. Ändamål med användning', content: ['Användaridentifiering, förhindrande av missbruk och tillhandahållande av AI-tjänster.'] },
      { title: '3. Lagringstid', content: ['Förstörs omedelbart vid avslutande av medlemskap, om inte lag kräver annat.'] },
      { title: '4. Utlämnande till tredje part', content: 'Lämnas inte ut utan samtycke, förutom vid lagstadgade krav.' },
      { title: '5. Outsorcing av behandling', content: ['Kan delegeras till externa experter under säkra förhållanden.'] },
      { title: '6. Förstöring', content: ['Raderas oåterkalleligt när lagringstiden har löpt ut.'] },
      { title: '7. Medlemmens rättigheter', content: ['Rätt till tillgång, rättelse, radering och begränsning.'] },
      { title: '8. Skydd', content: ['Kryptering, åtkomstkontroll och säkerhetsåtgärder tillämpas.'] }
    ]
  }
};

export default function PrivacyPage() {
  const router = useRouter();
  const [lang, setLang] = useState('ko');

  const currentPrivacy = privacyTranslations[lang] || privacyTranslations.ko;

  // 회원가입 페이지로 돌아가기 위한 라우팅 핸들러
  const handleBackToSignup = () => {
    router.push('/signup'); // 회원가입 페이지 경로 (프로젝트 상황에 맞게 수정 가능)
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 font-sans text-gray-800">
      {/* 상단 네비게이션 및 언어 선택 드롭다운 */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">{currentPrivacy.title}</h1>
        
        <div className="flex items-center gap-3">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ko">한국어 (Korean)</option>
            <option value="en">English</option>
            <option value="ja">日本語 (Japanese)</option>
            <option value="zh">中文 (Chinese)</option>
            <option value="es">Español (Spanish)</option>
            <option value="fr">Français (French)</option>
            <option value="de">Deutsch (German)</option>
            <option value="ru">Русский (Russian)</option>
            <option value="pt">Português (Portuguese)</option>
            <option value="it">Italiano (Italian)</option>
            <option value="vi">Tiếng Việt (Vietnamese)</option>
            <option value="th">ไทย (Thai)</option>
            <option value="id">Bahasa Indonesia</option>
            <option value="ms">Bahasa Melayu</option>
            <option value="hi">हिन्दी (Hindi)</option>
            <option value="ar">العربية (Arabic)</option>
            <option value="tr">Türkçe (Turkish)</option>
            <option value="nl">Nederlands (Dutch)</option>
            <option value="pl">Polski (Polish)</option>
            <option value="sv">Svenska (Swedish)</option>
          </select>
        </div>
      </div>

      {/* 안내 문구 */}
      <p className="mb-6 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200">
        {currentPrivacy.intro}
      </p>

      {/* 약관 내용 섹션 렌더링 */}
      <div className="space-y-6 mb-12">
        {currentPrivacy.sections.map((section, index) => (
          <div key={index} className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
            {Array.isArray(section.content) ? (
              <div className="space-y-1 pl-2 text-sm text-gray-600">
                {section.content.map((line, lineIdx) => (
                  <p key={lineIdx}>{line}</p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600 pl-2">{section.content}</p>
            )}
          </div>
        ))}
      </div>

      {/* 화면 하단에 배치된 돌아가기 버튼 (회원가입 페이지로 이동) */}
      <div className="flex justify-center border-t border-gray-200 pt-8">
        <button
          onClick={handleBackToSignup}
          className="px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm"
        >
          {currentPrivacy.backBtn}
        </button>
      </div>
    </div>
  );
}