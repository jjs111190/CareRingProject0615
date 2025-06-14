import redis
import json
from app.sockets import sio  # ✅ Socket.IO Server import

r = redis.Redis(host="localhost", port=6379, decode_responses=True)

def listen_to_redis():
    pubsub = r.pubsub()
    pubsub.subscribe('chat_channel', 'post')

    for message in pubsub.listen():
        if message['type'] == 'message':
            try:
                if message['channel'] == 'chat_channel':
                    data = json.loads(message['data'])
                    receiver_id = data.get("receiver_id")
                    content = data.get("content")
                    # ✅ Socket.IO emit으로 전송
                    sio.emit("receive_message", {"content": content}, room=str(receiver_id))

                elif message['channel'] == 'post':
                    data = json.loads(message['data'])
                    post_id = data.get("post_id")
                    # ✅ 게시글 알림도 Socket.IO emit으로 전송
                    sio.emit("new_post", {"type": "new_post", "post_id": post_id}, room="feed")
            except Exception as e:
                print("❌ Error in Redis message handling:", e)