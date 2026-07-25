from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # CORS 미들웨어 추가
from database import engine
import models

# 라우터들 불러오기
from auth import router as auth_router
from survey import router as survey_router  # 새로 만든 survey 라우터 가져오기

# 데이터베이스 테이블 생성
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Survey Platform API")

# --- CORS 설정 추가 (프론트엔드 연동을 위해 필수) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js 프론트엔드 주소 허용
    allow_credentials=True,
    allow_methods=["*"],  # 모든 HTTP 메서드(GET, POST 등) 허용
    allow_headers=["*"],  # 모든 헤더 허용
)

# --- 라우터 등록 ---
app.include_router(auth_router)
app.include_router(survey_router)  # survey 라우터 등록


@app.get("/")
def root():
    return {"message": "AI Survey Platform Backend is running!"}