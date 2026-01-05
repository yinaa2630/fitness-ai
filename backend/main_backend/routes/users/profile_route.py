# FastAPI 관련 import
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from sqlalchemy import text

# DB 연결
from db.database import get_db

# 인증
from services.oauth2_service import get_current_user

# 모델 함수 import
from models.users_model import get_user_by_email
from models.user_body_model import get_body_info, update_body_info
from models.user_info_model import get_user_info, update_user_info as update_info


# -----------------------------
# 사용자 프로필 라우터 생성
# -----------------------------
router = APIRouter(
    prefix="/web/users",
    tags=["users"]
)


# =============================
# 🔵 1) 내 정보 조회
# =============================
@router.get("/me")
async def get_my_info(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = get_user_by_email(db, current_user["email"])
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    user_id = user["id"]

    # body_info 조회
    body = get_body_info(db, user_id) or {}

    # user_info 조회
    info = get_user_info(db, user_id) or {}

    # 날짜 변환
    created_at = user.get("created_at")
    if created_at:
        created_at = str(created_at)[:10]

    # ✅ 프론트에서 바로 쓰는 구조로 반환
    return {
        "name": user.get("name"),
        "email": user.get("email"),
        "phone": user.get("phone"),
        "age": user.get("age"),
        "gender": user.get("gender"),
        "goal": user.get("goal"),
        "avatar": user.get("avatar"),

        # 🔥 핵심 (프론트 state와 동일)
        "height_cm": body.get("height_cm"),
        "weight_kg": body.get("weight_kg"),
        "bmi": body.get("bmi"),

        "dailyTime": info.get("dailytime"),
        "weekly": info.get("weekly"),
        "activity": info.get("activity"),
        "targetPeriod": info.get("targetperiod"),
        "intro": info.get("intro"),
        "prefer": info.get("prefer") or [],

        "created_at": created_at
    }


# =============================
# 🔵 2) 내 정보 수정
# =============================
@router.put("/update")
async def update_user_all(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
    body: dict = Body(...)
):
    print("11111111111111111")
    user = get_user_by_email(db, current_user["email"])
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    user_id = user["id"]

    # ----------------------------------------
    # 1️⃣ users 테이블 업데이트
    # ----------------------------------------
    user_fields = {}
    for key in ["name", "email", "phone", "age", "gender", "goal", "avatar"]:
        if key in body:
            user_fields[key] = body[key]

    if user_fields:
        set_clause = ", ".join(f"{k} = :{k}" for k in user_fields)
        query = text(f"""
            UPDATE public.users
            SET {set_clause}
            WHERE id = :id
        """)
        db.execute(query, {**user_fields, "id": user_id})
        db.commit()

    # ----------------------------------------
    # 2️⃣ user_info 테이블 업데이트
    # ----------------------------------------
    info_fields = {}
    for key in ["dailyTime", "weekly", "activity", "targetPeriod", "intro", "prefer"]:
        if key in body:
            info_fields[key] = body[key]

    if info_fields:
        update_info(db, user_id, info_fields, insert_if_missing=True)

    # ----------------------------------------
    # 3️⃣ user_body_info 업데이트 (🔥 핵심)
    # ----------------------------------------
    body_fields = {}

    height = body.get("height")
    weight = body.get("weight")

    if height is not None:
        body_fields["height_cm"] = float(height)

    if weight is not None:
        body_fields["weight_kg"] = float(weight)

    # BMI 계산
    if height and weight:
        body_fields["bmi"] = round(
            float(weight) / ((float(height) / 100) ** 2), 1
        )

    if body_fields:
        update_body_info(db, user_id, body_fields, insert_if_missing=True)

    return {"message": "프로필 업데이트 완료", "data":body_fields}


# =============================
# 🔵 3) 계정 삭제
# =============================
@router.delete("/delete")
async def delete_my_account(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = get_user_by_email(db, current_user["email"])
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    db.execute(
        text("DELETE FROM public.users WHERE id = :id"),
        {"id": user["id"]}
    )
    db.commit()

    return {"message": "계정 삭제 완료"}
