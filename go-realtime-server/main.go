package main

import (
	"fmt"
	"log"
	"net/http"

	"go-realtime-server/utils" // redis.go 경로
	"go-realtime-server/ws"    // ws.go 경로

	"github.com/redis/go-redis/v9"
)

func main() {
	// 1. 단일 Redis 클라이언트 생성
	rdb := redis.NewClient(&redis.Options{
		Addr: "localhost:6379",
	})

	// 2. 생성된 클라이언트를 utils 패키지의 전역 클라이언트로 설정
	utils.SetRedisClient(rdb)

	// 3. Redis 구독 시작 (이제 rdb를 인자로 넘길 필요 없음)
	fmt.Println("🟢 Redis 구독 시작됨 (chat_channel, post_channel)")
	go utils.SubscribeAndBroadcast()

	// 4. WebSocket 핸들러 등록
	http.HandleFunc("/ws", ws.HandleWebSocket)

	// 5. 서버 시작
	log.Println("🚀 WebSocket 서버 실행 중 :8082/ws")
	log.Fatal(http.ListenAndServe(":8082", nil))
}
