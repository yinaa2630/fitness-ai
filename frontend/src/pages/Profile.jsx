import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Mail,
  Calendar,
  Edit3,
  Home,
  Camera,
  Save,
  X,
  Trash2,
} from "lucide-react";
import "../styles/Profile.css";
import { deleteUser, getMyInfo, updateMyInfo } from "../api/users";

export default function Profile() {
  const fileRef = useRef(null);

  const [editing, setEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains("dark-mode"));
  }, []);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    birthdate: "",
    height_cm: "",
    weight_kg: "",
    body_fat: "",
    skeletal_muscle: "",
    bmr: "",
    water: "",
    visceral_fat_level: "",
    intro: "",
    avatar: "",
    created_at: "",
  });
  const [editData, setEditData] = useState(profile);

  /* ------------------------------------------
      프로필 불러오기
  ------------------------------------------- */
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMyInfo();
        console.log("📥 프로필 데이터 로드:", data); // 디버깅용

        console.log("===== ✅ 매핑된 데이터 =====");
        console.log(JSON.stringify(data, null, 2));
        console.log("============================");

        setProfile(data);
        setEditData(data);
        // setAvatarPreview(mappedData.avatar || null);
      } catch (err) {
        alert("유저 정보 가져오기에 실패하였습니다.");
        window.location.href = "/login";
        console.error("프로필 로드 실패:", err);
      }
    };
    load();
    console.log(profile);
  }, []);

  /* ------------------------------------------
      BMI 계산
  ------------------------------------------- */
  const bmi = () => {
    const height = parseFloat(editData.height_cm);
    const weight = parseFloat(editData.weight_kg);

    if (!height || !weight || height <= 0 || weight <= 0) return "-";

    return (weight / (height / 100) ** 2).toFixed(1);
  };

  /* ------------------------------------------
      변경 핸들러
  ------------------------------------------- */
  const change = (field, value) => {
    console.log(`🔄 필드 변경: ${field} = ${value}`);
    setEditData({ ...editData, [field]: value });
  };

  /* ------------------------------------------
      저장하기
  ------------------------------------------- */
  const handleSave = async () => {
    // if (!token) {
    //   alert("로그인이 필요합니다. 다시 로그인해주세요.");
    //   window.location.href = "/login";
    //   return;
    // }
    setIsLoading(true);

    try {
      const updated = {
        name: editData.name || null,
        email: editData.email || null,
        birthdate: editData.birthdate || null,
        height_cm: editData.height_cm ? parseFloat(editData.height_cm) : null,
        weight_kg: editData.weight_kg ? parseFloat(editData.weight_kg) : null,
        body_fat: editData.body_fat ? parseFloat(editData.body_fat) : null,
        skeletal_muscle: editData.skeletal_muscle
          ? parseFloat(editData.skeletal_muscle)
          : null,
        bmr: editData.bmr ? parseInt(editData.bmr) : null,
        water: editData.water ? parseFloat(editData.water) : null,
        visceral_fat_level: editData.visceral_fat_level
          ? parseInt(editData.visceral_fat_level)
          : null,
        intro: editData.intro || null,
        avatar: avatarPreview || null,
      };

      console.log("===== 📤 서버로 전송할 데이터 =====");
      console.log(JSON.stringify(updated, null, 2));
      let data = await updateMyInfo(updated);
      data = data?.data;
      console.log("data", data);
      // 저장 후 최신 데이터 다시 로드
      const res = await getMyInfo();
      console.log("=== DB에서 다시 로드된 데이터 ===");

      // console.log("reloadRes", reloadRes);
      // const profileData = {
      //   id: reloadRes.id,
      //   name: reloadRes.name,
      //   email: reloadRes.email,
      // };
      // 백엔드에서 height, weight로 올 경우를 대비해 변환
      const reloadedData = {
        ...res,
        height_cm: data.height_cm || data.height || "",
        weight_kg: data.weight_kg || data.weight || "",
      };
      setProfile(reloadedData);
      setEditData(reloadedData);
      setAvatarPreview(reloadedData.avatar || null);

      setEditing(false);
      alert("저장 완료!");
    } catch (err) {
      console.error("❌ 저장 실패:", err);
      console.error("Response status:", err.response?.status);
      console.error("Response data:", err.response?.data);
      if (err.response?.status === 401) {
        alert("인증이 만료되었습니다. 다시 로그인해주세요.");
        localStorage.clear();
        window.location.href = "/login";
        return;
      }

      alert(`저장 실패: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  /* ------------------------------------------
      계정 삭제
  ------------------------------------------- */
  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await deleteUser();
      alert("계정이 삭제되었습니다.");
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/login";
    } catch (err) {
      console.error("❌ 삭제 실패:", err);
      alert("삭제 실패");
    }
  };

  /* ------------------------------------------
      아바타 업로드
  ------------------------------------------- */
  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      console.log("🖼️ 아바타 업로드:", reader.result.substring(0, 50) + "...");
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const defaultAvatar = isDarkMode
    ? "/default-avatar-dark.png"
    : "/default-avatar-light.png";

  /* ===================================================================
        RENDER
  =================================================================== */
  return (
    <div className="profile-wrapper">
      <div className="profile-container">
        <div className="profile-main">
          {/* ------------ LEFT CARD ------------ */}
          <aside className="profile-left-card">
            <div className="avatar">
              <img
                src={avatarPreview || profile.avatar || defaultAvatar}
                className="avatar-img"
                alt="avatar"
              />

              {editing && (
                <button
                  className="avatar-edit"
                  onClick={() => fileRef.current.click()}
                >
                  <Camera size={18} />
                </button>
              )}

              <input
                type="file"
                ref={fileRef}
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleAvatar}
              />
            </div>

            <div className="profile-info-box">
              <label className="info-title">
                <User size={14} /> 이름
              </label>
              {editing ? (
                <input
                  className="info-input"
                  value={editData.name || ""}
                  onChange={(e) => change("name", e.target.value)}
                  placeholder="이름을 입력하세요"
                />
              ) : (
                <p className="info-value">
                  {profile.name ? profile.name : "-"}
                </p>
              )}

              {/* <label className="info-title">소개</label>
              {editing ? (
                <textarea
                  className="info-input"
                  rows={3}
                  value={editData.intro || ""}
                  onChange={(e) => change("intro", e.target.value)}
                  placeholder="소개를 입력하세요"
                />
              ) : (
                <p className="info-value">{profile.intro || "-"}</p>
              )} */}

              <label className="info-title">
                <Mail size={14} /> 이메일
              </label>
              {editing ? (
                <input
                  className="info-input"
                  value={editData.email || ""}
                  onChange={(e) => change("email", e.target.value)}
                  placeholder="이메일을 입력하세요"
                />
              ) : (
                <p className="info-value">
                  {profile.email ? profile.email : "-"}
                </p>
              )}

              <label className="info-title">
                <Calendar size={14} /> 생성일
              </label>
              <p className="info-value">
                {profile.created_at
                  ? new Date(profile.created_at).toLocaleDateString("ko-KR")
                  : "-"}
              </p>
            </div>

            {/* EDIT BUTTONS */}
            <div className="edit-btn-area baseinfo">
              {!editing ? (
                <button className="edit-btn" onClick={() => setEditing(true)}>
                  <Edit3 size={16} /> 수정
                </button>
              ) : (
                <>
                  <button
                    className="cancel-btn"
                    onClick={() => {
                      setEditData(profile);
                      setAvatarPreview(profile.avatar);
                      setEditing(false);
                    }}
                  >
                    <X size={16} /> 취소
                  </button>
                  <button
                    className="save-btn"
                    onClick={handleSave}
                    disabled={isLoading}
                  >
                    <Save size={16} /> {isLoading ? "저장 중..." : "저장"}
                  </button>
                </>
              )}
            </div>
          </aside>

          {/* ------------ DETAILS SECTION ------------ */}
          <section className="profile-right-card">
            <h2 className="section-title">상세 정보</h2>

            <div className="body-grid">
              {/* ------------ ROW 1 ------------ */}
              <div className="body-item">
                <label>생년월일</label>
                <input
                  type="date"
                  className={editing ? "body-input" : "body-input readonly"}
                  value={editData.birthdate || ""}
                  onChange={(e) => change("birthdate", e.target.value)}
                  disabled={!editing}
                />
              </div>

              <div className="body-item">
                <label>키</label>
                {editing ? (
                  <input
                    type="number"
                    step="0.1"
                    className="body-input"
                    placeholder="cm"
                    value={editData.height_cm || ""}
                    onChange={(e) => change("height_cm", e.target.value)}
                  />
                ) : (
                  <p className="view-box">
                    {profile.height_cm ? `${profile.height_cm} cm` : "-"}
                  </p>
                )}
              </div>

              <div className="body-item">
                <label>체중</label>
                {editing ? (
                  <input
                    type="number"
                    step="0.1"
                    className="body-input"
                    placeholder="kg"
                    value={editData.weight_kg || ""}
                    onChange={(e) => change("weight_kg", e.target.value)}
                  />
                ) : (
                  <p className="view-box">
                    {profile.weight_kg ? `${profile.weight_kg} kg` : "-"}
                  </p>
                )}
              </div>

              {/* BMI */}
              <div className="body-item">
                <label>BMI</label>
                <div className="bmi-box">
                  <div className="bmi-row">
                    <span className="bmi-value">{bmi()}</span>
                    <span className="bmi-unit">kg/m²</span>
                  </div>
                </div>
              </div>

              {/* ------------ ROW 2 ------------ */}
              <div className="body-item">
                <label>체지방률</label>
                {editing ? (
                  <input
                    type="number"
                    step="0.1"
                    className="body-input"
                    placeholder="%"
                    value={editData.body_fat || ""}
                    onChange={(e) => change("body_fat", e.target.value)}
                  />
                ) : (
                  <p className="view-box">
                    {profile.body_fat ? `${profile.body_fat} %` : "-"}
                  </p>
                )}
              </div>

              <div className="body-item">
                <label>골격근량</label>
                {editing ? (
                  <input
                    type="number"
                    step="0.1"
                    className="body-input"
                    placeholder="kg"
                    value={editData.skeletal_muscle || ""}
                    onChange={(e) => change("skeletal_muscle", e.target.value)}
                  />
                ) : (
                  <p className="view-box">
                    {profile.skeletal_muscle
                      ? `${profile.skeletal_muscle} kg`
                      : "-"}
                  </p>
                )}
              </div>

              <div className="body-item">
                <label>기초대사량</label>
                {editing ? (
                  <input
                    type="number"
                    className="body-input"
                    placeholder="kcal"
                    value={editData.bmr || ""}
                    onChange={(e) => change("bmr", e.target.value)}
                  />
                ) : (
                  <p className="view-box">
                    {profile.bmr ? `${profile.bmr} kcal` : "-"}
                  </p>
                )}
              </div>

              <div className="body-item">
                <label>체수분</label>
                {editing ? (
                  <input
                    type="number"
                    step="0.1"
                    className="body-input"
                    placeholder="%"
                    value={editData.water || ""}
                    onChange={(e) => change("water", e.target.value)}
                  />
                ) : (
                  <p className="view-box">
                    {profile.water ? `${profile.water} %` : "-"}
                  </p>
                )}
              </div>

              {/* ------------ ROW 3 ------------ */}
              <div className="body-item">
                <label>내장지방 레벨</label>
                {editing ? (
                  <input
                    type="number"
                    className="body-input"
                    placeholder="레벨"
                    value={editData.visceral_fat_level || ""}
                    onChange={(e) =>
                      change("visceral_fat_level", e.target.value)
                    }
                  />
                ) : (
                  <p className="view-box">
                    {profile.visceral_fat_level
                      ? profile.visceral_fat_level
                      : "-"}
                  </p>
                )}
              </div>
            </div>
            {/* EDIT BUTTONS */}
            <div className="edit-btn-area addinfo">
              {!editing ? (
                <button className="edit-btn" onClick={() => setEditing(true)}>
                  <Edit3 size={16} /> 수정
                </button>
              ) : (
                <>
                  <button
                    className="cancel-btn"
                    onClick={() => {
                      setEditData(profile);
                      setAvatarPreview(profile.avatar);
                      setEditing(false);
                    }}
                  >
                    <X size={16} /> 취소
                  </button>
                  <button
                    className="save-btn"
                    onClick={handleSave}
                    disabled={isLoading}
                  >
                    <Save size={16} /> {isLoading ? "저장 중..." : "저장"}
                  </button>
                </>
              )}
            </div>
          </section>
        </div>

        {/* 하단 버튼 */}
        <div className="bottom-btn-box">
          <button
            className="home-btn"
            onClick={() => (window.location.href = "/dashboard")}
          >
            <Home size={18} /> 홈
          </button>

          <button className="delete-btn" onClick={handleDelete}>
            <Trash2 size={18} /> 계정 삭제
          </button>
        </div>
      </div>
    </div>
  );
}
