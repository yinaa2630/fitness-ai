# FastAPI import
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# ===============================
# 🔥 라우터 import
# ===============================
from routes.users.auth_route import router as auth_router
from routes.users.admin_route import router as admin_router
from routes.users.profile_route import router as profile_router
from routes.admin_log_route import router as admin_log_router
from routes.ai import router as ai_router
from api.routine_recommendation import router as routine_router
from api.coaching import router as coaching_router
from api.activity import router as activity_router
from routes import subscription_route, video_route
# ⭐ iOS Health API 추가
from ios.health import router as ios_router
# ===============================
# 🔥 시크릿 키 출력
# ===============================
from config.settings import settings
print("🔥 SERVER SECRET_KEY =", settings.SECRET_KEY)

from dotenv import load_dotenv
import os

os.environ["LOKY_MAX_CPU_COUNT"] = "4"

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE_DIR, ".env"))
# ===============================
# 🔥 FastAPI 앱 생성
# ===============================
app = FastAPI(
    title="AI Trainer Backend",
    description="FastAPI backend for AI 홈트레이닝 서비스",
    version="1.0.0"
)
# ===============================
# 🔥 CORS 설정 (192.168.0.27:3000 추가)
# ===============================
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.0.12:3000",
    "http://192.168.0.27:3000",
    "http://192.168.0.18:3000", 
    "http://localhost:5173",
    "http://192.168.0.6:5173",
]
app.add_middleware(
    CORSMiddleware,
    # allow_origins=origins,
    # allow_origins=["*"],
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ===============================
# 🔥 라우터 등록
# ===============================
# ⭐ iOS HealthKit 업로드 라우터
# prefix는 health.py에 이미 prefix="/ios" 적혀 있어서 여기서는 prefix 사용 ❌
app.include_router(ios_router)
# ✔ 회원가입 / 로그인 / me
app.include_router(auth_router, prefix="/web/users")
# ✔ 구독 기능
app.include_router(subscription_route.router, prefix="/web/subscription")
# ✔ 비디오 기능
app.include_router(video_route.router, prefix="/web/video")
# ✔ 프로필 조회/수정
app.include_router(profile_router)
# ✔ 관리자 API (유저 관리)
app.include_router(admin_router, prefix="/admin")
# ✔ 관리자 로그 API
app.include_router(admin_log_router, prefix="/admin")

app.include_router(ai_router, prefix="/ai", tags=["ai"])

app.include_router(routine_router)
app.include_router(coaching_router)
app.include_router(activity_router)
# ===============================
# 🔥 테스트용 루트 엔드포인트
# ===============================
@app.get("/")
def root():
    return {
        "status": "server running",
        "service": "AI Trainer Backend",
        "web_endpoints": "/web/*",
        "admin_endpoints": "/admin/*",
        "ios_endpoints": "/ios/*"
    }
# ===============================
# 🔥 uvicorn 실행
# ===============================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
