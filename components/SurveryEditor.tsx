'use client';

import React, { useState } from 'react';
import { SURVEY_MODES } from './constants';

type ModeKey = keyof typeof SURVEY_MODES;

export default function SurveryEditor() {
  const [shareUrl, setShareUrl] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  
  const [selectedMode, setSelectedMode] = useState<ModeKey>('create');
  // ★ 다국어 선택을 위한 상태 추가 (기본값: 'ko')
  const [selectedLang, setSelectedLang] = useState('ko'); 

  // 지원할 19개(일부 예시) 언어 목록
    
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

  // ★ 선택한 모드와 '언어'를 반영하여 URL 및 QR 생성
  const handleGenerateShareUrl = (newId: string, modeKey: ModeKey, langCode: string) => {
    // 1. constants.ts에 정의된 URL 가져오기 (예: .../create?lang=ko)
    const baseModeUrl = SURVEY_MODES[modeKey].url;

    // 2. URL 객체 생성
    const urlObject = new URL(baseModeUrl);

    // 3. 경로 뒤에 고유 ID 추가
    urlObject.pathname = `${urlObject.pathname}/s/${newId}`;

    // 4. ★ 핵심: 기존에 있던 lang 파라미터를 사용자가 선택한 언어 코드로 덮어씌우기
    // 만약 기존 주소가 ?lang=ko 였다면, 영어를 선택했을 때 ?lang=en 으로 깔끔하게 바뀝니다.
    urlObject.searchParams.set('lang', langCode);

    // 5. 최종 완성된 URL
    const uniqueUrl = urlObject.toString();
    setShareUrl(uniqueUrl);

    // 6. QR 코드 생성
    const qrApi = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(uniqueUrl)}`;
    setQrCodeUrl(qrApi);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '500px', margin: '0 auto', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
        다국어 퀴즈 & 설문 생성기
      </h2>

      {/* 모드 선택 */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
          생성 모드 선택
        </label>
        <select
          value={selectedMode}
          onChange={(e) => setSelectedMode(e.target.value as ModeKey)}
          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
        >
          <option value="create">{SURVEY_MODES.create.name}</option>
          <option value="textCreate">{SURVEY_MODES.textCreate.name}</option>
          <option value="upgrade">{SURVEY_MODES.upgrade.name}</option>
        </select>
      </div>

      {/* ★ 언어 선택 드롭다운 추가 */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
          설문 언어 선택
        </label>
        <select
          value={selectedLang}
          onChange={(e) => setSelectedLang(e.target.value)}
          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      {/* 설문 생성 버튼 (테스트 고유 ID: c6e479669283) */}
      <button
        onClick={() => handleGenerateShareUrl('c6e479669283', selectedMode, selectedLang)}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#2563eb',
          color: '#ffffff',
          fontWeight: 'bold',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      >
        선택한 언어로 설문 & QR 생성
      </button>

      {/* 결과 화면 */}
      {shareUrl && (
        <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>생성 완료!</h3>
          
          <div style={{ marginBottom: '16px', wordBreak: 'break-all' }}>
            <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>고유 링크</span>
            <a href={shareUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: '600' }}>
              {shareUrl}
            </a>
          </div>

          {qrCodeUrl && (
            <div>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '8px' }}>스마트폰 스캔용 QR 코드</span>
              <img 
                src={qrCodeUrl} 
                alt="Survey QR Code" 
                style={{ margin: '0 auto', borderRadius: '8px', border: '1px solid #e5e7eb' }} 
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}