import os
import asyncio
from typing import Optional
from fastapi import FastAPI, HTTPException, Depends, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
import redis.asyncio as aioredis
import json
import socketio
from socketio import ASGIApp

from app.sockets import sio
from app.websocket_routes import router as websocket_router
from app.websocket_client import subscribe_to_redis
from app.routes import mood, widget_layout, upload, basic_info, lifestyle, user, message, follow, favorite, login, post, comment, search, medicines, customization
from app.auth.utils import hash_password, verify_token
from app.database import Base, engine, SessionLocal, get_db
from app.models import User, Comment, Post, BasicInfo, Lifestyle
from app.routes.login import create_access_token
from app.dependencies import get_current_user
from app.schemas import CommentCreate

# ✅ FastAPI 인스턴스 생성
fastapi_app = FastAPI()

# ✅ CORS 설정
fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ DB 테이블 생성
Base.metadata.create_all(bind=engine)

# ✅ 정적 디렉토리 마운트
os.makedirs("media/profiles", exist_ok=True)
fastapi_app.mount("/media", StaticFiles(directory="media"), name="media")
fastapi_app.mount("/static", StaticFiles(directory="static"), name="static")

# ✅ 회원가입 API
class SignupRequest(BaseModel):
    nickname: str
    email: EmailStr
    password: str

@fastapi_app.post("/signup")
async def signup(data: SignupRequest):
    db = SessionLocal()
    try:
        if db.query(User).filter(User.email == data.email).first():
            raise HTTPException(status_code=400, detail="이미 존재하는 이메일입니다.")
        hashed_password = hash_password(data.password)
        new_user = User(nickname=data.nickname, email=data.email, password=hashed_password)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        db.add(BasicInfo(user_id=new_user.id))
        db.commit()
        access_token = create_access_token(data={"user_id": new_user.id})
        return {"access_token": access_token, "token_type": "bearer"}
    finally:
        db.close()

# ✅ Redis Subscriber 백그라운드 실행
@fastapi_app.on_event("startup")
async def startup_event():
    asyncio.create_task(subscribe_to_redis())

# ✅ 라우터 등록
fastapi_app.include_router(login.router)
fastapi_app.include_router(user.router, prefix="/users", tags=["users"])
fastapi_app.include_router(basic_info.router)
fastapi_app.include_router(lifestyle.router)
fastapi_app.include_router(post)
fastapi_app.include_router(message.router)
fastapi_app.include_router(follow.router)
fastapi_app.include_router(comment)
fastapi_app.include_router(favorite.router, prefix="/favorites")
fastapi_app.include_router(websocket_router)
fastapi_app.include_router(mood.router)
fastapi_app.include_router(search.router)
fastapi_app.include_router(medicines.router)
fastapi_app.include_router(customization.router)
fastapi_app.include_router(widget_layout.router)
fastapi_app.include_router(upload.router)

# ✅ 최종 SocketIO 통합
sio = socketio.AsyncServer(cors_allowed_origins="*", allow_credentials=True)
app = ASGIApp(sio, other_asgi_app=fastapi_app)