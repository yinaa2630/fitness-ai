# app/services/routine_generator/builder.py
"""
루틴 빌더 (3가지 전략)
- generate_three_strategy_routines(user_info, catalog, time_min)
  : 반환값은 리스트(3개) 각 요소는 {strategy, exercises, total_time_min, total_calories, score}
전략 종류:
  - time_based: 시간 내 최대 효율/운동소모를 목표로 (짧은 시간엔 고MET 위주)
  - efficiency_based: routine_scorer 모델 점수를 최대화 (모델 기반)
  - balance_based: 상/하/코어 균형을 맞추는 구성

주의:
- 입력 catalog는 영어 기반(ex['name']는 영어 key)이어야 함.
- router에서 이미 한국어->영어 변환을 수행했어야 함. 방어적으로 normalize 수행.
"""
import random
from typing import List, Dict, Any

from services.routine_generator.reps_predictor import predict_reps_for_exercise
from services.routine_generator.scorer import score_routine
from services.routine_generator.mappings import INJURY_EXERCISE_MAP

print("🚨 builder.py LOADED:", __file__)

MIN_EXERCISES = 2
MAX_EXERCISES = 6
MAX_SETS_PER_EXERCISE = 50  # 🔥 요구사항 반영

TARGET_TIME_RATIOS = {
    "time_based": (0.95, 1.00),
    "efficiency_based": (0.90, 1.00),
    "balance_based": (0.90, 1.00),
}

# ======================================================
# 시간 계산
# ======================================================

def calc_exercise_time_sec(item: Dict[str, Any]) -> int:
    sets = item["sets"]
    duration = item["duration_sec"]
    rest = item["rest_sec"]
    return int((duration * sets) + (rest * max(sets - 1, 0)))

def calc_total_time_sec(items: List[Dict[str, Any]]) -> int:
    return sum(calc_exercise_time_sec(it) for it in items)

def determine_exercise_count(time_min: int) -> int:
    n = round(time_min / 10)
    return max(MIN_EXERCISES, min(MAX_EXERCISES, n))

# ======================================================
# 루틴 빌드
# ======================================================

def build_routine_from_exercises(
    user_info: dict,
    exercises: List[Dict[str, Any]],
    time_min: int,
    strategy: str,
) -> Dict[str, Any]:

    ex_items: List[Dict[str, Any]] = []

    # 1️⃣ 모델 예측
    for ex in exercises:
        pred = predict_reps_for_exercise(user_info, ex)
        # print("pred",pred)
        sets = int(pred.get("set_count", 3))
        reps = int(pred.get("reps", 20))
        rest_sec = int(pred.get("rest_sec", 60))
        duration_sec = int(pred.get("duration_sec", max(30, reps * 3)))

        ex_items.append({
            "exercise_id": ex["id"],
            "name": ex["name"],
            "sets": max(1, sets),
            "reps": reps,
            "rest_sec": rest_sec,
            "duration_sec": duration_sec,
            "exercise_meta": ex,
            "est_calories": 0.0,  # 🔥 나중에 채움
        })

    # 2️⃣ 목표 시간
    min_ratio, max_ratio = TARGET_TIME_RATIOS[strategy]
    target_min_sec = int(time_min * 60 * min_ratio)
    target_max_sec = int(time_min * 60 * max_ratio)

    total_sec = calc_total_time_sec(ex_items)

    # 3️⃣ 시간 충족될 때까지 세트 증가
    idx = 0
    while total_sec < target_min_sec:
        item = ex_items[idx % len(ex_items)]
        if item["sets"] < MAX_SETS_PER_EXERCISE:
            item["sets"] += 1
        idx += 1
        total_sec = calc_total_time_sec(ex_items)

    total_time_min = round(total_sec / 60.0, 1)

    # 4️⃣ 칼로리 계산 (exercise + total)
    weight_kg = float(user_info.get("weight_kg") or 70.0)
    total_kcal = 0.0

    for it in ex_items:
        met = float(it["exercise_meta"].get("MET") or 3.5)
        active_sec = it["sets"] * it["duration_sec"]
        kcal = met * weight_kg * (active_sec / 3600.0)
        it["est_calories"] = round(kcal, 2)
        total_kcal += kcal

    total_calories = round(total_kcal, 2)

    # 5️⃣ 점수
    summary = {
        "strategy": strategy,
        "time_available_minutes": time_min,
        "estimated_time_min": total_time_min,
        "total_sets": sum(it["sets"] for it in ex_items),
        "total_exercises": len(ex_items),
        "total_calories": total_calories,
        "avg_met": sum(float(it["exercise_meta"].get("MET", 0)) for it in ex_items) / max(len(ex_items), 1),
        "category_counts": {...},
    }

    score = score_routine(user_info, summary)

    return {
        "strategy": strategy,
        "exercises": ex_items,
        "total_time_min": total_time_min,
        "total_calories": total_calories,
        "score": score,
    }

# ======================================================
# 3가지 전략
# ======================================================

def generate_three_strategy_routines(
    user_info: dict,
    catalog: List[Dict[str, Any]],
    time_min: int,
) -> List[Dict[str, Any]]:

    n_ex = determine_exercise_count(time_min)

    exclude_ids = set()
    if user_info.get("exclude_injury_area"):
        exclude_ids = INJURY_EXERCISE_MAP.get(user_info["exclude_injury_area"], set())

    filtered = [ex for ex in catalog if ex["id"] not in exclude_ids]
    if len(filtered) < n_ex:
        filtered = catalog[:n_ex]

    # time_based
    time_selected = sorted(filtered, key=lambda x: x.get("MET", 4.5), reverse=True)[:n_ex]
    time_routine = build_routine_from_exercises(user_info, time_selected, time_min, "time_based")
    # print("time_routine", time_routine)
    # efficiency_based
    candidates = []
    for _ in range(30):
        sample = random.sample(filtered, min(n_ex, len(filtered)))
        candidates.append(
            build_routine_from_exercises(user_info, sample, time_min, "efficiency_based")
        )
    efficiency_routine = max(candidates, key=lambda x: x["score"])

    # balance_based
    upper = [c for c in filtered if c.get("category_1") == "UPPER_BODY"]
    lower = [c for c in filtered if c.get("category_1") == "LOWER_BODY"]
    core = [c for c in filtered if c.get("category_1") in ("CORE", "FULL_BODY")]

    chosen = []
    if upper: chosen.append(random.choice(upper))
    if lower: chosen.append(random.choice(lower))
    if core: chosen.append(random.choice(core))

    for c in filtered:
        if len(chosen) >= n_ex:
            break
        if c not in chosen:
            chosen.append(c)

    balance_routine = build_routine_from_exercises(user_info, chosen, time_min, "balance_based")

    return sorted(
        [time_routine, efficiency_routine, balance_routine],
        key=lambda x: x["score"],
        reverse=True,
    )


