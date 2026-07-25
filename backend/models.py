from datetime import datetime
from pydantic import BaseModel
from sqlalchemy import Column, DateTime, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import declarative_base, relationship
from .database import Base  # 프로젝트 구조에 따른 import 경로 확인

# --- 1. SQLAlchemy 모델 (DB 테이블) ---

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String, unique=True, index=True, nullable=False)  # 아이디
    password_hash = Column(String, nullable=False)  # 암호화된 비밀번호 저장
    created_at = Column(DateTime, default=datetime.utcnow)

    # 약관 동의 이력과의 관계 설정 (1:N)
    agreements = relationship("TermsAgreementLog", back_populates="user", cascade="all, delete-orphan")


class TermsAgreementLog(Base):
    __tablename__ = "terms_agreement_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    
    terms_of_service = Column(Boolean, nullable=False)   # 1. 이용약관 동의
    privacy_policy = Column(Boolean, nullable=False)      # 2. 개인정보 처리방침 동의
    ai_content_notice = Column(Boolean, nullable=False)  # 3. AI 생성 콘텐츠 면책 고지 동의
    age_restriction = Column(Boolean, nullable=False)    # 4. 만 14세 이상 확인
    
    agreed_at = Column(DateTime, nullable=False)         # 사용자가 동의 버튼을 누른 시점 (클라이언트 전송값)
    created_at = Column(DateTime, default=datetime.utcnow) # DB에 실제로 적재된 시간

    # User 모델과 양방향 관계 설정
    user = relationship("User", back_populates="agreements")


class Survey(Base):
    __tablename__ = "surveys"

    survey_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, nullable=False) # 작성자 ID
    title = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


# --- 2. Pydantic 스키마 (요청/응답 데이터 검증) ---

# 프론트엔드의 agreements 객체 구조와 매칭되는 스키마
class AgreementModel(BaseModel):
    termsOfService: bool
    privacyPolicy: bool
    aiContentNotice: bool
    ageRestriction: bool
    agreedAt: str  # ISO 8601 문자열 형식의 동의 시간


# 기존 UserCreate 스키마에 약관 동의 데이터를 필수로 포함하도록 수정
class UserCreate(BaseModel):
    username: str
    password: str
    agreements: AgreementModel  # 회원가입 요청 시 약관 동의 데이터 함께 수신


class UserLogin(BaseModel):
    username: str
    password: str
    
class SurveyCreate(BaseModel):
    title: str
    description: str | None = None

class SurveyResponse(BaseModel):
    survey_id: int
    user_id: int
    title: str
    description: str | None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True  # Pydantic v2 기준 (만약 pydantic v1이라면 orm_mode = True 사용)