# 외부 모듈 import
from services.hashing_service import verify_password
from models.users_model import get_user_by_email

# 로그인 처리 함수
def login_user(data: dict, db):
    """
    로그인 로직:
    1. 이메일로 사용자 조회
    2. 비밀번호 검증
    """

    print("\n🟦 [LOGIN_USER] 로그인 시도:", data)   # 디버깅 로그

    # 1. 이메일 기준 유저 조회
    user = get_user_by_email(db, data["email"])
    print("🟩 [LOGIN_USER] 조회된 유저:", user)

    if not user:
        print("❌ [LOGIN_USER] 존재하지 않는 이메일")
        return {"error": "등록되지 않은 이메일입니다."}

    # 2. 비밀번호 검증
    if not verify_password(data["password"], user["password_hash"]):
        print("❌ [LOGIN_USER] 비밀번호 불일치")
        return {"error": "비밀번호가 올바르지 않습니다."}

    # ---------------------------------------------
    # ❌ role 관련 로직 전부 비활성화
    # ---------------------------------------------
    # if user["email"] == "admin@test.com":
    #     role_value = True
    #     print("🟨 [LOGIN_USER] SUPER ADMIN 로그인")
    # else:
    #     role_value = bool(user["role"])
    #     print("🟦 [LOGIN_USER] 일반 사용자 role 값:", role_value)
    # ---------------------------------------------

    print("🟩 [LOGIN_USER] 로그인 성공")

    return {
        "id": user["id"],
        "email": user["email"],
        "name": user["name"],
        # "role": role_value  # ❌ 사용 안 함
    }
