from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class ProfileCustomization(Base):
    __tablename__ = "profile_customizations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    background_type = Column(String(20), default="gradient")  # gradient, solid, image
    background_color = Column(String(7), default="#4387E5")  # hex color
    gradient_colors = Column(Text)  # JSON string of gradient colors
    background_image = Column(String(255), nullable=True)  # image URL
    widgets = Column(Text)  # JSON string of widgets
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship
    user = relationship("User", back_populates="profile_customization")