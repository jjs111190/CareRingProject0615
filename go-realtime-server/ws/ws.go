package ws

import (
	"log"
	"net/http"
	"time"

	"go-realtime-server/utils"

	"github.com/gorilla/websocket"
)

const (
	writeWait  = 20 * time.Second    // write 여유 증가
	pongWait   = 90 * time.Second    // pong 대기시간 늘림
	pingPeriod = (pongWait * 8) / 10 // ping 주기: 72초
)

func HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	upgrader := websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool { return true },
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("❌ WebSocket 업그레이드 실패:", err)
		return
	}

	var joinReq struct {
		Room string `json:"room"`
	}
	if err := conn.ReadJSON(&joinReq); err != nil {
		log.Println("❌ 클라이언트 room 수신 실패:", err)
		conn.Close()
		return
	}

	utils.RegisterClient(joinReq.Room, conn)
	log.Printf("✅ 클라이언트 room '%s' 연결됨\n", joinReq.Room)

	// writePump (ping 포함)
	go func() {
		ticker := time.NewTicker(pingPeriod)
		defer func() {
			ticker.Stop()
			conn.Close()
		}()
		for {
			select {
			case <-ticker.C:
				conn.SetWriteDeadline(time.Now().Add(writeWait))
				if err := conn.WriteMessage(websocket.PingMessage, nil); err != nil {
					log.Printf("❌ Ping 전송 실패: %v", err)
					return
				}
			}
		}
	}()

	// readPump (pong handler 포함)
	conn.SetReadLimit(512)
	conn.SetReadDeadline(time.Now().Add(pongWait))
	conn.SetPongHandler(func(string) error {
		conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseNormalClosure) {
				log.Printf("❌ WebSocket 예상치 못한 종료: %v", err)
			} else {
				log.Printf("❌ 메시지 수신 실패(연결 종료됨): %v", err)
			}

			// 추가 로그 (클라이언트 IP, 시간 등)
			log.Printf("🕵️ 추가 디버깅 로그 - RemoteAddr: %s, 시간: %s", r.RemoteAddr, time.Now().Format(time.RFC3339))

			utils.UnregisterClient(joinReq.Room, conn)
			break
		}
	}
}
