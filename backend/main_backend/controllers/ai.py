from fastapi.responses import JSONResponse, FileResponse
from fastapi import status, UploadFile, File

from services import ai
async def analyze_exercise_video(video: UploadFile = File(...)):
    try:
        output_path = await ai.analyze_exercise_video(video)
        return FileResponse(
            output_path,
            media_type="video/mp4",
            filename="result.mp4"
        )
    except Exception as e:
        print("🔥 analyze_exercise_video error:", e)
        return JSONResponse(
            {"message":"테스트 실패", "detail":str(e)},
            status_code=status.HTTP_404_NOT_FOUND
        )

