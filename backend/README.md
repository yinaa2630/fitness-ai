```bash
# main backend 설치
cd main_backend
conda create -n fitness python==3.10 -y
conda activate fitness
cd backend
cd main_backend
pip install -r requirements.txt
```

```bash
# backend/main_backend/utils/weights 에 model_kneepushup.pth 추가할 것
```

```bash
# main backend 실행
cd backend
cd main_backend
python main.py
```

```bash
# wearable backend 설치
cd backend
cd wearable_backend
pip install -r requirements.txt
```

wearable_backend 경로 안에 .env 파일 생성

```bash
# .env 파일 안에 아래 내용 기재
OPENAI_API_KEY=sk-xxx
LLM_MODEL=gpt-4o-mini
LLM_TEMPERATURE=0.3
LLM_MAX_TOKENS=2048
ALLOWED_ORIGINS=http://localhost:3000
```

```bash
# wearable backend 실행
cd backend
cd wearable_backend
python main.py
```
