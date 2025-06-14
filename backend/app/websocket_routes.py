# websocket_routes.py

from fastapi import APIRouter, WebSocket, Depends
from app.dependencies import get_token

from fastapi.routing import APIRouter
import json

# from app.sockets import sio as socketio # Removed Socket.IO import

router = APIRouter()
user_socket = {}  # ✅ 사용자별 연결 저장

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    user_id = None
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            if message["type"] == "join":
                # The Go server is now handling room registration directly based on the initial join message.
                # If this Python backend still needs to manage user-specific WebSocket connections,
                # this logic can remain, but it's separate from the post broadcasting.
                user_id = message.get("userId") # Use .get() for safer access
                if user_id:
                    user_socket[user_id] = websocket
                    print(f"✅ 유저 {user_id} 연결됨 (Python WS)")

            elif message["type"] == "typing":
                receiver_id = message["receiverId"]
                if receiver_id in user_socket:
                    await user_socket[receiver_id].send_text(json.dumps({
                        "type": "typing",
                        "senderId": user_id # Ensure sender_id is passed
                    }))
            elif message["type"] == "message":
                # 메시지 처리 로직 - assuming this is for direct chat messages
                pass
            
            # --- New: Handle messages from frontend that need to be relayed to Go via Redis ---
            # This part is technically handled by the Go server's /ws endpoint now.
            # If the Python backend needs to act as a proxy or do additional processing,
            # it would publish to Redis here. For this solution, the frontend directly
            # connects to the Go WS, and the Python backend publishes to Redis only
            # when a post is created/deleted/liked/commented via its REST API.
            # So, this `websocket_endpoint` is primarily for chat/user-specific interactions
            # that this Python server directly handles, not for post feed updates.
            # Therefore, we remove the `handle_new_post` etc. that were tied to Socket.IO.
            
    except Exception as e:
        print("❌ WebSocket error (Python):", e)
    finally:
        if user_id and user_id in user_socket:
            del user_socket[user_id]
            print(f"🔌 유저 {user_id} 연결 해제됨 (Python WS)")

# Removed @socketio.on("new_post") as Socket.IO is no longer used for post broadcasting