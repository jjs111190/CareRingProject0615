import asyncio
import websockets
import json
from typing import Dict

import redis.asyncio as aioredis
GO_WS_URL = "ws://localhost:8082/ws?token=YOUR_JWT_HERE"  # 실서비스에선 https

async def send_message_to_go_server(data: Dict):
    async with websockets.connect(GO_WS_URL) as websocket:
        await websocket.send(json.dumps(data))
        print("✅ 메시지 전송 완료")

        # 수신 테스트 (선택)
        response = await websocket.recv()
        print("📥 수신된 응답:", response)

# 사용 예시 (테스트 목적)
if __name__ == "__main__":
    sample_data = {
        "room": "chatroom-1",
        "content": "FastAPI에서 보낸 메시지"
    }
    asyncio.run(send_message_to_go_server(sample_data))

async def subscribe_to_redis():
    redis = aioredis.from_url("redis://localhost")
    pubsub = redis.pubsub()
    await pubsub.subscribe("post_channel")

    print("✅ Subscribed to Redis channel: post_channel")

    while True:
        try:
            message = await pubsub.get_message(ignore_subscribe_messages=True)
            if message:
                data = message["data"].decode()
                parsed = json.loads(data)
                await manager.broadcast(json.dumps(parsed))
        except Exception as e:
            print(f"❌ Redis subscription error: {e}")
        await asyncio.sleep(0.01)