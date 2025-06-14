# sockets.py

from socketio import AsyncServer
from fastapi_socketio import SocketManager # This import might not be needed if not using SocketManager
from fastapi import Request, WebSocket # These imports might not be needed if not using Request/WebSocket directly here
import redis
import json
from typing import List

# ✅ Redis 클라이언트 설정
redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)

# Removed Redis에서 받은 post 이벤트 처리 (listen_to_redis function)
# Because post events are now handled directly by Go server's Redis subscriber

# ✅ Redis를 통해 Go 서버로 메시지 전달 (assuming this is for general chat, not posts)
def broadcast_to_go(user: str, message: str):
    payload = json.dumps({"user": user, "msg": message})
    redis_client.publish("chat_channel", payload)

# ✅ Socket.IO 서버 인스턴스
sio = AsyncServer(async_mode="asgi", cors_allowed_origins="*")


# 게시글용 room join (if this was specifically for Socket.IO based post feed, it's less relevant now)
# However, if other parts of the app use 'feed' room for Socket.IO, keep it.
@sio.event
async def join_feed(sid):
    await sio.enter_room(sid, "feed")
    print(f"✅ {sid} joined feed room")

# NOTE: decode_jwt function is not provided, assuming it exists elsewhere or JWT handling is for another part
def decode_jwt(token: str):
    # Dummy decode function - replace with actual JWT decoding logic
    import jwt # You might need to install 'pyjwt'
    try:
        # Assuming your JWT has a 'user_id' claim
        decoded = jwt.decode(token, "your-secret-key", algorithms=["HS256"]) # Replace "your-secret-key" with your actual secret
        return decoded.get("user_id")
    except Exception as e:
        print(f"❌ JWT decoding error: {e}")
        return None

@sio.event
async def connect(sid, environ, auth):
    # token = environ.get('QUERY_STRING').split('token=')[-1].split('&')[0] # This gets token from query string
    # Assuming the token is now passed via 'auth' dictionary from the Socket.IO client if configured
    token = auth.get('token')
    user_id = None
    if token:
        user_id = decode_jwt(token)  # 직접 디코딩하는 함수 필요
    
    if user_id:
        room = f"user_{user_id}"
        await sio.save_session(sid, {'user_id': user_id})
        await sio.enter_room(sid, room)
        print(f"✅ {sid} joined room {room} with user ID {user_id}")
    else:
        print(f"⚠️ {sid} connected without a valid user ID or token.")
        # Optionally, you might want to disconnect clients without valid auth immediately
        # await sio.disconnect(sid)


@sio.event
async def disconnect(sid):
    session = await sio.get_session(sid)
    user_id = session.get('user_id')
    if user_id:
        room = f"user_{user_id}"
        await sio.leave_room(sid, room)
        print(f"❌ {sid} left room {room}")
    else:
        print(f"❌ {sid} disconnected (no user ID in session).")


@sio.event
async def join(sid, data):
    room = data.get("room")
    if room:
        await sio.save_session(sid, {'room': room}) # This might overwrite user_id if both are saved in 'room' session
        await sio.enter_room(sid, room)
        print(f"📦 {sid} joined room: {room}")

@sio.event
async def leave(sid, data):
    room = data.get("room")
    if room:
        await sio.leave_room(sid, room)
        print(f"👋 {sid} left room: {room}")

@sio.on("leave")
async def handle_leave(sid, data):
    room = data.get("room")
    if room:
        await sio.leave_room(sid, room)
        print(f"👋 User with sid {sid} left room: {room}")

@sio.on("join")
async def handle_join(sid, data):
    room = data.get("room")
    if room:
        await sio.enter_room(sid, room)
        print(f"✅ User with sid {sid} joined room: {room}")

@sio.event
async def typing(sid, data):
    receiver_id = data.get('receiverId')
    sender_id = data.get('senderId')
    if receiver_id and sender_id: # Ensure IDs exist
        room = f"user_{receiver_id}"
        await sio.emit("typing", sender_id, room=room)
    else:
        print("⚠️ Missing receiverId or senderId for typing event.")


@sio.on("send_message")
async def handle_send_message(sid, data):
    receiver_id = data.get('receiver_id')
    if receiver_id:
        receiver_room = f"user_{receiver_id}"
        await sio.emit("message", data, room=receiver_room)
    else:
        print("⚠️ Missing receiver_id for send_message event.")