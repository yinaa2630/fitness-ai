# Fitness Pose AI – Knee Push-up Inference

## Overview

본 프로젝트는 **Knee Push-up(니푸쉬업)** 동작에서  
사람의 관절 포즈 정보를 기반으로 **조건별 자세 정확도를 추론**하는 AI 모델입니다.

학습된 모델을 **백엔드 서비스에서 직접 호출 가능한 inference 코드**로 정리하여,  
실제 서비스 환경에서의 사용을 고려해 구성되었습니다.

---

## Inference Purpose

`inference.py`는 다음 목적을 갖습니다.

- 학습이 완료된 모델 가중치를 로드
- 입력 영상에 대해 조건별 점수 추론
- 관절별 시각화 결과를 영상으로 출력
- Backend API에서 재사용 가능한 구조 제공

---

## Inference Pipeline

1. 입력 영상 로드 (`.mp4`)
2. YOLOv8 Pose 기반 관절 키포인트 추출
3. 시계열 키포인트 구성 (SEQ_LEN = 16)
4. 이미지 + 시계열 + 조건 벡터 기반 모델 추론
5. 조건별 점수 계산
6. 관절 색상 및 텍스트 오버레이 시각화
7. 결과 영상 저장

---

## Folder Structure

```bash
fitness_pose_ai/
 ├─ kneepushup/
 │   ├─ inference.py        # 서비스 단계 추론 코드
 │   ├─ weights/
 │   │   └─ model_kneepushup.pth
 │   ├─ README.md
 │   └─ processed/          # 전처리 산출물 (git ignored)
```

---

## Design Decisions

- 단일 운동(Knee Push-up)에 집중하여 조건별 정확도 향상
- 이미지 특징 + 시계열 포즈 정보를 결합한 멀티모달 구조 설계
- 실험/학습 코드와 서비스 추론 코드의 명확한 분리
- Backend에서 import 또는 subprocess 호출이 가능한 형태로 구성

---

## Notes

- `processed/`, 영상 파일, 데이터셋은 재생성 가능하므로 Git에서 제외
- 본 inference 코드는 실제 백엔드 서버에서 호출되는 것을 전제로 설계됨
