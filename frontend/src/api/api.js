// src/api/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
  // baseURL: "http://192.168.0.32:8000", // 🔥 네 PC FastAPI 서버 주소
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const wearable_api = axios.create({
  baseURL: "http://localhost:8001",
  // baseURL: "http://192.168.0.32:8001", // 🔥 네 PC FastAPI 서버 주소
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔥 요청마다 토큰을 자동으로 넣어주는 interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🔥 응답 에러 로깅 (선택)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("🚨 API Error:", err?.response || err);
    return Promise.reject(err);
  }
);

export default api;
