# ===============================
# FastAPI core
# ===============================
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ===============================
# 환경 설정
# ===============================
import os
os.environ["LOKY_MAX_CPU_COUNT"] = "4"

from config.settings import settings
print("🔥 SERVER SECRET_KEY =", settings.SECRET_KEY)
print("🚀 DATABASE_URL =", settings.DATABASE_URL)

# ===============================
# 라우터 import
# ===============================
# 사용자
from routes.users.auth_route import router as auth_router
# from routes.users.admin_route import router as admin_router
from routes.users.profile_route import router as profile_router

# 관리자 로그
# from routes.admin_log_route import router as admin_log_router

# 구독 / 비디오
from routes import subscription_route, video_route

# AI / 루틴 / 코칭 / 활동
from routes.ai import router as ai_router
from api.routine_recommendation import router as routine_router
from api.coaching import router as coaching_router
from api.activity import router as activity_router

# iOS HealthKit
from ios.health import router as ios_router

# ===============================
# FastAPI 앱 생성
# ===============================
app = FastAPI(
    title="AI Trainer Backend",
    description="FastAPI backend for AI 홈트레이닝 서비스",
    version="1.0.0"
)

# ===============================
# CORS 설정
# ===============================
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://192.168.0.12:3000",
    "http://192.168.0.27:3000",
    "http://192.168.0.18:3000",
    "http://192.168.0.6:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",  # 개발 단계 전체 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===============================
# 라우터 등록
# ===============================

# iOS HealthKit (prefix는 health.py 내부에 정의됨)
app.include_router(ios_router)

# 사용자 인증 / 프로필
app.include_router(auth_router, prefix="/web/users", tags=["users"])
app.include_router(profile_router, tags=["users"])

# 구독 / 비디오
app.include_router(subscription_route.router, prefix="/web/subscription", tags=["subscription"])
app.include_router(video_route.router, prefix="/web/video", tags=["video"])

# 관리자
# app.include_router(admin_router, prefix="/admin", tags=["admin"])
# app.include_router(admin_log_router, prefix="/admin", tags=["admin"])

# AI / 운동 관련
app.include_router(ai_router, prefix="/ai", tags=["ai"])
app.include_router(routine_router, tags=["routine"])
app.include_router(coaching_router, tags=["coaching"])
app.include_router(activity_router, tags=["activity"])

# ===============================
# 테스트용 루트 엔드포인트
# ===============================
@app.get("/")
def root():
    return {
        "status": "server running",
        "service": "AI Trainer Backend",
        "web_endpoints": "/web/*",
        "admin_endpoints": "/admin/*",
        "ios_endpoints": "/ios/*",
    }

# ===============================
# uvicorn 실행
# ===============================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
