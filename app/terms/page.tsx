'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 20개 언어별 이용약관 데이터 딕셔너리
const termsTranslations: Record<string, { title: string; backBtn: string; content: { title: string; text: string | string[] }[] }> = {
  ko: {
    title: '이용약관',
    backBtn: '돌아가기',
    content: [
      { title: '제1조 (목적)', text: '본 약관은 서비스가 제공하는 AI 기반 설문지 생성, AI 퀴즈 생성, AI 콘텐츠 생성 및 관련 서비스의 이용과 관련하여 서비스 운영자와 회원의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.' },
      { title: '제2조 (용어의 정의)', text: ['① "회원"이란 본 약관에 동의하고 회원가입을 완료하여 서비스를 이용하는 자를 말합니다.', '② "콘텐츠"란 회원이 작성하거나 업로드한 설문, 퀴즈, 문서, 이미지, 파일 및 AI가 생성한 결과물을 말합니다.', '③ "AI 생성 콘텐츠"란 생성형 인공지능 기술을 이용하여 작성된 답변, 설문, 퀴즈, 문서 등을 말합니다.'] },
      { title: '제3조 (회원가입)', text: ['① 회원은 사실에 근거한 정확한 정보를 제공하여 가입하여야 합니다.', '② 타인의 정보를 도용하거나 허위 정보를 입력한 경우 회원가입이 취소될 수 있습니다.', '③ 만 14세 미만의 아동은 법정대리인의 동의를 받은 경우에만 회원가입이 가능합니다.'] },
      { title: '제4조 (계정 관리)', text: ['① 회원은 자신의 아이디와 비밀번호를 직접 관리하여야 합니다.', '② 회원의 관리 소홀로 발생한 손해에 대해서는 회원 본인의 책임으로 합니다.', '③ 회원은 계정이 도용된 사실을 인지한 경우 즉시 운영자에게 알려야 합니다.'] },
      { title: '제5조 (서비스 이용)', text: ['① 서비스는 원칙적으로 연중무휴 24시간 제공합니다.', '② 다음의 경우 서비스 이용이 일시적으로 중단될 수 있습니다: 시스템 점검, 서버 증설, 보안 업데이트, 장애 발생, 천재지변, 국가기관의 명령, 기간통신사업자의 서비스 중단, 기타 불가피한 사유'] },
      { title: '제6조 (서비스 변경 및 종료)', text: ['① 운영자는 서비스 개선 또는 운영상 필요에 따라 서비스의 일부 또는 전부를 변경하거나 종료할 수 있습니다.', '② 서비스 종료 시에는 사전에 공지하며, 긴급한 경우에는 사후 공지할 수 있습니다.'] },
      { title: '제7조 (회원의 의무)', text: '회원은 허위 정보 등록, 타인의 개인정보 도용, 계정 공유 또는 양도, 매크로 등 자동화 프로그램 이용, 서버 공격 및 해킹, 악성코드 배포, 저작권 침해, 명예훼손, 불법·음란·차별·혐오 콘텐츠 생성 및 배포, AI를 이용한 불법 행위, 서비스 운영 방해, 기타 관계 법령 위반 행위를 하여서는 안 됩니다.' },
      { title: '제8조 (서비스 이용 제한)', text: '운영자는 약관 위반, 타인의 권리 침해, 반복적인 부정 이용, 불법 콘텐츠 생성, 서비스 운영 방해, 관계 법령 위반 시 회원의 서비스 이용을 제한하거나 회원자격을 해지할 수 있습니다.' },
      { title: '제9조 (지식재산권)', text: ['① 서비스의 프로그램, 디자인, 상표, 로고, AI 시스템 등과 관련된 모든 지식재산권은 운영자 또는 정당한 권리자에게 있습니다.', '② 회원이 AI를 이용하여 생성한 설문지, 퀴즈 및 기타 콘텐츠는 관계 법령과 제3자의 권리를 침해하지 않는 범위에서 회원이 자유롭게 이용, 수정, 배포, 인쇄 및 상업적으로 활용할 수 있습니다. 다만, 서비스의 프로그램, 디자인, 로고, AI 시스템, 데이터베이스 등 서비스 자체를 복제하거나 무단으로 제공하는 행위는 금지됩니다.'] },
      { title: '제10조 (회원 콘텐츠)', text: ['① 회원이 작성하거나 업로드한 콘텐츠의 저작권은 원칙적으로 회원에게 있습니다.', '② 운영자는 서비스 제공, 백업, 장애복구, 보안 유지 등을 위하여 필요한 범위에서 회원의 콘텐츠를 저장·처리할 수 있습니다.'] },
      { title: '제11조 (면책)', text: ['① 운영자는 천재지변, 국가기관의 명령, 기간통신사업자의 서비스 중단 등 불가항력적인 사유로 서비스를 제공하지 못하는 경우 책임을 지지 않습니다.', '② 운영자는 회원의 귀책사유로 발생한 서비스 이용 장애에 대하여 책임을 지지 않습니다.', '③ 운영자는 회원이 게시하거나 AI를 통해 생성한 콘텐츠의 정확성·적법성에 대하여 보증하지 않습니다.', '④ 다만 운영자의 고의 또는 중대한 과실로 인한 손해에 대해서는 관련 법령에 따릅니다.'] },
      { title: '제12조 (준거법 및 관할)', text: '본 약관은 대한민국 법률에 따라 해석되며, 서비스 이용과 관련하여 발생한 분쟁은 대한민국 법원을 관할 법원으로 합니다.' }
    ]
  },
  en: {
    title: 'Terms of Service',
    backBtn: 'Go Back',
    content: [
      { title: 'Article 1 (Purpose)', text: 'These Terms of Service aim to stipulate the rights, duties, and responsibilities of the service provider and members regarding the use of AI-based survey creation, AI quiz creation, AI content creation, and related services.' },
      { title: 'Article 2 (Definition of Terms)', text: ['① "Member" refers to a person who agrees to these terms and completes registration to use the service.', '② "Content" refers to surveys, quizzes, documents, images, files written or uploaded by members, and AI-generated results.', '③ "AI-Generated Content" refers to answers, surveys, quizzes, documents, etc., created using generative AI technology.'] },
      { title: 'Article 3 (Membership Registration)', text: ['① Members must provide accurate information based on facts when registering.', '② Registration may be canceled if someone uses another persons information or enters false data.', '③ Children under 14 years of age may register only with the consent of a legal representative.'] },
      { title: 'Article 4 (Account Management)', text: ['① Members are responsible for managing their own ID and password.', '② Members are solely responsible for damages caused by poor account management.', '③ Members must notify the operator immediately if they discover account theft.'] },
      { title: 'Article 5 (Use of Service)', text: ['① The service is provided 24/7 in principle.', '② Service may be temporarily suspended for system maintenance, server expansion, security updates, failures, natural disasters, government orders, or telecommunication disruptions.'] },
      { title: 'Article 6 (Change and Termination of Service)', text: ['① The operator may change or terminate part or all of the service for operational or improvement needs.', '② Notice will be given in advance upon termination, or post-notice in case of emergencies.'] },
      { title: 'Article 7 (Member Obligations)', text: 'Members must not register false info, steal personal info, share/transfer accounts, use macros, hack, distribute malware, infringe copyrights, defame others, create illegal/harmful content, commit illegal acts using AI, or obstruct service operations.' },
      { title: 'Article 8 (Restriction of Use)', text: 'The operator may restrict or terminate membership for violations of terms, rights infringement, repeated abuse, illegal content generation, or breaking laws.' },
      { title: 'Article 9 (Intellectual Property Rights)', text: ['① All IP rights related to the service program, design, logo, AI system belong to the operator.', '② Members cannot copy, modify, distribute, sell, or commercialize the core platform service without prior consent.'] },
      { title: 'Article 10 (Member Content)', text: ['① Copyrights of content written or uploaded by members belong to the members.', '② The operator may store and process member content as necessary for service provision, backup, and security.'] },
      { title: 'Article 11 (Disclaimer)', text: ['① The operator is not liable for force majeure events like natural disasters or telecommunication disruptions.', '② The operator is not liable for service disruptions caused by member faults.', '③ The operator does not guarantee the accuracy or legality of AI-generated content.', '④ Relevant laws apply for damages caused by willful misconduct or gross negligence of the operator.'] },
      { title: 'Article 12 (Governing Law and Jurisdiction)', text: 'These terms are governed by the laws of the Republic of Korea, and disputes shall be subject to the jurisdiction of Korean courts.' }
    ]
  },
  ja: {
    title: '利用規約',
    backBtn: '戻る',
    content: [
      { title: '第1条（目的）', text: '本規約は、サービスが提供するAIベースのアンケート作成、AIクイズ作成、AIコンテンツ作成および関連サービスの利用に関し、運営者と会員の権利、義務および責任事項を規定することを目的とします。' },
      { title: '第2条（用語の定義）', text: ['①「会員」とは、本規約に同意し、会員登録を完了してサービスを利用する者をいいます。', '②「コンテンツ」とは、会員が作成またはアップロードしたアンケート、クイズ、文書、画像、ファイル、およびAIが生成した結果物をいいます。', '③「AI生成コンテンツ」とは、生成型人工知能技術を利用して作成された回答、アンケート、クイズ、文書などをいいます。'] },
      { title: '第3条（会員登録）', text: ['①会員は事実に基づく正確な情報を提供して登録しなければなりません。', '②他人の情報を盗用したり虚偽の情報を入力した場合、会員登録が取り消されることがあります。'] },
      { title: '第4条（アカウント管理）', text: ['①会員は自身のIDとパスワードを自ら管理しなければなりません。', '②会員の管理不忽によって発生した損害については、会員本人の責任とします。'] },
      { title: '第5条（サービスの利用）', text: ['①サービスは原則として年中無休24時間提供します。'] },
      { title: '第6条（サービスの変更および終了）', text: ['①運営者はサービスの改善または運営上の必要に応じてサービスの全部または一部を変更または終了することができます。'] },
      { title: '第7条（会員の義務）', text: '会員は虚偽情報の登録、他人の個人情報の盗用、アカウントの共有や譲渡、自動化プログラムの利用、サーバー攻撃やハッキング、著作権侵害などを行ってはなりません。' },
      { title: '第8条（サービス利用の制限）', text: '運営者は規約違反、権利侵害、不正利用などがあった場合、サービスの利用を制限することができます。' },
      { title: '第9条（知的財産権）', text: ['①サービスのプログラム、デザイン、ロゴ、AIシステム等に関するすべての知的財産権は運営者に帰属します。', '②会員がAIを利用して生成したコンテンツは会員が自由に利用できますが、サービス自体の無断複製等は禁止されます。'] },
      { title: '第10条（会員コンテンツ）', text: ['①会員が作成・アップロードしたコンテンツの著作権は原則として会員に帰属します。'] },
      { title: '第11条（免責）', text: ['①運営者は天災地変等の不可抗力によるサービス非提供について責任を負いません。'] },
      { title: '第12条（準拠法および管轄）', text: '本規約は韓国法に準拠し、紛争時は韓国の裁判所を管轄裁判所とします。' }
    ]
  },
  zh: {
    title: '服务条款',
    backBtn: '返回',
    content: [
      { title: '第1条（目的）', text: '本条款旨在规定服务运营商与会员在使用AI问卷生成、AI测验生成、AI内容生成及相关服务时的权利、义务及责任事项。' },
      { title: '第2条（术语定义）', text: ['①“会员”指同意本条款并完成注册以使用服务的人。', '②“内容”指会员编写或上传的问卷、测验、文档、图片、文件以及AI生成的结果物。', '③“AI生成内容”指利用生成式人工智能技术创建的回答、问卷、测验、文档等。'] },
      { title: '第3条（会员注册）', text: ['①会员应提供基于事实的准确信息进行注册。', '②盗用他人信息或输入虚假信息的，可能会被取消会员资格。'] },
      { title: '第4条（账号管理）', text: ['①会员应自行管理自己的账号和密码。', '②因会员管理疏忽造成的损失由会员本人承担。'] },
      { title: '第5条（服务使用）', text: ['①服务原则上提供全年无休24小时服务。'] },
      { title: '第6条（服务变更与终止）', text: ['①运营商可根据服务改善或运营需求变更或终止服务。'] },
      { title: '第7条（会员义务）', text: '会员不得注册虚假信息、盗用他人个人信息、共享或转让账号、使用自动化程序、攻击服务器、侵犯版权等。' },
      { title: '第8条（服务使用限制）', text: '如有违反条款、侵犯权利等行为，运营商可限制或终止会员资格。' },
      { title: '第9条（知识产权）', text: ['①服务相关程序、设计、标志、AI系统等所有知识产权归运营商所有。', '②会员利用AI生成的问卷、测验等内容可在不侵犯第三方权利的前提下自由使用，但严禁擅自复制或盗用服务平台本身。'] },
      { title: '第10条（会员内容）', text: ['①会员编写或上传的内容版权归会员所有。'] },
      { title: '第11条（免责声明）', text: ['①因天灾等不可抗力因素导致无法提供服务的，运营商不承担责任。'] },
      { title: '第12条（适用法律与管辖）', text: '本条款受大韩民国法律管辖，相关争议由韩国法院管辖。' }
    ]
  },
  es: {
    title: 'Términos de Servicio',
    backBtn: 'Volver',
    content: [
      { title: 'Artículo 1 (Propósito)', text: 'Estos Términos de Servicio tienen como objetivo regular los derechos, deberes y responsabilidades del proveedor y de los miembros.' },
      { title: 'Artículo 2 (Definiciones)', text: ['① "Miembro" se refiere a quien acepta estos términos.'] },
      { title: 'Artículo 3 (Registro)', text: 'Los miembros deben proporcionar información precisa.' },
      { title: 'Artículo 4 (Gestión de Cuenta)', text: 'Los miembros son responsables de gestionar su ID y contraseña.' },
      { title: 'Artículo 5 (Uso del Servicio)', text: 'El servicio se proporciona 24/7 en principio.' },
      { title: 'Artículo 6 (Modificación)', text: 'El operador puede modificar o finalizar el servicio según sea necesario.' },
      { title: 'Artículo 7 (Obligaciones)', text: 'Los miembros no deben realizar actividades ilegales o infringir derechos de autor.' },
      { title: 'Artículo 8 (Restricción)', text: 'El operador puede restringir el acceso por violaciones a los términos.' },
      { title: 'Artículo 9 (Propiedad Intelectual)', text: ['① Los derechos de propiedad intelectual pertenecen al operador.', '② Los contenidos generados por IA pueden ser utilizados por el miembro, pero queda prohibida la copia del servicio principal.'] },
      { title: 'Artículo 10 (Contenido del Miembro)', text: 'Los derechos de autor del contenido creado por el miembro pertenecen a este.' },
      { title: 'Artículo 11 (Exención de Responsabilidad)', text: 'El operador no es responsable por causas de fuerza mayor.' },
      { title: 'Artículo 12 (Ley Aplicable)', text: 'Estos términos se rigen por las leyes de la República de Corea.' }
    ]
  },
  fr: {
    title: "Conditions d'utilisation",
    backBtn: 'Retour',
    content: [
      { title: 'Article 1 (Objet)', text: "Ces conditions visent à définir les droits et obligations des utilisateurs et de l'opérateur." },
      { title: 'Article 2 (Définitions)', text: ['① "Membre" désigne toute personne inscrite au service.'] },
      { title: 'Article 3 (Inscription)', text: "L'exactitude des informations fournies est requise." },
      { title: 'Article 4 (Gestion du compte)', text: "L'utilisateur est responsable de la sécurité de son compte." },
      { title: 'Article 5 (Utilisation)', text: 'Le service est fourni 24h/24 et 7j/7.' },
      { title: 'Article 6 (Modification)', text: "L'opérateur peut modifier ou suspendre le service." },
      { title: "Article 7 (Obligations de l'utilisateur)", text: 'Interdiction de distribuer du contenu illégal ou malveillant.' },
      { title: 'Article 8 (Restriction)', text: "Suspension possible en cas de violation des conditions." },
      { title: 'Article 9 (Propriété intellectuelle)', text: ["Les droits de propriété intellectuelle du service appartiennent à l'opérateur.", "La copie non autorisée de la plateforme est interdite."] },
      { title: 'Article 10 (Contenu)', text: 'Les droits d’auteur du contenu créé par le membre lui appartiennent.' },
      { title: 'Article 11 (Exonération)', text: "L'opérateur n'est pas responsable en cas de force majeure." },
      { title: 'Article 12 (Loi applicable)', text: 'Régי par les lois de la République de Corée.' }
    ]
  },
  de: {
    title: 'Nutzungsbedingungen',
    backBtn: 'Zurück',
    content: [
      { title: 'Artikel 1 (Zweck)', text: 'Diese Nutzungsbedingungen regeln die Rechte und Pflichten zwischen Betreiber und Mitgliedern.' },
      { title: 'Artikel 2 (Definitionen)', text: ['① „Mitglied“ bezeichnet eine Person, die den Dienst nutzt.'] },
      { title: 'Artikel 3 (Registrierung)', text: 'Mitglieder müssen genaue Angaben machen.' },
      { title: 'Artikel 4 (Kontoverwaltung)', text: 'Mitglieder sind für ihre Kontodaten selbst verantwortlich.' },
      { title: 'Artikel 5 (Dienstnutzung)', text: 'Der Dienst wird grundsätzlich rund um die Uhr zur Verfügung gestellt.' },
      { title: 'Artikel 6 (Änderung)', text: 'Der Betreiber kann den Dienst anpassen oder einstellen.' },
      { title: 'Artikel 7 (Pflichten)', text: 'Unzulässige Handlungen wie Hacking oder Betrug sind untersagt.' },
      { title: 'Artikel 8 (Nutzungsbeschränkung)', text: 'Bei Verstößen kann der Zugang gesperrt werden.' },
      { title: 'Artikel 9 (Geistiges Eigentum)', text: ['Die geistigen Eigentumsrechte der Plattform liegen beim Betreiber.', 'Die Vervielfältigung des Dienstes ist untersagt.'] },
      { title: 'Artikel 10 (Inhalte)', text: 'Urheberrechte an vom Mitglied erstellten Inhalten verbleiben beim Mitglied.' },
      { title: 'Artikel 11 (Haftungsausschluss)', text: 'Keine Haftung bei höherer Gewalt.' },
      { title: 'Artikel 12 (Anwendbares Recht)', text: 'Es gilt das Recht der Republik Korea.' }
    ]
  },
  vi: {
    title: 'Điều khoản sử dụng',
    backBtn: 'Quay lại',
    content: [
      { title: 'Điều 1 (Mục đích)', text: 'Quy định quyền và nghĩa vụ khi sử dụng dịch vụ.' },
      { title: 'Điều 2 (Định nghĩa)', text: ['① "Thành viên" là người đăng ký sử dụng dịch vụ.'] },
      { title: 'Điều 3 (Đăng ký)', text: 'Cần cung cấp thông tin chính xác khi đăng ký.' },
      { title: 'Điều 4 (Quản lý tài khoản)', text: 'Thành viên tự bảo mật thông tin tài khoản.' },
      { title: 'Điều 5 (Sử dụng dịch vụ)', text: 'Dịch vụ được cung cấp liên tục.' },
      { title: 'Điều 6 (Thay đổi và Chấm dứt)', text: 'Nhà điều hành có thể thay đổi hoặc ngừng dịch vụ.' },
      { title: 'Điều 7 (Nghĩa vụ của thành viên)', text: 'Không thực hiện hành vi vi phạm pháp luật hoặc gian lận.' },
      { title: 'Điều 8 (Hạn chế sử dụng)', text: 'Có thể khóa tài khoản nếu vi phạm điều khoản.' },
      { title: 'Điều 9 (Quyền sở hữu trí tuệ)', text: ['Toàn bộ bản quyền thuộc về nhà điều hành.', 'Cấm sao chép trái phép dịch vụ cốt lõi.'] },
      { title: 'Điều 10 (Nội dung thành viên)', text: 'Bản quyền nội dung do thành viên tạo ra thuộc về thành viên.' },
      { title: 'Điều 11 (Miễn trừ trách nhiệm)', text: 'Không chịu trách nhiệm trong trường hợp bất khả kháng.' },
      { title: 'Điều 12 (Luật áp dụng)', text: 'Tuân theo pháp luật Hàn Quốc.' }
    ]
  },
  th: {
    title: 'เงื่อนไขการใช้งาน',
    backBtn: 'ย้อนกลับ',
    content: [
      { title: 'ข้อ 1 (วัตถุประสงค์)', text: 'ข้อกำหนดนี้ระบุสิทธิและหน้าที่ในการใช้งานบริการ' },
      { title: 'ข้อ 2 (คำนิยาม)', text: ['① "สมาชิก" หมายถึงผู้ที่ลงทะเบียนใช้งาน'] },
      { title: 'ข้อ 3 (การสมัครสมาชิก)', text: 'ต้องให้ข้อมูลที่ถูกต้องและเป็นความจริง' },
      { title: 'ข้อ 4 (การจัดการบัญชี)', text: 'สมาชิกต้องรับผิดชอบดูแลรหัสผ่านของตนเอง' },
      { title: 'ข้อ 5 (การใช้บริการ)', text: 'ให้บริการตลอด 24 ชั่วโมง' },
      { title: 'ข้อ 6 (การเปลี่ยนแปลง)', text: 'ผู้ให้บริการสามารถเปลี่ยนแปลงหรือยุติบริการได้' },
      { title: 'ข้อ 7 (หน้าที่ของสมาชิก)', text: 'ห้ามกระทำการผิดกฎหมายหรือละเมิดลิขสิทธิ์' },
      { title: 'ข้อ 8 (การจำกัดการใช้)', text: 'ระงับสิทธิหากพบการละเมิดเงื่อนไข' },
      { title: 'ข้อ 9 (สิทธิในทรัพย์สินทางปัญญา)', text: ['สิทธิทั้งหมดเป็นของผู้ให้บริการ', 'ห้ามคัดลอกระบบบริการโดยไม่ได้รับอนุญาต'] },
      { title: 'ข้อ 10 (เนื้อหาของสมาชิก)', text: 'ลิขสิทธิ์ของเนื้อหาที่สมาชิกสร้างเป็นของสมาชิก' },
      { title: 'ข้อ 11 (ข้อจำกัดความรับผิด)', text: 'ไม่รับผิดชอบกรณีเหตุสุดวิสัย' },
      { title: 'ข้อ 12 (กฎหมายที่ใช้บังคับ)', text: 'อยู่ภายใต้กฎหมายเกาหลีใต้' }
    ]
  },
  id: {
    title: 'Syarat Layanan',
    backBtn: 'Kembali',
    content: [
      { title: 'Pasal 1 (Tujuan)', text: 'Menetapkan hak dan kewajiban terkait penggunaan layanan.' },
      { title: 'Pasal 2 (Definisi)', text: ['① "Anggota" adalah pengguna yang telah mendaftar.'] },
      { title: 'Pasal 3 (Pendaftaran)', text: 'Harus memberikan informasi yang akurat.' },
      { title: 'Pasal 4 (Manajemen Akun)', text: 'Anggota bertanggung jawab atas akun masing-masing.' },
      { title: 'Pasal 5 (Penggunaan Layanan)', text: 'Layanan tersedia 24/7.' },
      { title: 'Pasal 6 (Perubahan Layanan)', text: 'Operator dapat mengubah atau menghentikan layanan.' },
      { title: 'Pasal 7 (Kewajiban Anggota)', text: 'Dilarang melakukan tindakan ilegal atau merusak sistem.' },
      { title: 'Pasal 8 (Pembatasan)', text: 'Akses dapat dibatasi jika melanggar ketentuan.' },
      { title: 'Pasal 9 (Hak Kekayaan Intelektual)', text: ['Hak kekayaan intelektual milik operator.', 'Dilarang keras menyalin platform inti tanpa izin.'] },
      { title: 'Pasal 10 (Konten Anggota)', text: 'Hak cipta konten milik anggota yang membuat.' },
      { title: 'Pasal 11 (Penyangkalan)', text: 'Operator tidak bertanggung jawab atas keadaan kahar.' },
      { title: 'Pasal 12 (Hukum yang Berlaku)', text: 'Tunduk pada hukum Republik Korea.' }
    ]
  },
  ru: {
    title: 'Условия использования',
    backBtn: 'Назад',
    content: [
      { title: 'Статья 1 (Цель)', text: 'Настоящие Условия регулируют права и обязанности сторон.' },
      { title: 'Статья 2 (Термины)', text: ['① «Участник» — лицо, зарегистрированное в системе.'] },
      { title: 'Статья 3 (Регистрация)', text: 'Требуется предоставление достоверных данных.' },
      { title: 'Статья 4 (Управление аккаунтом)', text: 'Пользователь отвечает за безопасность своего пароля.' },
      { title: 'Статья 5 (Использование сервиса)', text: 'Сервис доступен круглосуточно.' },
      { title: 'Статья 6 (Изменения)', text: 'Оператор может изменять условия или закрывать сервис.' },
      { title: 'Статья 7 (Обязанности)', text: 'Запрещено нарушать законы и авторские права.' },
      { title: 'Статья 8 (Ограничения)', text: 'При нарушениях доступ может быть заблокирован.' },
      { title: 'Статья 9 (Интеллектуальная собственность)', text: ['Все права на платформу принадлежат оператору.', 'Запрещено копирование сервиса.'] },
      { title: 'Статья 10 (Контент)', text: 'Авторские права на контент пользователя остаются за ним.' },
      { title: 'Статья 11 (Отказ от ответственности)', text: 'Оператор не несет ответственности при форс-мажоре.' },
      { title: 'Статья 12 (Применимое право)', text: 'Регулируется законодательством Южной Кореи.' }
    ]
  },
  pt: {
    title: 'Termos de Serviço',
    backBtn: 'Voltar',
    content: [
      { title: 'Artigo 1 (Objetivo)', text: 'Estes termos regulam o uso dos serviços oferecidos.' },
      { title: 'Artigo 2 (Definições)', text: ['① "Membro" refere-se ao usuário cadastrado.'] },
      { title: 'Artigo 3 (Cadastro)', text: 'É necessário fornecer dados precisos.' },
      { title: 'Artigo 4 (Conta)', text: 'O membro é responsável pela segurança de sua conta.' },
      { title: 'Artigo 5 (Uso)', text: 'O serviço está disponível 24 horas por dia.' },
      { title: 'Artigo 6 (Alterações)', text: 'O operador pode alterar ou encerrar o serviço.' },
      { title: 'Artigo 7 (Obrigações)', text: 'É proibido realizar atos ilegais ou fraudes.' },
      { title: 'Artigo 8 (Restrições)', text: 'O acesso pode ser limitado em caso de violação.' },
      { title: 'Artigo 9 (Propriedade Intelectual)', text: ['Os direitos pertencem ao operador.', 'É proibida a cópia não autorizada da plataforma.'] },
      { title: 'Artigo 10 (Conteúdo)', text: 'Os direitos autorais do conteúdo criado pertencem ao usuário.' },
      { title: 'Artigo 11 (Isenção)', text: 'O operador não se responsabiliza por força maior.' },
      { title: 'Artigo 12 (Jurisdição)', text: 'Regido pelas leis da República da Coreia.' }
    ]
  },
  it: {
    title: 'Termini di Servizio',
    backBtn: 'Indietro',
    content: [
      { title: 'Articolo 1 (Scopo)', text: 'I presenti termini stabiliscono le regole di utilizzo del servizio.' },
      { title: 'Articolo 2 (Definizioni)', text: ['① "Membro" indica l’utente registrato.'] },
      { title: 'Articolo 3 (Registrazione)', text: 'Gli utenti devono inserire dati veritieri.' },
      { title: 'Articolo 4 (Gestione account)', text: 'L’utente è responsabile delle proprie credenziali.' },
      { title: 'Articolo 5 (Servizio)', text: 'Il servizio è attivo 24 ore su 24.' },
      { title: 'Articolo 6 (Modifiche)', text: 'L’operatore può modificare o terminare il servizio.' },
      { title: 'Articolo 7 (Obblighi)', text: 'È vietato compiere attività illecite o dannose.' },
      { title: 'Articolo 8 (Restrizioni)', text: 'L’accesso può essere limitato in caso di violazioni.' },
      { title: 'Articolo 9 (Proprietà Intellettuale)', text: ['Tutti i diritti di proprietà intellettuale appartengono all’operatore.', 'È vietata la copia non autorizzata.'] },
      { title: 'Articolo 10 (Contenuti)', text: 'I diritti d’autore dei contenuti restano dell’utente.' },
      { title: 'Articolo 11 (Esclusione di responsabilità)', text: 'Nessuna responsabilità per cause di forza maggiore.' },
      { title: 'Articolo 12 (Legge applicabile)', text: 'Regolato dalle leggi della Repubblica di Corea.' }
    ]
  },
  ar: {
    title: 'شروط الخدمة',
    backBtn: 'رجوع',
    content: [
      { title: 'المادة 1 (الغرض)', text: 'تحدد هذه الشروط حقوق وواجبات الأطراف.' },
      { title: 'المادة 2 (التعاريف)', text: ['① "العضو" هو كل من أكمل التسجيل.'] },
      { title: 'المادة 3 (التسجيل)', text: 'يجب تقديم معلومات دقيقة.' },
      { title: 'المادة 4 (إدارة الحساب)', text: 'المستخدم مسؤول عن حماية حسابه.' },
      { title: 'المادة 5 (استخدام الخدمة)', text: 'الخدمة متاحة على مدار الساعة.' },
      { title: 'المادة 6 (التعديل)', text: 'يحق للمشغل تعديل أو إنهاء الخدمة.' },
      { title: 'المادة 7 (الالتزامات)', text: 'يمنع ارتكاب أي أفعال غير قانونية.' },
      { title: 'المادة 8 (القيود)', text: 'يمكن تقييد الخدمة عند المخالفة.' },
      { title: 'المادة 9 (الملكية الفكرية)', text: ['جميع حقوق الملكية الفكرية مملوكة للمشغل.', 'يمنع نسخ أو استنساخ المنصة.'] },
      { title: 'المادة 10 (محتوى العضو)', text: 'حقوق نشر المحتوى مملوكة للعضو.' },
      { title: 'المادة 11 (إخلاء المسؤولية)', text: 'لا يتحمل المشغل المسؤولية في حالات القوة القاهرة.' },
      { title: 'المادة 12 (القانون الحاكم)', text: 'تخضع هذه الشروط لقوانين جمهورية كوريا.' }
    ]
  },
  hi: {
    title: 'सेवा की शर्तें',
    backBtn: 'वापस जाएं',
    content: [
      { title: 'धारा 1 (उद्देश्य)', text: 'यह शर्तें सेवाओं के उपयोग को नियंत्रित करती हैं।' },
      { title: 'धारा 2 (परिभाषाएँ)', text: ['① "सदस्य" वह व्यक्ति है जो पंजीकृत है।'] },
      { title: 'धारा 3 (पंजीकरण)', text: 'सटीक जानकारी प्रदान करना अनिवार्य है।' },
      { title: 'धारा 4 (खाता प्रबंधन)', text: 'उपयोगकर्ता अपने खाते की सुरक्षा के लिए जिम्मेदार है।' },
      { title: 'धारा 5 (सेवा का उपयोग)', text: 'सेवाएं चौबीसों घंटे उपलब्ध हैं।' },
      { title: 'धारा 6 (परिवर्तन)', text: 'ऑपरेटर सेवा में बदलाव कर सकता है।' },
      { title: 'धारा 7 (दायित्व)', text: 'अवैध गतिविधियों की अनुमति नहीं है।' },
      { title: 'धारा 8 (प्रतिबंध)', text: 'नियम उल्लंघन पर सेवा प्रतिबंधित की जा सकती है।' },
      { title: 'धारा 9 (बौद्धिक संपदा)', text: ['सभी अधिकार ऑपरेटर के पास सुरक्षित हैं।', 'प्लेटफॉर्म की अनाधिकृत प्रतिलिपि प्रतिबंधित है।'] },
      { title: 'धारा 10 (सामग्री)', text: 'सदस्य द्वारा बनाई गई सामग्री का कॉपीराइट सदस्य का है।' },
      { title: 'धारा 11 (अस्वीकरण)', text: 'बल majeure के मामलों में कोई जिम्मेदारी नहीं।' },
      { title: 'धारा 12 (कानून)', text: 'कोरिया गणराज्य के कानूनों के अधीन।' }
    ]
  },
  nl: {
    title: 'Servicevoorwaarden',
    backBtn: 'Terug',
    content: [
      { title: 'Artikel 1 (Doel)', text: 'Deze voorwaarden regelen het gebruik van de diensten.' },
      { title: 'Artikel 2 (Definities)', text: ['① "Lid" is een geregistreerde gebruiker.'] },
      { title: 'Artikel 3 (Registratie)', text: 'Juiste informatie is vereist bij registratie.' },
      { title: 'Artikel 4 (Accountbeheer)', text: 'Leden zijn zelf verantwoordelijk voor hun accountgegevens.' },
      { title: 'Artikel 5 (Dienstverlening)', text: 'De dienst is in principe 24/7 beschikbaar.' },
      { title: 'Artikel 6 (Wijzigingen)', text: 'De exploitant kan de service wijzigen of beëindigen.' },
      { title: 'Artikel 7 (Verplichtingen)', text: 'Illegale handelingen of inbreuken zijn verboden.' },
      { title: 'Artikel 8 (Beperkingen)', text: 'Toegang kan worden beperkt bij schending.' },
      { title: 'Artikel 9 (Intellectueel Eigendom)', text: ['Alle intellectuele eigendomsrechten berusten bij de exploitant.', 'Ongeautoriseerde kopieën zijn verboden.'] },
      { title: 'Artikel 10 (Inhoud)', text: 'Het auteursrecht van door leden geplaatste inhoud berust bij het lid.' },
      { title: 'Artikel 11 (Aansprakelijkheid)', text: 'Geen aansprakelijkheid bij overmacht.' },
      { title: 'Artikel 12 (Toepasselijk recht)', text: 'Geregeerd door de wetten van de Republiek Korea.' }
    ]
  },
  pl: {
    title: 'Warunki korzystania z usługi',
    backBtn: 'Wróć',
    content: [
      { title: 'Artykuł 1 (Cel)', text: 'Niniejsze warunki określają zasady korzystania z serwisu.' },
      { title: 'Artykuł 2 (Definicje)', text: ['① "Użytkownik" oznacza zarejestrowaną osobę.'] },
      { title: 'Artykuł 3 (Rejestracja)', text: 'Wymagane jest podanie prawdziwych danych.' },
      { title: 'Artykuł 4 (Zarządzanie kontem)', text: 'Użytkownik odpowiada za swoje dane logowania.' },
      { title: 'Artykuł 5 (Korzystanie z usługi)', text: 'Usługa dostępna jest całą dobę.' },
      { title: 'Artykuł 6 (Zmiany)', text: 'Operator może modyfikować lub zakończyć świadczenie usługi.' },
      { title: 'Artykuł 7 (Obowiązki)', text: 'Zabrania się podejmowania działań niezgodnych z prawem.' },
      { title: 'Artykuł 8 (Ograniczenia)', text: 'Konto może zostać zablokowane w przypadku naruszeń.' },
      { title: 'Artykuł 9 (Własność intelektualna)', text: ['Wszelkie prawa własności należą do operatora.', 'Zabrania się kopiowania platformy.'] },
      { title: 'Artykuł 10 (Treści użytkownika)', text: 'Prawa autorskie do treści należą do użytkownika.' },
      { title: 'Artykuł 11 (Wyłączenie odpowiedzialności)', text: 'Brak odpowiedzialności w przypadku siły wyższej.' },
      { title: 'Artykuł 12 (Prawo właściwe)', text: 'Podlega prawu Republiki Korei.' }
    ]
  },
  tr: {
    title: 'Hizmet Şartları',
    backBtn: 'Geri Dön',
    content: [
      { title: 'Madde 1 (Amaç)', text: 'Bu şartlar hizmetin kullanımını düzenler.' },
      { title: 'Madde 2 (Tanımlar)', text: ['① "Üye", kaydını tamamlamış kullanıcıyı ifade eder.'] },
      { title: 'Madde 3 (Kayıt)', text: 'Doğru ve güncel bilgi verilmesi zorunludur.' },
      { title: 'Madde 4 (Hesap Yönetimi)', text: 'Üye, hesap güvenliğinden kendisi sorumludur.' },
      { title: 'Madde 5 (Hizmet Kullanımı)', text: 'Hizmet kesintisiz olarak sağlanır.' },
      { title: 'Madde 6 (Değişiklik)', text: 'İşletmeci hizmeti değiştirebilir veya sonlandırabilir.' },
      { title: 'Madde 7 (Yükümlülükler)', text: 'Yasadışı faaliyetlerde bulunmak yasaktır.' },
      { title: 'Madde 8 (Kısıtlamalar)', text: 'Kurallara uyulmadığı takdirde hesap kısıtlanabilir.' },
      { title: 'Madde 9 (Fikri Mülkiyet)', text: ['Fikri mülkiyet hakları işletmeciye aittir.', 'Platformun izinsiz kopyalanması yasaktır.'] },
      { title: 'Madde 10 (Üye İçeriği)', text: 'Üye tarafından oluşturulan içeriklerin telif hakkı üyeye aittir.' },
      { title: 'Madde 11 (Sorumluluk Reddi)', text: 'Mücbir sebeplerden ötürü sorumluluk kabul edilmez.' },
      { title: 'Madde 12 (Yetkili Mahkeme)', text: 'Kore Cumhuriyeti yasalarına tabidir.' }
    ]
  },
  uk: {
    title: 'Умови використання',
    backBtn: 'Назад',
    content: [
      { title: 'Стаття 1 (Мета)', text: 'Ці Умови регулюють права та обов’язки користувачів.' },
      { title: 'Стаття 2 (Визначення)', text: ['① «Користувач» — зареєстрована особа.'] },
      { title: 'Стаття 3 (Реєстрація)', text: 'Необхідно надавати достовірні дані.' },
      { title: 'Стаття 4 (Керування обліковим записом)', text: 'Користувач відповідає за безпеку свого облікового запису.' },
      { title: 'Стаття 5 (Використання послуг)', text: 'Сервіс доступний цілодобово.' },
      { title: 'Стаття 6 (Зміни)', text: 'Оператор може змінювати або припиняти роботу сервісу.' },
      { title: 'Стаття 7 (Обов’язки)', text: 'Заборонено вчиняти протиправні дії.' },
      { title: 'Стаття 8 (Обмеження)', text: 'Доступ може бути обмежений у разі порушень.' },
      { title: 'Стаття 9 (Інтелектуальна власність)', text: ['Усі права на платформу належать оператору.', 'Заборонено копіювати систему.'] },
      { title: 'Стаття 10 (Контент)', text: 'Авторські права на створений контент належать користувачеві.' },
      { title: 'Стаття 11 (Обмеження відповідальності)', text: 'Оператор не несе відповідальності за форс-мажорні обставини.' },
      { title: 'Стаття 12 (Законодавство)', text: 'Регулюється законодавством Республіки Корея.' }
    ]
  },
  sv: {
    title: 'Användarvillkor',
    backBtn: 'Tillbaka',
    content: [
      { title: 'Artikel 1 (Syfte)', text: 'Dessa villkor styr användningen av tjänsten.' },
      { title: 'Artikel 2 (Definitioner)', text: ['① "Medlem" avser en registrerad användare.'] },
      { title: 'Artikel 3 (Registrering)', text: 'Korrekt information måste lämnas.' },
      { title: 'Artikel 4 (Kontohantering)', text: 'Medlemmen ansvarar själv för sitt konto.' },
      { title: 'Artikel 5 (Användning)', text: 'Tjänsten tillhandahålls dygnet runt.' },
      { title: 'Artikel 6 (Ändringar)', text: 'Operatören kan ändra eller avsluta tjänsten.' },
      { title: 'Artikel 7 (Skyldigheter)', text: 'Olagliga aktiviteter är förbjudna.' },
      { title: 'Artikel 8 (Begränsningar)', text: 'Åtkomsten kan begränsas vid regelbrott.' },
      { title: 'Artikel 9 (Intellektuell egendom)', text: ['Alla rättigheter tillhör operatören.', 'Otillåten kopiering av plattformen är förbjuden.'] },
      { title: 'Artikel 10 (Innehåll)', text: 'Upphovsrätten för skapat innehåll tillhör medlemmen.' },
      { title: 'Artikel 11 (Ansvarsfriskrivning)', text: 'Inget ansvar vid force majeure.' },
      { title: 'Artikel 12 (Tillämplig lag)', text: 'Styrs av Republiken Koreas lagar.' }
    ]
  }
};
  
export default function TermsOfService() {
  const router = useRouter();
  const [lang, setLang] = useState('ko');
  
  // 1. 컴포넌트가 브라우저에 마운트되었는지 확인하는 상태
  const [isMounted, setIsMounted] = useState(false); 

  useEffect(() => {
    // 2. 브라우저에서 실행될 때 localStorage에서 값을 가져옴
    const savedLang = localStorage.getItem('app_language');
    if (savedLang) {
      setLang(savedLang);
    }
    // 3. 로컬스토리지 확인이 끝나면 마운트 완료 상태로 변경
    setIsMounted(true); 
  }, []);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLang = e.target.value;
    setLang(selectedLang);
    localStorage.setItem('app_language', selectedLang);
  };

  // 4. 브라우저에 마운트되기 전(서버 렌더링 시점)에는 아무것도 렌더링하지 않음 (깜빡임 및 초기화 방지)
  if (!isMounted) {
    return null; // 화면이 렌더링되기 전 아주 짧은 순간 빈 화면을 반환합니다.
  }

  const currentTerms = termsTranslations[lang] || termsTranslations.ko;

  const handleBack = () => {
    router.push('/signup');
  };  

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* 상단 언어 선택 영역 */}
      <div className="w-full flex justify-end">
        <select 
          value={lang} 
          onChange={handleLanguageChange}
          className="border rounded-md px-3 py-1.5 text-sm bg-white text-black shadow-sm"
        >
          <option value="ko">한국어</option>
          <option value="en">English</option>
          <option value="ja">日本語</option>
          <option value="zh">中文</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
          <option value="vi">Tiếng Việt</option>
          <option value="th">ไทย</option>
          <option value="id">Bahasa Indonesia</option>
          <option value="ru">Русский</option>
          <option value="pt">Português</option>
          <option value="it">Italiano</option>
          <option value="ar">العربية</option>
          <option value="hi">हिन्दी</option>
          <option value="nl">Nederlands</option>
          <option value="pl">Polski</option>
          <option value="tr">Türkçe</option>
          <option value="uk">Українська</option>
          <option value="sv">Svenska</option>
        </select>
      </div>

      {/* 약관 제목 및 내용 표시 영역 */}
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-center mb-6">{currentTerms.title}</h1>
        
        <div className="space-y-6 text-sm leading-relaxed text-gray-700 bg-white p-6 rounded-lg border shadow-sm">
          {currentTerms.content.map((section, index) => (
            <div key={index} className="space-y-2">
              <h2 className="font-semibold text-base text-gray-900">{section.title}</h2>
              {Array.isArray(section.text) ? (
                section.text.map((paragraph, pIdx) => (
                  <p key={pIdx} className="pl-2">{paragraph}</p>
                ))
              ) : (
                <p>{section.text}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 화면 가장 아래, 정중앙에 위치한 돌아가기 버튼 */}
      <div className="w-full flex justify-center pt-4 pb-8">
        <button
          onClick={handleBack}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-colors"
        >
          {currentTerms.backBtn}
        </button>
      </div>
    </div>
  );
}