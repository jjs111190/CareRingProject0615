from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import json

from app.database import get_db
from app.models.widget_layout import WidgetLayout
from app.models.user import User
from app.dependencies import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/widgets", tags=["Widget Layout"])

class WidgetData(BaseModel):
    id: str
    type: str
    position: Dict[str, float]
    size: str
    config: Dict[str, Any] = {}

class WidgetLayoutRequest(BaseModel):
    widgets: List[WidgetData]

# ✅ 위젯 레이아웃 저장
@router.post("/layout")
def save_widget_layout(
    data: WidgetLayoutRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(WidgetLayout).filter(
        WidgetLayout.user_id == current_user.id
    ).first()

    widgets_json = json.dumps([widget.dict() for widget in data.widgets])

    if existing:
        existing.widgets = widgets_json
    else:
        new_layout = WidgetLayout(
            user_id=current_user.id,
            widgets=widgets_json
        )
        db.add(new_layout)

    db.commit()
    return {"message": "Widget layout saved successfully"}

# ✅ 내 위젯 레이아웃 조회
@router.get("/layout/me")
def get_my_widget_layout(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    layout = db.query(WidgetLayout).filter(
        WidgetLayout.user_id == current_user.id
    ).first()

    if not layout:
        return {"widgets": []}

    return {
        "widgets": json.loads(layout.widgets) if layout.widgets else []
    }

# ✅ 특정 사용자 위젯 레이아웃 조회
@router.get("/layout/{user_id}")
def get_widget_layout(user_id: int, db: Session = Depends(get_db)):
    layout = db.query(WidgetLayout).filter(
        WidgetLayout.user_id == user_id
    ).first()

    if not layout:
        return {"widgets": []}

    return {
        "widgets": json.loads(layout.widgets) if layout.widgets else []
    }

# ✅ 위젯 추가
@router.post("/add")
def add_widget(
    widget: WidgetData,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    layout = db.query(WidgetLayout).filter(
        WidgetLayout.user_id == current_user.id
    ).first()

    if layout:
        widgets = json.loads(layout.widgets) if layout.widgets else []
        widgets.append(widget.dict())
        layout.widgets = json.dumps(widgets)
    else:
        new_layout = WidgetLayout(
            user_id=current_user.id,
            widgets=json.dumps([widget.dict()])
        )
        db.add(new_layout)

    db.commit()
    return {"message": "Widget added successfully"}

# ✅ 위젯 삭제
@router.delete("/{widget_id}")
def remove_widget(
    widget_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    layout = db.query(WidgetLayout).filter(
        WidgetLayout.user_id == current_user.id
    ).first()

    if not layout:
        raise HTTPException(status_code=404, detail="Widget layout not found")

    widgets = json.loads(layout.widgets) if layout.widgets else []
    widgets = [w for w in widgets if w.get('id') != widget_id]
    layout.widgets = json.dumps(widgets)

    db.commit()
    return {"message": "Widget removed successfully"}