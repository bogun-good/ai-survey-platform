# backend/survey.py
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from database import get_db
from models import Survey, SurveyCreate, User
from auth import SECRET_KEY, ALGORITHM

router = APIRouter(prefix="/api/surveys", tags=["Surveys"])

# JWT 토큰을 검증하고 현재 로그인한 사용자 정보를 가져오는 함수
def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="토큰이 없습니다.")
    
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="유효하지 않은 토큰입니다.")
    except JWTError:
        raise HTTPException(status_code=401, detail="토큰 검증에 실패했습니다.")
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=401, detail="사용자를 찾을 수 없습니다.")
    return user

# --- 설문지 생성 API ---
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_survey(
    survey_data: SurveyCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user) # 로그인한 사용자만 접근 가능
):
    new_survey = Survey(
        title=survey_data.title,
        description=survey_data.description,
        user_id=current_user.user_id  # 토큰에서 추출한 사용자 ID 자동 매핑
    )
    db.add(new_survey)
    db.commit()
    db.refresh(new_survey)
    
    return new_survey