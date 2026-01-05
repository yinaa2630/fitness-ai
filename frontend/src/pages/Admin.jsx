// src/pages/Admin.jsx
import React, { useEffect, useState } from "react";
import "../styles/Admin.css";
import {
  deleteUserById,
  getUsers,
  updateRole,
  updateSubscription,
} from "../api/admin";

export default function Admin() {
  // ==========
  // 🔥 Hooks
  // ==========
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [logs, setLogs] = useState([]);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortType, setSortType] = useState("created_desc");

  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("users");
  const [error, setError] = useState(null);

  // 관리자 체크
  const user = JSON.parse(localStorage.getItem("user"));
  const role = JSON.parse(localStorage.getItem("role"));

  const ADMIN_EMAIL = "admin@test.com";
  const getNextPlan = (current) => {
    if (!current) return "Basic";
    if (current === "Basic") return "Pro";
    if (current === "Pro") return "Premium";
    return null; // Premium → 미구독
  };

  // ==========
  // 🔥 관리자 로그 텍스트 맵
  // ==========
  const actionText = {
    subscription_toggle: "구독 상태 변경",
    delete_user: "회원 삭제",
    promote_admin: "관리자 승급",
    demote_admin: "관리자 강등",
  };

  // ==========
  // 데이터 불러오기
  // ==========
  const fetchUsers = async () => {
    try {
      let data = await getUsers();
      data = data.map((u) => ({
        ...u,
        username: u.name,
      }));

      setUsers(data);
      setFiltered(data);
    } catch (err) {
      setError("회원 데이터를 가져오지 못했습니다.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    setLogs([]); // 아직 백엔드 로그 없음
  }, []);

  // ==========
  // 🔥 로그 기록
  // ==========
  const writeLog = (action, targetUser) => {
    const log = {
      admin_email: user?.email,
      action: actionText[action] || action,
      target_user_email: targetUser.email,
      timestamp: new Date(),
    };

    setLogs((prev) => [log, ...prev]);
  };

  // ==========
  // 🔥 구독 변경
  // ==========
  console.log(users);
  const toggleSubscription = async (id, plan_name) => {
    try {
      await updateSubscription(id, plan_name, "");

      const target = users.find((u) => u.id === id);
      writeLog("subscription_toggle", target);

      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, plan_name: plan_name } : u))
      );
    } catch (err) {
      console.error(err);
      alert("구독 변경 실패");
    }
  };

  // ==========
  // 🔥 관리자 승급
  // ==========
  const promoteUser = async (id) => {
    if (!window.confirm("해당 유저를 관리자(admin)로 승급시키겠습니까?"))
      return;

    try {
      await updateRole(id, "admin");
      const target = users.find((u) => u.id === id);
      writeLog("promote_admin", target);

      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: "admin" } : u))
      );
    } catch (err) {
      console.error(err);
      alert("승급 실패");
    }
  };

  // ==========
  // 🔥 관리자 강등
  // ==========
  const demoteUser = async (id) => {
    if (!window.confirm("해당 관리자를 일반 유저(user)로 강등하시겠습니까?"))
      return;

    try {
      await updateRole(id, "user");

      const target = users.find((u) => u.id === id);
      writeLog("demote_admin", target);

      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: !u.role } : u))
      );
    } catch (err) {
      console.error(err);
      alert("강등 실패");
    }
  };

  // ==========
  // 🔥 회원 삭제
  // ==========
  const deleteUser = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await deleteUserById(id);
      const target = users.find((u) => u.id === id);
      writeLog("delete_user", target);

      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error(err);
      alert("삭제 실패");
    }
  };

  // ==========
  // 🔍 검색/필터/정렬
  // ==========
  useEffect(() => {
    let list = [...users];

    if (search.trim()) {
      list = list.filter(
        (u) =>
          String(u.id).includes(search) ||
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          (u.username &&
            u.username.toLowerCase().includes(search.toLowerCase()))
      );
    }

    if (filterType === "subscribed") list = list.filter((u) => u.is_subscribed);
    if (filterType === "unsubscribed")
      list = list.filter((u) => !u.is_subscribed);

    if (sortType === "created_desc")
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    else list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    setFiltered(list);
  }, [users, search, filterType, sortType]);

  // ==========
  // 🔐 접근 제한
  // ==========

  if (!(role || user.email === ADMIN_EMAIL)) {
    return (
      <div className="admin-error">
        <h2>⚠ 접근 권한 없음</h2>
        <p>관리자 전용 페이지입니다.</p>
      </div>
    );
  }

  if (loading) return <div className="admin-loading">로딩중...</div>;
  if (error) return <div className="admin-error">{error}</div>;
  // ==========
  // UI 렌더링
  // ==========
  return (
    <div className="admin-container">
      <h1 className="admin-title">관리자 페이지</h1>

      {/* 탭 */}
      <div className="admin-tabs">
        <button
          className={tab === "users" ? "tab active" : "tab"}
          onClick={() => setTab("users")}
        >
          회원 관리
        </button>
        <button
          className={tab === "logs" ? "tab active" : "tab"}
          onClick={() => setTab("logs")}
        >
          관리자 로그
        </button>
      </div>

      {/* 🔥 회원 관리 */}
      {tab === "users" && (
        <div className="admin-card">
          <h2 className="admin-section-title">전체 회원 조회</h2>

          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>유저명</th>
                <th>이메일</th>
                <th>권한</th>
                <th>구독</th>
                <th>관리</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.username || "-"}</td>
                  <td>{u.email}</td>

                  <td>
                    {u.role ? (
                      <span
                        className="tag tag-admin"
                        style={{ cursor: "default" }}
                      >
                        관리자
                      </span>
                    ) : (
                      <span
                        className="tag tag-user"
                        style={{ cursor: "default" }}
                      >
                        유저
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      className={
                        u.plan_name
                          ? "tag tag-subscribed"
                          : "tag tag-unsubscribed"
                      }
                      onClick={() =>
                        toggleSubscription(u.id, getNextPlan(u.plan_name))
                      }
                    >
                      {u.plan_name ? `구독중 (${u.plan_name})` : "미구독"}
                    </button>
                  </td>

                  <td>
                    {/* 승급 또는 강등 */}
                    {u.role ? (
                      <button
                        className="promote-btn"
                        onClick={() => demoteUser(u.id)}
                      >
                        강등
                      </button>
                    ) : (
                      <button
                        className="promote-btn"
                        onClick={() => promoteUser(u.id)}
                      >
                        승급
                      </button>
                    )}

                    {/* 삭제 */}
                    <button
                      className="delete-btn"
                      onClick={() => deleteUser(u.id)}
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 🔥 관리자 로그 */}
      {tab === "logs" && (
        <div className="admin-card">
          <h2 className="admin-section-title">관리자 로그</h2>

          <table className="admin-table">
            <thead>
              <tr>
                <th>시간</th>
                <th>관리자</th>
                <th>행동</th>
                <th>대상 유저</th>
              </tr>
            </thead>

            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="admin-no-users">
                    로그 없음
                  </td>
                </tr>
              ) : (
                logs.map((log, i) => (
                  <tr key={i}>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                    <td>{log.admin_email}</td>
                    <td>{log.action}</td>
                    <td>{log.target_user_email}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
