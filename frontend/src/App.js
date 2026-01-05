import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Routine from "./pages/Routine";
import Exercise from "./pages/Exercise";
import Report from "./pages/Report";
import Facilities from "./pages/Facilities";
import Calorie from "./pages/Calorie";
import Products from "./pages/Products";
import Profile from "./pages/Profile";
import DetailExtra from "./pages/DetailExtra";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Community from "./pages/Community";
import CommunityProfile from "./pages/CommunityProfile";

// 🔒 로그인 체크 함수
const RequireAuth = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🔓 로그인 없이 접근 가능한 페이지 */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* 🔓 홈 페이지 - 로그인 없이도 접근 가능 (Layout 포함) */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
        </Route>

        {/* 🔒 로그인 필요한 페이지 - Layout 포함 */}
        <Route
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/routine" element={<Routine />} />
          <Route path="/exercise" element={<Exercise />} />
          <Route path="/report" element={<Report />} />
          <Route path="/facilities" element={<Facilities />} />
          <Route path="/calorie" element={<Calorie />} />
          <Route path="/products" element={<Products />} />
          <Route path="/community" element={<Community />} />
          <Route
            path="/community/profile/:username"
            element={<CommunityProfile />}
          />

          <Route path="/profile" element={<Profile />} />
          <Route path="/detail-extra" element={<DetailExtra />} />
          <Route path="/subscribe" element={<div>구독 페이지 만들기</div>} />
        </Route>

        {/* 🔒 관리자 페이지 (별도 보호) */}
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <Admin />
            </RequireAuth>
          }
        />

        {/* 404 - 존재하지 않는 경로는 홈으로 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
