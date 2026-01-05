import torch, cv2
import numpy as np 
from PIL import Image
from ultralytics import YOLO
from torchvision import transforms
from PIL import Image, ImageDraw, ImageFont

from network import Model5Cond

# 모델 로드 및 데이터 로드
device = "cuda" if torch.cuda.is_available() else "cpu"
detector = YOLO("./weights/yolov8n-pose.pt")
net = Model5Cond(5)
weight = torch.load(
    "./weights/model_kneepushup.pth",
    map_location=torch.device("cpu"))
net.load_state_dict(weight)
net.eval()

FONT_PATH = "./NanumGothic-Regular.ttf"
FONT = ImageFont.truetype(FONT_PATH, 24)
cond_names = [{'condition': '척추의 중립', 'value': True}, {'condition': '이완시 팔꿈치 90도', 'value': True}, {'condition': '가슴의 충분한 이동', 'value': True}, {'condition': '손의 위치 가슴 중앙 여부', 'value': True}, {'condition': '고개 젖힘/숙임 여부', 'value': True}]
video_path = r"c:\Users\human\Documents\카카오톡 받은 파일\kneepushup\video_kneepushup.mp4"


COND_JOINT_MAP = {
    0: [5,7,9,6,8,10],     # 팔꿈치/팔
    1: [5,6,11,12],        # 몸통 정렬
    2: [9,10],             # 손 위치
    3: [11,12,13,14],      # 깊이
    4: list(range(17)),    # 전체 안정성
}
preprocess = transforms.Compose([
    transforms.ToPILImage(),
    transforms.Resize((256,256)),
    transforms.ToTensor()
])

def getAllFrames(video_path):
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps is None or fps <= 1:
        fps = 30  # 🔥 필수 fallback
    frames = []
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        frames.append(frame)
    return frames

def keypoints_npform(xy):
    if xy.shape[0]<48:
        return np.concatenate([xy, np.zeros(48 - xy.shape[0])])
    else:
        return xy

def score_to_color(s, th=0.5):
    return (0,255,0) if s >= th else (0,0,255)

def put_korean_text(frame, text, pos, color):
    img_pil = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    draw = ImageDraw.Draw(img_pil)
    draw.text(pos, text, font=FONT, fill=(color[2], color[1], color[0]))
    return cv2.cvtColor(np.array(img_pil), cv2.COLOR_RGB2BGR)

frames = getAllFrames(video_path)
frames = np.array(frames)
len(frames) # 578

# 관절 인식
res = [detector(frame, verbose = False)[0] for frame in frames]
xy_data = [i.keypoints.xy.detach().cpu().numpy() for i in res]
# 한명만 선택
xy_data = [i[:1] if i.shape[0] > 1 else i for i in xy_data]
[i.shape for i in xy_data]
# 관절값이 48개보다 작으면 0으로 채워넣음

xy_data = [keypoints_npform(i.reshape(-1)) for i in xy_data]
xy_data = np.array(xy_data) # (578, 48)

# Score 산출 
SEQ = 16
cond_dim = 5
scores = []
for i, img in enumerate(frames):
    img_tensor = preprocess(img).unsqueeze(0).to(device)
    cond_tensor = torch.ones((1,cond_dim), device = device)
    seq = [xy_data[j] for j in range(i-SEQ+1, i+1)]
    seq_tensor = torch.tensor(
        seq, dtype = torch.float32, device=device
        ).unsqueeze(0)
    # 현재의 이미지, 현재부터 과거 16프레임까지의 관절, 
    # 조건값(척추중립, 이완시 팔꿈치 각도, 가슴의 충분한이동, 손의 위치 가슴 중앙 여부)
    with torch.no_grad():
        score = net(
            img_tensor, seq_tensor, cond_tensor
            ).squeeze().detach().cpu().numpy()
    scores.append(score)

scores = np.array(scores) # 578, 5

#  시각화
out_video_path= "ex.mp4"
cap = cv2.VideoCapture(video_path)
fps = cap.get(cv2.CAP_PROP_FPS)
W, H = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
writer = cv2.VideoWriter(out_video_path, cv2.VideoWriter_fourcc(*"mp4v"), fps, (W,H))
export_video = frames.copy()
for img, score, key_point in zip(export_video, scores, xy_data):
    # 관절별 스코어 색상 설정
    joint_colors = {}
    for c_idx, joints in COND_JOINT_MAP.items():
        for j in joints:
            joint_colors[j] = score_to_color(score[c_idx])
    
    # 버림 처리
    pts = key_point.reshape(-1,2).astype(int)
    for j,(x,y) in enumerate(pts):
        cv2.circle(img, (x,y), 4, joint_colors.get(j,(200,200,200)), -1)
    
    y0 = 30
    for name, s in zip(cond_names, score):
        img = put_korean_text(img, f"{name}: {s:.2f}", (20,y0), score_to_color(s))
        y0 += 28
    writer.write(img)
writer.release()
