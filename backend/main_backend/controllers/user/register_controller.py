from fastapi import HTTPException
from services.hashing_service import password_hash
from models.users_model import get_user_by_email, insert_user
from models.user_body_model import insert_body_info


def register_user(user_data: dict, db):

    # 1) 이메일 중복 체크
    existing = get_user_by_email(db, user_data["email"])
    if existing:
        # ❌ return 말고 예외로 던져야 프론트에서 에러로 인식함
        raise HTTPException(status_code=400, detail="이미 존재하는 이메일입니다.")

    try:
        # 2) 비밀번호 해싱
        hashed_pw = password_hash(user_data["password"])

        # 3) users 테이블에 사용자 생성
        # ⚠️ insert_user 안에 db.commit() 반드시 있어야 함
        new_user_id = insert_user(
            db,
            user_data["email"],
            user_data["name"],
            hashed_pw,
            user_data.get("goal")
        )

        # 4) user_body_info에 기본 row 생성
        # ⚠️ height / weight NOT NULL이면 기본값 있어야 함
        insert_body_info(
    db,
    user_id=new_user_id,
    height_cm=0,
    weight_kg=0,
    bmi=0
)


        # 5) 성공 응답
        return {
            "id": new_user_id,
            "email": user_data["email"],
            "name": user_data["name"]
        }

    except Exception as e:
        # 🔥 중간에 뭐라도 터지면 DB 롤백
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
