from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class WidgetSchema(BaseModel):
    id: str
    type: str
    position: Dict[str, float]
    size: str
    config: Optional[Dict[str, Any]] = {}

class CustomizationRequest(BaseModel):
    background_type: str
    background_color: str
    gradient_colors: List[str]
    background_image: Optional[str] = None
    widgets: List[WidgetSchema]

class CustomizationResponse(BaseModel):
    background_type: str
    background_color: str
    gradient_colors: List[str]
    background_image: Optional[str] = None
    widgets: List[WidgetSchema]

    class Config:
        from_attributes = True