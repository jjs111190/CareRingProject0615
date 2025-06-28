from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
import os
import uuid
import shutil

from app.database import get_db
from app.models.user import User
from app.dependencies import get_current_user

router = APIRouter(prefix="/upload", tags=["Upload"])

# ✅ 이미지 저장 경로 초기화
UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 파일 확장자 검증
    allowed_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
    file_extension = os.path.splitext(file.filename)[1].lower()
    
    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail="Invalid file type. Only images are allowed."
        )

    # 파일 크기 검증 (10MB 제한)
    if file.size > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="File too large. Maximum size is 10MB."
        )

    # 고유한 파일명 생성
    filename = f"{current_user.id}_{uuid.uuid4().hex}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    # 파일 저장
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save file: {str(e)}"
        )

    # 파일 URL 반환
    file_url = f"/static/uploads/{filename}"
    
    return {
        "message": "File uploaded successfully",
        "file_url": file_url,
        "filename": filename
    }

@router.post("/background")
async def upload_background_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 배경 이미지 전용 업로드 (더 큰 크기 허용)
    allowed_extensions = {'.jpg', '.jpeg', '.png', '.webp'}
    file_extension = os.path.splitext(file.filename)[1].lower()
    
    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail="Invalid file type. Only images are allowed."
        )

    # 파일 크기 검증 (20MB 제한)
    if file.size > 20 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="File too large. Maximum size is 20MB."
        )

    # 배경 이미지 디렉토리
    bg_dir = os.path.join(UPLOAD_DIR, "backgrounds")
    os.makedirs(bg_dir, exist_ok=True)

    # 고유한 파일명 생성
    filename = f"bg_{current_user.id}_{uuid.uuid4().hex}{file_extension}"
    file_path = os.path.join(bg_dir, filename)

    # 파일 저장
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save file: {str(e)}"
        )

    # 파일 URL 반환
    file_url = f"/static/uploads/backgrounds/{filename}"
    
    return {
        "message": "Background image uploaded successfully",
        "file_url": file_url,
        "filename": filename
    }