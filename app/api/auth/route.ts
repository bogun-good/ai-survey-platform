import { NextResponse } from 'next/server';

// 회원가입된 정보 및 기본 테스트 계정이 담기는 임시 배열
let users: any[] = [
  { id: 1, username: 'test@test.com', email: 'test@test.com', password: '1234' }
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, username, email, password } = body;

    // 0. 이메일 중복 및 유효성 검증 로직
    if (action === 'check-email') {
      if (!email) {
        return NextResponse.json({ message: '이메일을 입력해 주세요.' }, { status: 400 });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json({ message: '올바른 이메일 형식이 아닙니다.' }, { status: 400 });
      }

      const isDuplicate = users.some((u) => u.email === email);
      if (isDuplicate) {
        return NextResponse.json({ isAvailable: false, message: '이미 사용 중인 이메일입니다.' }, { status: 200 });
      }

      return NextResponse.json({ isAvailable: true, message: '사용 가능한 이메일입니다.' }, { status: 200 });
    }

    // 1. 로그인 요청 처리
    if (action === 'login') {
      const loginEmail = email || username;
      
      // 디버깅용 콘솔 로그 (현재 상태 및 시도하는 값 확인)
      console.log('현재 등록된 유저 목록:', users);
      console.log('로그인 시도하는 이메일/비번:', loginEmail, password);

      const user = users.find(u => u.email === loginEmail && u.password === password);
      
      if (user) {
        return NextResponse.json(
          { access_token: 'fake-jwt-token-12345', message: '로그인 성공!' },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          { error: '이메일 또는 비밀번호가 일치하지 않습니다.' },
          { status: 401 }
        );
      }
    }

    // 2. 회원가입 로직
    if (action === 'register') {
      if (!email || !password) {
        return NextResponse.json({ error: '이메일과 비밀번호를 입력해주세요.' }, { status: 400 });
      }

      const exists = users.find(u => u.email === email);
      if (exists) {
        return NextResponse.json({ error: '이미 존재하는 이메일입니다.' }, { status: 400 });
      }

      users.push({ id: Date.now(), username: email, email, password });
      return NextResponse.json({ message: '회원가입이 완료되었습니다.' }, { status: 200 });
    }

    // 3. 비밀번호 재설정 링크 요청 로직 (이메일 발송 시뮬레이션)
    if (action === 'request-password-reset') {
      if (!email) {
        return NextResponse.json({ error: '이메일을 입력해주세요.' }, { status: 400 });
      }

      const userExists = users.some(u => u.email === email);
      
      if (userExists) {
        console.log(`[메일 발송 시뮬레이션] ${email} 로 재설정 링크가 발송되었습니다.`);
        return NextResponse.json({ 
          message: '입력하신 이메일로 비밀번호 재설정 링크를 발송했습니다. 메일함을 확인해주세요.' 
        }, { status: 200 });
      }
      
      return NextResponse.json({ error: '가입되지 않은 이메일입니다.' }, { status: 404 });
    }

    // 매칭되는 action이 없을 경우
    return NextResponse.json(
      { error: '알 수 없는 요청입니다.' },
      { status: 400 }
    );

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: '서버 내부 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}