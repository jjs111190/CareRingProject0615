from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
import json
import os
import uuid
import shutil

from app.database import get_db
from app.models.profile_customization import ProfileCustomization
from app.models.user import User
from app.dependencies import get_current_user
from app.schemas.customization import CustomizationRequest, CustomizationResponse, WidgetSchema

router = APIRouter(prefix="/profile", tags=["Profile Customization"])

# ✅ 배경 이미지 업로드 디렉토리
BACKGROUND_DIR = "static/uploads/backgrounds"
os.makedirs(BACKGROUND_DIR, exist_ok=True)

# ✅ 배경 이미지 업로드
@router.post("/background/upload")
async def upload_background_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 파일 확장자 검증
    allowed_extensions = {'.jpg', '.jpeg', '.png', '.webp'}
    file_extension = os.path.splitext(file.filename)[1].lower()
    
    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail="Invalid file type. Only images are allowed."
        )

    # 파일 크기 검증 (20MB 제한)
    if file.size and file.size > 20 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="File too large. Maximum size is 20MB."
        )

    # 고유한 파일명 생성
    filename = f"bg_{current_user.id}_{uuid.uuid4().hex}{file_extension}"
    file_path = os.path.join(BACKGROUND_DIR, filename)

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

# ✅ 프로필 커스터마이징 저장
@router.post("/customization")
def save_profile_customization(
    data: CustomizationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        existing = db.query(ProfileCustomization).filter(
            ProfileCustomization.user_id == current_user.id
        ).first()

        if existing:
            # 기존 커스터마이징 업데이트
            existing.background_type = data.background_type
            existing.background_color = data.background_color
            existing.gradient_colors = json.dumps(data.gradient_colors)
            existing.background_image = data.background_image
            existing.widgets = json.dumps([widget.dict() for widget in data.widgets])
        else:
            # 새로운 커스터마이징 생성
            new_customization = ProfileCustomization(
                user_id=current_user.id,
                background_type=data.background_type,
                background_color=data.background_color,
                gradient_colors=json.dumps(data.gradient_colors),
                background_image=data.background_image,
                widgets=json.dumps([widget.dict() for widget in data.widgets])
            )
            db.add(new_customization)

        db.commit()
        return {"message": "Profile customization saved successfully", "success": True}
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save customization: {str(e)}"
        )

# ✅ 내 프로필 커스터마이징 조회
@router.get("/customization/me", response_model=CustomizationResponse)
def get_my_profile_customization(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    customization = db.query(ProfileCustomization).filter(
        ProfileCustomization.user_id == current_user.id
    ).first()

    if not customization:
        # 기본 커스터마이징 반환
        return CustomizationResponse(
            background_type="gradient",
            background_color="#4387E5",
            gradient_colors=["#4387E5", "#6ba3f5"],
            background_image=None,
            widgets=[]
        )

    # JSON 파싱
    try:
        gradient_colors = json.loads(customization.gradient_colors) if customization.gradient_colors else ["#4387E5", "#6ba3f5"]
        widgets_data = json.loads(customization.widgets) if customization.widgets else []
        
        # 위젯 데이터를 WidgetSchema로 변환
        widgets = [WidgetSchema(**widget) for widget in widgets_data]
        
        return CustomizationResponse(
            background_type=customization.background_type,
            background_color=customization.background_color,
            gradient_colors=gradient_colors,
            background_image=customization.background_image,
            widgets=widgets
        )
    except json.JSONDecodeError:
        # JSON 파싱 실패 시 기본값 반환
        return CustomizationResponse(
            background_type="gradient",
            background_color="#4387E5",
            gradient_colors=["#4387E5", "#6ba3f5"],
            background_image=None,
            widgets=[]
        )

# ✅ 특정 사용자 프로필 커스터마이징 조회
@router.get("/customization/{user_id}", response_model=CustomizationResponse)
def get_profile_customization(user_id: int, db: Session = Depends(get_db)):
    customization = db.query(ProfileCustomization).filter(
        ProfileCustomization.user_id == user_id
    ).first()

    if not customization:
        # 기본 커스터마이징 반환
        return CustomizationResponse(
            background_type="gradient",
            background_color="#4387E5",
            gradient_colors=["#4387E5", "#6ba3f5"],
            background_image=None,
            widgets=[]
        )

    try:
        gradient_colors = json.loads(customization.gradient_colors) if customization.gradient_colors else ["#4387E5", "#6ba3f5"]
        widgets_data = json.loads(customization.widgets) if customization.widgets else []
        
        # 위젯 데이터를 WidgetSchema로 변환
        widgets = [WidgetSchema(**widget) for widget in widgets_data]
        
        return CustomizationResponse(
            background_type=customization.background_type,
            background_color=customization.background_color,
            gradient_colors=gradient_colors,
            background_image=customization.background_image,
            widgets=widgets
        )
    except json.JSONDecodeError:
        return CustomizationResponse(
            background_type="gradient",
            background_color="#4387E5",
            gradient_colors=["#4387E5", "#6ba3f5"],
            background_image=None,
            widgets=[]
        )

# ✅ 위젯만 업데이트
@router.put("/widgets")
def update_widget_layout(
    widgets: List[WidgetSchema],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        customization = db.query(ProfileCustomization).filter(
            ProfileCustomization.user_id == current_user.id
        ).first()

        if not customization:
            # 새로운 커스터마이징 생성 (위젯만)
            new_customization = ProfileCustomization(
                user_id=current_user.id,
                background_type="gradient",
                background_color="#4387E5",
                gradient_colors=json.dumps(["#4387E5", "#6ba3f5"]),
                background_image=None,
                widgets=json.dumps([widget.dict() for widget in widgets])
            )
            db.add(new_customization)
        else:
            # 위젯만 업데이트
            customization.widgets = json.dumps([widget.dict() for widget in widgets])

        db.commit()
        return {"message": "Widget layout updated successfully", "success": True}
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update widgets: {str(e)}"
        )

# ✅ 커스터마이징 삭제 (기본값으로 리셋)
@router.delete("/customization")
def reset_profile_customization(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        customization = db.query(ProfileCustomization).filter(
            ProfileCustomization.user_id == current_user.id
        ).first()

        if customization:
            db.delete(customization)
            db.commit()

        return {"message": "Profile customization reset to default", "success": True}
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to reset customization: {str(e)}"
        )