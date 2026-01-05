// src/pages/Report.jsx
import React, { useState } from "react";
import "../styles/Report.css";
import { Line, Doughnut, Bar, Radar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  RadialLinearScale,
  Tooltip,
  Filler,
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  RadialLinearScale,
  Tooltip,
  Filler
);

export default function Report() {
  const [selectedPeriod, setSelectedPeriod] = useState('week'); // week, month, year

  /* -----------------------------------------
      📌 홈트레이닝 실전 데이터
  ----------------------------------------- */
  
  // 주간 운동 시간 (홈트 실제 루틴 기준)
  const weeklyWorkoutTime = {
    labels: ["월", "화", "수", "목", "금", "토", "일"],
    datasets: [
      {
        label: "운동 시간 (분)",
        data: [35, 0, 45, 30, 50, 40, 60],
        borderColor: "#b57aff",
        backgroundColor: "rgba(181,122,255,0.2)",
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: "#d9b3ff",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        fill: true,
      },
    ],
  };

  // 운동 부위별 횟수
  const bodyPartFrequency = {
    labels: ["가슴", "등", "하체", "어깨", "팔", "복근", "유산소"],
    datasets: [
      {
        label: "운동 횟수",
        data: [8, 6, 10, 7, 9, 12, 5],
        backgroundColor: [
          "#ff8fa3",
          "#b57aff",
          "#ffa94d",
          "#74c0fc",
          "#51cf66",
          "#ff6b6b",
          "#ffd43b"
        ],
        borderRadius: 8,
      },
    ],
  };

  // 체력 레이더 차트
  const fitnessRadar = {
    labels: ["근력", "지구력", "유연성", "균형감", "체력", "회복력"],
    datasets: [
      {
        label: "현재",
        data: [75, 68, 55, 60, 72, 65],
        backgroundColor: "rgba(181, 122, 255, 0.2)",
        borderColor: "#b57aff",
        pointBackgroundColor: "#b57aff",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
      {
        label: "목표",
        data: [85, 80, 70, 75, 85, 80],
        backgroundColor: "rgba(255, 143, 163, 0.1)",
        borderColor: "#ff8fa3",
        pointBackgroundColor: "#ff8fa3",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        borderDash: [5, 5],
      },
    ],
  };

  // 월별 진행도 (체중/근육량)
  const monthlyProgress = {
    labels: ["1월", "2월", "3월", "4월", "5월", "6월"],
    datasets: [
      {
        label: "체중 (kg)",
        data: [72, 71.5, 71, 70.5, 70, 69.5],
        borderColor: "#ff8fa3",
        backgroundColor: "rgba(255,143,163,0.1)",
        yAxisID: "y",
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "#ff8fa3",
        fill: true,
      },
      {
        label: "근육량 (kg)",
        data: [30, 30.5, 31, 31.5, 32, 32.5],
        borderColor: "#b57aff",
        backgroundColor: "rgba(181,122,255,0.1)",
        yAxisID: "y1",
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "#b57aff",
        fill: true,
      },
    ],
  };

  // 실제 홈트 루틴 리스트
  const recentWorkouts = [
    {
      id: 1,
      name: "풀바디 루틴 A",
      exercises: ["푸쉬업 3세트", "스쿼트 4세트", "플랭크 3분"],
      duration: 45,
      calories: 380,
      date: "2024.12.05",
      intensity: "high"
    },
    {
      id: 2,
      name: "하체 집중 데이",
      exercises: ["런지 4세트", "불가리안 스쿼트 3세트", "힙 쓰러스트 4세트"],
      duration: 50,
      calories: 420,
      date: "2024.12.03",
      intensity: "high"
    },
    {
      id: 3,
      name: "상체 + 코어",
      exercises: ["덤벨 프레스 4세트", "바벨로우 3세트", "AB 롤아웃 3세트"],
      duration: 40,
      calories: 320,
      date: "2024.12.02",
      intensity: "medium"
    },
    {
      id: 4,
      name: "HIIT 인터벌",
      exercises: ["버피 30초", "마운틴 클라이머 30초", "점프 스쿼트 30초"],
      duration: 20,
      calories: 280,
      date: "2024.12.01",
      intensity: "high"
    },
    {
      id: 5,
      name: "어깨 + 팔",
      exercises: ["숄더프레스 4세트", "사이드레터럴 3세트", "이두컬 3세트"],
      duration: 35,
      calories: 250,
      date: "2024.11.30",
      intensity: "medium"
    },
  ];

  // 주간 목표 달성률
  const weeklyGoals = [
    { goal: "주 5회 운동", current: 4, total: 5, percentage: 80 },
    { goal: "총 300분 운동", current: 260, total: 300, percentage: 87 },
    { goal: "2000 kcal 소모", current: 1850, total: 2000, percentage: 93 },
  ];

  return (
    <div className="report-wrapper">
      {/* 헤더 겹침 방지 */}
      <div className="header-spacing"></div>

      {/* ======================================
          📌 상단 타이틀 + 기간 선택
      ======================================= */}
      <div className="report-header">
        <div>
          <h1 className="report-title">나의 운동 리포트</h1>
          <p className="report-subtitle">꾸준함이 만드는 변화를 확인하세요 💪</p>
        </div>
        <div className="period-selector">
          <button 
            className={`period-btn ${selectedPeriod === 'week' ? 'active' : ''}`}
            onClick={() => setSelectedPeriod('week')}
          >
            주간
          </button>
          <button 
            className={`period-btn ${selectedPeriod === 'month' ? 'active' : ''}`}
            onClick={() => setSelectedPeriod('month')}
          >
            월간
          </button>
          <button 
            className={`period-btn ${selectedPeriod === 'year' ? 'active' : ''}`}
            onClick={() => setSelectedPeriod('year')}
          >
            연간
          </button>
        </div>
      </div>

      {/* ======================================
          📊 상단 KPI 요약 박스
      ======================================= */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon">🔥</div>
          <p className="kpi-label">총 운동 횟수</p>
          <h2 className="kpi-value">15회</h2>
          <span className="kpi-sub positive">지난주 대비 +3회</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">⏱️</div>
          <p className="kpi-label">총 운동 시간</p>
          <h2 className="kpi-value">260분</h2>
          <span className="kpi-sub positive">목표 대비 87%</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">⚡</div>
          <p className="kpi-label">소모 칼로리</p>
          <h2 className="kpi-value">1,850 kcal</h2>
          <span className="kpi-sub positive">+320 kcal</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">🎯</div>
          <p className="kpi-label">연속 운동</p>
          <h2 className="kpi-value">12일</h2>
          <span className="kpi-sub">최고 기록 갱신!</span>
        </div>
      </div>

      {/* ======================================
          🎯 주간 목표 달성률
      ======================================= */}
      <div className="goals-section">
        <h2 className="section-title">이번 주 목표 달성률</h2>
        <div className="goals-grid">
          {weeklyGoals.map((goal, index) => (
            <div key={index} className="goal-card">
              <div className="goal-header">
                <h3 className="goal-name">{goal.goal}</h3>
                <span className="goal-percentage">{goal.percentage}%</span>
              </div>
              <div className="goal-progress-bar">
                <div 
                  className="goal-progress-fill"
                  style={{ width: `${goal.percentage}%` }}
                ></div>
              </div>
              <p className="goal-detail">
                {goal.current} / {goal.total} {goal.goal.includes('분') ? '분' : goal.goal.includes('kcal') ? 'kcal' : '회'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ======================================
          📊 메인 그래프 영역
      ======================================= */}
      <div className="graph-row">
        {/* 주간 운동 시간 */}
        <div className="graph-card large">
          <h2 className="graph-title">주간 운동 시간 변화</h2>
          <Line 
            data={weeklyWorkoutTime} 
            options={{
              plugins: {
                legend: { display: false },
                tooltip: {
                  backgroundColor: '#1a1a1a',
                  titleColor: '#fff',
                  bodyColor: '#b57aff',
                  borderColor: '#b57aff',
                  borderWidth: 1,
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: { color: '#262626' },
                  ticks: { color: '#888' }
                },
                x: {
                  grid: { display: false },
                  ticks: { color: '#888' }
                }
              }
            }}
          />
        </div>

        {/* 운동 부위별 빈도 */}
        <div className="graph-card">
          <h2 className="graph-title">운동 부위별 빈도</h2>
          <Bar 
            data={bodyPartFrequency}
            options={{
              plugins: {
                legend: { display: false },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: { color: '#262626' },
                  ticks: { color: '#888' }
                },
                x: {
                  grid: { display: false },
                  ticks: { color: '#888' }
                }
              }
            }}
          />
        </div>
      </div>

      {/* ======================================
          📈 분석 카드 그리드
      ======================================= */}
      <div className="analysis-grid">
        {/* 체력 레이더 */}
        <div className="analysis-card">
          <h3 className="analysis-title">종합 체력 분석</h3>
          <Radar 
            data={fitnessRadar}
            options={{
              plugins: {
                legend: {
                  labels: { color: '#888' }
                }
              },
              scales: {
                r: {
                  beginAtZero: true,
                  max: 100,
                  ticks: { 
                    color: '#888',
                    backdropColor: 'transparent'
                  },
                  grid: { color: '#262626' },
                  pointLabels: { color: '#aaa' }
                }
              }
            }}
          />
        </div>

        {/* 월별 체성분 변화 */}
        <div className="analysis-card wide">
          <h3 className="analysis-title">월별 체성분 변화</h3>
          <Line 
            data={monthlyProgress}
            options={{
              plugins: {
                legend: {
                  labels: { color: '#888' }
                }
              },
              scales: {
                y: {
                  type: 'linear',
                  position: 'left',
                  title: { 
                    display: true, 
                    text: '체중 (kg)',
                    color: '#ff8fa3'
                  },
                  grid: { color: '#262626' },
                  ticks: { color: '#888' }
                },
                y1: {
                  type: 'linear',
                  position: 'right',
                  title: { 
                    display: true, 
                    text: '근육량 (kg)',
                    color: '#b57aff'
                  },
                  grid: { display: false },
                  ticks: { color: '#888' }
                },
                x: {
                  grid: { display: false },
                  ticks: { color: '#888' }
                }
              }
            }}
          />
        </div>
      </div>

      {/* ======================================
          📋 최근 운동 기록 리스트
      ======================================= */}
      <div className="recent-section">
        <h2 className="recent-title">최근 운동 기록</h2>
        <div className="recent-list">
          {recentWorkouts.map((workout) => (
            <div key={workout.id} className="recent-item">
              <div className="recent-left">
                <div className="recent-header">
                  <h3>{workout.name}</h3>
                  <span className={`intensity-badge ${workout.intensity}`}>
                    {workout.intensity === 'high' ? '고강도' : workout.intensity === 'medium' ? '중강도' : '저강도'}
                  </span>
                </div>
                <div className="exercise-tags">
                  {workout.exercises.map((exercise, idx) => (
                    <span key={idx} className="exercise-tag">{exercise}</span>
                  ))}
                </div>
              </div>
              <div className="recent-right">
                <div className="recent-stats">
                  <div className="stat-item">
                    <span className="stat-icon">⏱️</span>
                    <span>{workout.duration}분</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">🔥</span>
                    <span>{workout.calories} kcal</span>
                  </div>
                </div>
                <span className="recent-date">{workout.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ======================================
          💡 인사이트 카드
      ======================================= */}
      <div className="insights-section">
        <h2 className="section-title">이번 주 인사이트</h2>
        <div className="insights-grid">
          <div className="insight-card blue">
            <div className="insight-icon">💪</div>
            <h3>가장 많이 한 운동</h3>
            <p>복근 운동 (12회)</p>
            <span className="insight-detail">꾸준한 코어 강화 중!</span>
          </div>
          <div className="insight-card purple">
            <div className="insight-icon">📈</div>
            <h3>가장 큰 성장</h3>
            <p>하체 근력 +15%</p>
            <span className="insight-detail">스쿼트 효과 나타남</span>
          </div>
          <div className="insight-card pink">
            <div className="insight-icon">🎯</div>
            <h3>추천 운동</h3>
            <p>유산소 운동 추가</p>
            <span className="insight-detail">지구력 향상 필요</span>
          </div>
        </div>
      </div>
    </div>
  );
}