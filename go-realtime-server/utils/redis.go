// redis.go (utils package)

package utils

import (
	"context"
	"encoding/json"
	"log"
	"sync" // sync 패키지 필요

	"github.com/gorilla/websocket"
	"github.com/redis/go-redis/v9"
)

var RedisClient *redis.Client

// 여러 사용자가 같은 방에 들어갈 수 있도록 구조 변경 및 Mutex 추가
var Clients = make(map[string]map[*websocket.Conn]bool)
var Mu sync.RWMutex // Clients 맵을 보호하기 위한 RWMutex (M을 대문자로 변경하여 export)
var Ctx = context.Background()

// General message structure for broadcasting
type WebSocketMessage struct {
	Type               string      `json:"type"`
	Room               string      `json:"room,omitempty"`
	Post               interface{} `json:"post,omitempty"`
	PostID             int         `json:"post_id,omitempty"`
	Likes              int         `json:"likes,omitempty"`
	Comment            interface{} `json:"comment,omitempty"`
	Content            string      `json:"content,omitempty"`
	SenderID           int         `json:"sender_id,omitempty"`
	ReceiverID         int         `json:"receiver_id,omitempty"`
	Timestamp          string      `json:"timestamp,omitempty"`
	MessageID          int         `json:"message_id,omitempty"`
	SenderNickname     string      `json:"sender_nickname,omitempty"`
	SenderProfileImage string      `json:"sender_profile_image,omitempty"`
}

// SetRedisClient는 main.go에서 생성된 클라이언트를 받아 전역 변수로 설정
func SetRedisClient(client *redis.Client) {
	RedisClient = client
}

// Publish: 메시지를 해당 채널에 전송
func Publish(channel string, msg string) {
	if RedisClient == nil {
		log.Println("❌ [Publish] RedisClient가 초기화되지 않았습니다!")
		return
	}
	RedisClient.Publish(Ctx, channel, msg)
}

// SubscribeAndBroadcast는 이제 인자 없이 전역 RedisClient를 사용
func SubscribeAndBroadcast() {
	if RedisClient == nil {
		log.Println("❌ [SubscribeAndBroadcast] RedisClient가 초기화되지 않았습니다!")
		return
	}

	pubsub := RedisClient.Subscribe(Ctx, "chat_channel", "post_channel")
	ch := pubsub.Channel()

	for msg := range ch {
		var wsMessage WebSocketMessage
		err := json.Unmarshal([]byte(msg.Payload), &wsMessage)
		if err != nil {
			log.Printf("❌ Redis 메시지 파싱 실패: %v\n", err)
			continue
		}

		targetRoom := wsMessage.Room
		// post 관련 이벤트는 모두 'feed' 룸으로 브로드캐스트
		switch wsMessage.Type {
		case "new_post", "delete_post", "update_post_likes", "new_comment":
			targetRoom = "feed"
		}

		// 특정 룸의 클라이언트들에게 메시지 전송
		Mu.RLock() // 읽기 락 획득 (여러 고루틴이 동시에 읽을 수 있도록)
		clientsInRoom := Clients[targetRoom]
		Mu.RUnlock() // 읽기 락 해제

		if clientsInRoom != nil {
			for client := range clientsInRoom {
				err := client.WriteJSON(wsMessage)
				if err != nil {
					log.Printf("❌ 클라이언트에게 메시지 전송 실패 (룸: %s, 에러: %v)", targetRoom, err)
					// 에러 발생 시 해당 클라이언트 연결 해제
					// HandleWebSocket의 read loop에서 연결 해제를 처리하는 것이 더 안전합니다.
					// 여기서는 단순히 로그를 남기고 다음 클라이언트로 진행합니다.
				}
			}
		} else {
			log.Printf("⚠️ 룸 '%s'에 클라이언트가 없습니다.", targetRoom)
		}
	}
}

// RegisterClient는 클라이언트를 특정 룸에 추가 (utils 패키지로 이동)
func RegisterClient(room string, conn *websocket.Conn) {
	Mu.Lock()
	defer Mu.Unlock()

	if Clients[room] == nil {
		Clients[room] = make(map[*websocket.Conn]bool)
	}
	Clients[room][conn] = true
	log.Printf("✅ 클라이언트 등록됨. Room: %s, Total clients in room: %d", room, len(Clients[room]))
}

// UnregisterClient는 클라이언트를 특정 룸에서 제거 (utils 패키지로 이동)
func UnregisterClient(room string, conn *websocket.Conn) {
	Mu.Lock()
	defer Mu.Unlock()

	if Clients[room] != nil {
		delete(Clients[room], conn)
		conn.Close() // 클라이언트 연결 종료
		log.Printf("🔌 클라이언트 연결 해제됨. Room: %s, Total clients in room: %d", room, len(Clients[room]))
		if len(Clients[room]) == 0 {
			delete(Clients, room) // 방에 클라이언트가 없으면 방 자체를 삭제
			log.Printf("🗑️ 빈 방 삭제됨: %s", room)
		}
	}
}
