from fastapi import HTTPException
from services.hashing_service import password_hash
from models.users_model import get_user_by_email, insert_user
from models.user_body_model import insert_body_info


def register_user(user_data: dict, db):

    # 1️⃣ 이메일 중복 체크
    existing = get_user_by_email(db, user_data["email"])
    if existing:
        raise HTTPException(status_code=400, detail="이미 존재하는 이메일입니다.")

    try:
        # 2️⃣ 비밀번호 해싱
        hashed_pw = password_hash(user_data["password"])

        # 3️⃣ users 테이블 INSERT (commit ❌)
        new_user_id = insert_user(
            db,
            user_data["email"],
            user_data["name"],
            hashed_pw,
            user_data.get("goal")
        )

        # 4️⃣ user_body_info 기본 row 생성
        insert_body_info(
            db,
            user_id=new_user_id,
            height_cm=0,
            weight_kg=0,
            bmi=0
        )

        # 5️⃣ 여기서 한 번만 commit ✅
        db.commit()

        return {
            "id": new_user_id,
            "email": user_data["email"],
            "name": user_data["name"]
        }

    except Exception as e:
        db.rollback()
        print("❌ REGISTER ERROR:", e)
        raise HTTPException(status_code=500, detail="회원가입 중 오류가 발생했습니다.")
