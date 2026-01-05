# app/services/routine_generator/scorer.py
"""
RoutineScorer 모듈
- 역할:
    생성된 루틴의 요약(summary: total_sets, ratios 등)을 입력받아
    LightGBM 기반 '루틴 점수(0~100)' 를 예측한다.
    → feature mismatch(예: LightGBM "number of features" 오류)를 자동 해결하도록
      입력 DataFrame을 모델이 학습 시 사용한 feature 스키마에 맞춰 정렬/보정.

- 모델 파일:
    ai_models/routine_scorer_lgbm.pkl
    ai_models/label_encoders.pkl (optional)

- 주요 기능:
    RoutineScorer.score(user_info, summary) -> float
    score_routine(user_info, summary)  # 싱글턴 래퍼

- 동작 정책:
    - 모델 로드 성공 시: 모델이 기대하는 feature 순서/이름에 맞게 DF를 정렬 후 예측.
    - feature 부족 → 0으로 채움 / feature 추가 → 삭제.
    - 예측 실패 또는 모델 없음 → 규칙 기반 점수 계산 fallback.
"""

import os
import pickle
import logging
from typing import Dict, Any, Optional, List

logger = logging.getLogger(__name__)

DEFAULT_MODEL_PATH = "ai_models/routine_scorer_model.pkl"
DEFAULT_ENCODERS_PATH = "ai_models/routine_scorer_encoders.pkl"

# goal 한글→영어 변환
try:
    from services.routine_generator.mappings import GOAL_KO_TO_EN
except Exception:
    GOAL_KO_TO_EN = {}

# --------------------------------------------------
# 유틸
# --------------------------------------------------
def _to_float_safe(v, default=0.0):
    try:
        return float(v)
    except Exception:
        return default

def _to_int_safe(v, default=0):
    try:
        return int(round(float(v)))
    except Exception:
        return default

def _goal_to_num(goal) -> int:
    mapping = {
        "MAINTAIN": 0,
        "FAT_LOSS": 1,
        "MUSCLE_GAIN": 2,
        "ENDURANCE": 3,
    }
    return mapping.get(str(goal).upper(), 0)

# ==================================================
# RoutineScorer
# ==================================================
class RoutineScorer:
    def __init__(
        self,
        model_path: str = DEFAULT_MODEL_PATH,
        encoders_path: str = DEFAULT_ENCODERS_PATH,
    ):
        self.model = None
        self.encoders = None
        self.expected_feature_names: Optional[List[str]] = None

        # 모델 로드
        if os.path.exists(model_path):
            try:
                with open(model_path, "rb") as f:
                    self.model = pickle.load(f)
                logger.info(f"✅ RoutineScorer model loaded: {model_path}")
            except Exception as e:
                logger.warning(f"⚠️ RoutineScorer model load failed: {e}")

        # 인코더 로드
        if os.path.exists(encoders_path):
            try:
                with open(encoders_path, "rb") as f:
                    self.encoders = pickle.load(f)
                logger.info(f"✅ RoutineScorer encoders loaded: {encoders_path}")
            except Exception as e:
                logger.warning(f"⚠️ RoutineScorer encoder load failed: {e}")

        # feature 이름
        if self.model is not None:
            try:
                if hasattr(self.model, "feature_name_"):
                    self.expected_feature_names = list(self.model.feature_name_)
            except Exception:
                self.expected_feature_names = None

    # --------------------------------------------------
    # feature 생성 (🔥 문제 구간 완전 재작성)
    # --------------------------------------------------
    def _prepare_features(
        self, user_info: Dict[str, Any], summary: Dict[str, Any]
    ) -> Dict[str, Any]:

        feat: Dict[str, Any] = {
            "time_available_minutes": _to_int_safe(
                summary.get("time_available_minutes"), 30
            ),
            "total_sets": _to_int_safe(summary.get("total_sets"), 10),
            "total_exercises": _to_int_safe(summary.get("total_exercises"), 3),
            "metabolic_ratio": _to_float_safe(summary.get("metabolic_ratio"), 0.3),
            "upper_ratio": _to_float_safe(summary.get("upper_ratio"), 0.33),
            "lower_ratio": _to_float_safe(summary.get("lower_ratio"), 0.33),
            "user_fitness_level": _to_int_safe(
                user_info.get("fitness_level"), 1
            ),
            "user_bmi": _to_float_safe(user_info.get("bmi"), 24.0),
        }

        # goal 처리
        raw_goal = user_info.get("goal", "MAINTAIN")
        if isinstance(raw_goal, str) and raw_goal in GOAL_KO_TO_EN:
            raw_goal = GOAL_KO_TO_EN[raw_goal]

        # LabelEncoder 사용 (완전 안전)
        if self.encoders and "goal" in self.encoders:
            try:
                le = self.encoders["goal"]
                classes = list(le.classes_)
                if raw_goal not in classes:
                    raw_goal = classes[0]
                feat["user_goal"] = int(le.transform([raw_goal])[0])
            except Exception as e:
                logger.debug(f"RoutineScorer: goal encoding fallback: {e}")
                feat["user_goal"] = _goal_to_num(raw_goal)
        else:
            feat["user_goal"] = _goal_to_num(raw_goal)

        return feat

    # --------------------------------------------------
    # 점수 계산
    # --------------------------------------------------
    def score(self, user_info: Dict[str, Any], summary: Dict[str, Any]) -> float:
        features = self._prepare_features(user_info, summary)

        # 모델 없으면 규칙 기반
        if self.model is None:
            return self._fallback_score(features)

        try:
            import pandas as pd

            df = pd.DataFrame([features])
            if self.expected_feature_names:
                for c in self.expected_feature_names:
                    if c not in df.columns:
                        df[c] = 0.0
                df = df[self.expected_feature_names]

            pred = float(self.model.predict(df)[0])
            return round(max(0.0, min(99.0, pred)), 1)

        except Exception as e:
            logger.warning(f"RoutineScorer model predict failed: {e}")
            return self._fallback_score(features)

    # --------------------------------------------------
    # fallback
    # --------------------------------------------------
    def _fallback_score(self, feat: Dict[str, Any]) -> float:
        score = 50.0
        score += feat["metabolic_ratio"] * 40.0
        score += feat["total_sets"] * 0.8
        score -= abs(feat["user_bmi"] - 22.0) * 0.5
        return round(max(0.0, min(99.0, score)), 1)

# ==================================================
# 싱글턴
# ==================================================
_default_scorer: Optional[RoutineScorer] = None

def score_routine(user_info: Dict[str, Any], summary: Dict[str, Any]) -> float:
    global _default_scorer
    if _default_scorer is None:
        _default_scorer = RoutineScorer()
    return _default_scorer.score(user_info, summary)
