import torch, cv2, tqdm
import numpy as np 
from PIL import Image
from ultralytics import YOLO
from torchvision import transforms
from PIL import Image, ImageDraw, ImageFont

from utils.network import Model5Cond

class VideoModel:
    def __init__(
        self, 
        score_model_path, key_point_model_path, 
        cond_names, joint_map, font_path, transform,
        device="cpu"
        ):
        self.score_model_path = score_model_path
        self.key_point_model_path = key_point_model_path
        self.device = torch.device(device)
        self.cond_names = cond_names
        self.joint_map = joint_map
        self.FONT = ImageFont.truetype(font_path, 24)
        self.score_model = Model5Cond(len(self.cond_names))
        weights = torch.load(self.score_model_path, map_location= torch.device("cpu"))
        self.score_model.load_state_dict(weights)
        self.score_model.eval()
        self.key_point_model = YOLO(self.key_point_model_path)
        self.preprocess = transform

    def get_all_frames(self, video_path):
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
    
    def keypoints_npform(self, xy):
        if xy.shape[0]<48:
            return np.concatenate([xy, np.zeros(48 - xy.shape[0])])
        else:
            return xy
        
    def score_to_color(self, s, th=0.5):
        return (0,255,0) if s >= th else (0,0,255)
    
    def put_korean_text(self, frame, text, pos, color):
        img_pil = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        draw = ImageDraw.Draw(img_pil)
        draw.text(pos, text, font=self.FONT, fill=(color[2], color[1], color[0]))
        return cv2.cvtColor(np.array(img_pil), cv2.COLOR_RGB2BGR)
    
    def get_keypoints(self, frames):
        detector = self.key_point_model 
        # 관절 인식
        res = [self.key_point_model(
            frame, verbose = False)[0] for frame in tqdm.tqdm(frames)]
        xy_data = [i.keypoints.xy.detach().cpu().numpy() for i in res]
        # 한명만 선택
        xy_data = [i[:1] if i.shape[0] > 1 else i for i in xy_data]
        # 관절값이 48개보다 작으면 0으로 채워넣음
        xy_data = [self.keypoints_npform(i.reshape(-1)) for i in xy_data]
        xy_data = np.array(xy_data) # (578, 48)
        return xy_data
    
    def get_score(self, frames, key_points, seq_len = 16):
        cond_dim = len(self.cond_names)
        scores = []
        for i, img in enumerate(tqdm.tqdm(frames)):
            img_tensor = self.preprocess(img).unsqueeze(0).to(self.device)
            cond_tensor = torch.ones((1,cond_dim), device = self.device)
            seq = [key_points[j] for j in range(i-seq_len+1, i+1)]
            seq_tensor = torch.tensor(
                seq, dtype = torch.float32, device=self.device
                ).unsqueeze(0)
            # 현재의 이미지, 현재부터 과거 16프레임까지의 관절, 
            # 조건값(척추중립, 이완시 팔꿈치 각도, 가슴의 충분한이동, 손의 위치 가슴 중앙 여부)
            with torch.no_grad():
                score = self.score_model(
                    img_tensor, seq_tensor, cond_tensor
                    ).squeeze().detach().cpu().numpy()
            scores.append(score)
        scores = np.array(scores) # 578, 5
        return scores
    
    def vis_frame(self, frames, key_points, scores):
        output = frames.copy()
        for i, (img, score, key_point) in enumerate(
            tqdm.tqdm(zip(output, scores, key_points), total=len(output))
        ):
            # 관절별 스코어 색상 설정
            joint_colors = {}
            for c_idx, joints in COND_JOINT_MAP.items():
                for j in joints:
                    joint_colors[j] = self.score_to_color(score[c_idx])
            # 버림 처리
            pts = key_point.reshape(-1,2).astype(int)
            for j,(x,y) in enumerate(pts):
                cv2.circle(img, (x,y), 4, joint_colors.get(j,(200,200,200)), -1)
            y0 = 30
            for name, s in zip(self.cond_names, score):
                img = self.put_korean_text(
                    img, f"{name['condition']}: {s:.2f}", (20,y0), self.score_to_color(s))
                output[i] = img
                y0 += 28
        return np.array(output)


cond_names = [{
    'condition': '척추의 중립', 'value': True}, 
    {'condition': '이완시 팔꿈치 90도', 'value': True}, 
    {'condition': '가슴의 충분한 이동', 'value': True}, 
    {'condition': '손의 위치 가슴 중앙 여부', 'value': True}, 
    {'condition': '고개 젖힘/숙임 여부', 'value': True}]

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

# 모델 추가 시 해당 클레스 여러개 생성할 것
kneepushup_model = VideoModel(
    "./utils/weights/model_kneepushup.pth",
    "./utils/weights/yolov8n-pose.pt",
    cond_names, COND_JOINT_MAP, 
    "./utils/NanumGothic-Regular.ttf",
    preprocess
    )


# video_path = r"c:\Users\human\Documents\카카오톡 받은 파일\kneepushup\video_kneepushup.mp4"
# kneepushup_model.cond_names
# frames = kneepushup_model.get_all_frames(video_path)
# keypoints = kneepushup_model.get_keypoints(frames)
# scores = kneepushup_model.get_score(frames, keypoints)
# output = kneepushup_model.vis_frame(frames, keypoints, scores)
# out_video_path= "ex2.mp4"
# cap = cv2.VideoCapture(video_path)
# fps = cap.get(cv2.CAP_PROP_FPS)
# W, H = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

# writer = cv2.VideoWriter(out_video_path, cv2.VideoWriter_fourcc(*"mp4v"), fps, (W,H))
# for img in tqdm.tqdm(output):
#     writer.write(img)

# writer.release()


