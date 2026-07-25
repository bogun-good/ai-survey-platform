from datetime import datetime, timedelta
import bcrypt
from database import get_db
from fastapi import APIRouter, Depends, HTTPException, status
from jose import JWTError, jwt
# models.py에 TermsAgreementLog가 추가되어 있어야 합니다.
from models import User, TermsAgreementLog, UserCreate, UserLogin, AgreementModel 
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/api/auth", tags=["Auth"])

SECRET_KEY = "your-super-secret-key-change-it"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# --- 요청 스키마 정의 ---
class FindEmailRequest(BaseModel):
    name: str
    phone: str

class ResetPasswordRequest(BaseModel):
    email: EmailStr  # 이메일로 변경
    name: str        # 본인 확인을 위한 추가 정보 (이름)
    phone: str       # 본인 확인을 위한 추가 정보 (전화번호)
    new_password: str


def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode("utf-8"), hashed_password.encode("utf-8")
    )


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def mask_email(email: str) -> str:
    """이메일 주소 마스킹 (예: abcdef@naver.com -> ab****@naver.com)"""
    try:
        username, domain = email.split("@")
        if len(username) <= 2:
            masked_username = username[0] + "*"
        else:
            masked_username = username[:2] + "*" * (len(username) - 2)
        return f"{masked_username}@{domain}"
    except Exception:
        return email


# --- [1] 회원가입 함수 ---
@router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(
    user_data: UserCreate, db: Session = Depends(get_db)
):
    # 1. 필수 약관 동의 여부 서버 측 이중 검증
    agreements = user_data.agreements
    if not (
        agreements.termsOfService
        and agreements.privacyPolicy
        and agreements.aiContentNotice
        and agreements.ageRestriction
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="모든 필수 약관 및 정책에 동의해야 합니다.",
        )

    # 2. 이메일 중복 확인
    existing_user = (
        db.query(User).filter(User.username == user_data.username).first()
    )
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 사용 중인 이메일입니다.",
        )

    # 동의 시간 파싱 (문자열 -> datetime 객체)
    try:
        agreed_at_dt = datetime.fromisoformat(agreements.agreedAt.replace('Z', '+00:00'))
    except ValueError:
        agreed_at_dt = datetime.utcnow()

    try:
        # 3. 비밀번호 암호화 후 새 사용자 생성
        hashed_password = get_password_hash(user_data.password)
        new_user = User(username=user_data.username, password_hash=hashed_password)

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # 4. 법적 방어력을 위한 약관 동의 이력 저장
        agreement_log = TermsAgreementLog(
            user_id=new_user.user_id,
            terms_of_service=agreements.termsOfService,
            privacy_policy=agreements.privacyPolicy,
            ai_content_notice=agreements.aiContentNotice,
            age_restriction=agreements.ageRestriction,
            agreed_at=agreed_at_dt
        )
        db.add(agreement_log)
        db.commit()

        return {
            "message": "회원가입이 완료되었습니다.",
            "user_id": new_user.user_id,
            "username": new_user.username,
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"회원가입 처리 중 오류가 발생했습니다: {str(e)}"
        )


# --- [2] 로그인 함수 ---
@router.post("/login")
def login(
    user_data: UserLogin, db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == user_data.username).first()
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="이메일 또는 비밀번호가 올바르지 않습니다.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user.username})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.user_id,
        "username": user.username,
    }


# --- [3] 이메일 찾기 함수 ---
@router.post("/find-email")
def find_user_email(request_data: FindEmailRequest, db: Session = Depends(get_db)):
    """
    이름과 전화번호를 받아 일치하는 회원의 이메일(username)을 찾아 마스킹 처리하여 반환합니다.
    """
    user = db.query(User).filter(User.name == request_data.name, User.phone == request_data.phone).first()
    
    if user:
        masked = mask_email(user.username)
        return {"success": True, "email": masked}
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="일치하는 회원 정보를 찾을 수 없습니다."
        )


# --- [4] 비밀번호 재설정 함수 (이메일 기준) ---
@router.post("/reset-password")
def reset_password(request_data: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    가입된 이메일 주소와 본인 확인 정보(이름, 전화번호)를 대조한 뒤, 새로운 비밀번호로 재설정합니다.
    """
    user = db.query(User).filter(
        User.username == request_data.email,  # 이메일(username) 매칭
        User.name == request_data.name,
        User.phone == request_data.phone
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="입력하신 이메일 및 회원 정보가 일치하지 않습니다."
        )
    
    try:
        # 새로운 비밀번호를 암호화하여 업데이트
        user.password_hash = get_password_hash(request_data.new_password)
        db.commit()
        return {"success": True, "message": "비밀번호가 성공적으로 변경되었습니다."}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"비밀번호 변경 중 오류가 발생했습니다: {str(e)}"
        )