import React, { useState } from "react";
import "../styles/Calorie.css";
import { getNutrition } from "../api/nutrition";

export default function Calorie() {
  const [foodName, setFoodName] = useState("");
  const [weight, setWeight] = useState("");
  const [carb, setCarb] = useState("");
  const [protein, setProtein] = useState("");
  const [fat, setFat] = useState("");
  const [totalCalorie, setTotalCalorie] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchNutrition = async () => {
    if (!foodName || !weight) {
      alert("음식 이름과 무게를 입력하세요!");
      return;
    }

    setLoading(true);
    setTotalCalorie(null);

    try {
      const nutrition = await getNutrition(foodName, weight);

      if (!nutrition) {
        alert("AI 응답이 올바르지 않습니다. 콘솔을 확인하세요.");
        setLoading(false);
        return;
      }

      // 값 설정
      setCarb(nutrition.carbs || 0);
      setProtein(nutrition.protein || 0);
      setFat(nutrition.fat || 0);

      const total =
        (nutrition.carbs || 0) * 4 +
        (nutrition.protein || 0) * 4 +
        (nutrition.fat || 0) * 9;

      setTotalCalorie(total);
    } catch (e) {
      console.error("❌ 계산 오류:", e);
      alert("AI 계산 중 오류가 발생했습니다 (콘솔 확인).");
    }

    setLoading(false);
  };

  return (
    <div className="calorie-wrapper">
      <div className="top-gap" />
      <h1 className="calorie-title">🍱 영양소 / 칼로리 계산기</h1>

      <div className="calorie-card">
        <h2 className="card-header">📝 음식 정보 입력</h2>

        <input
          className="input-box"
          placeholder="음식 이름 (예: 마라탕)"
          value={foodName}
          onChange={(e) => setFoodName(e.target.value)}
        />

        <input
          className="input-box"
          placeholder="무게 (g)"
          type="number"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />

        <button className="calc-btn" onClick={fetchNutrition} disabled={loading}>
          {loading ? "AI 계산중..." : "AI로 자동 계산하기"}
        </button>

        {(carb !== "" || protein !== "" || fat !== "") && (
          <div className="result-box">
            <p>탄수화물: {carb} g</p>
            <p>단백질: {protein} g</p>
            <p>지방: {fat} g</p>
          </div>
        )}

        {totalCalorie !== null && (
          <div className="result-box">
            <span className="fire">🔥</span>
            총 칼로리: {totalCalorie.toFixed(1)} kcal
          </div>
        )}
      </div>
    </div>
  );
}
