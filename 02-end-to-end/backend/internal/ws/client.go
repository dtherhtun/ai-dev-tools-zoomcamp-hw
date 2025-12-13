package ws

import (
	"encoding/json"

	"log"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer.
	maxMessageSize = 512
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	// Allow all origins for dev simplicity
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// Client is a middleman between the websocket connection and the hub.
type Client struct {
	Hub *Hub

	// The websocket connection.
	Conn *websocket.Conn

	// Buffered channel of outbound messages.
	SendChan chan []byte

	// User info
	UserID    string
	UserName  string
	UserColor string
	SessionID string
}

// Send implements the models.Client interface but we use SendChan directly in internal packages
func (c *Client) Send(msg interface{}) {
	// Not used in this implementation pattern, using channels
}

func ServeWs(hub *Hub, w http.ResponseWriter, r *http.Request, sessionID string) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	// Setup client with random user data for now
	// In a real app we'd get this from auth context
	userID := uuid.New().String()

	client := &Client{
		Hub:       hub,
		Conn:      conn,
		SendChan:  make(chan []byte, 256),
		UserID:    userID,
		UserName:  "User " + userID[:4], // Simple random name
		UserColor: "#" + userID[:6],     // Random color
		SessionID: sessionID,
	}

	client.Hub.Register <- client

	// Send initial "connected" message
	connectedMsg := map[string]interface{}{
		"type": "connected",
		"data": map[string]interface{}{
			"sessionId": sessionID,
			"userId":    userID,
		},
	}
	if err := client.Conn.WriteJSON(connectedMsg); err != nil {
		log.Println("Error sending connected message:", err)
	}

	// Send "user-joined" for self so frontend knows own identity details used by server
	// Actually frontend handles 'connected' but might appreciate the user object

	go client.writePump()
	go client.readPump()
}

// readPump pumps messages from the websocket connection to the hub.
func (c *Client) readPump() {
	defer func() {
		c.Hub.Unregister <- c
		c.Conn.Close()
	}()
	c.Conn.SetReadLimit(maxMessageSize)
	c.Conn.SetReadDeadline(time.Now().Add(pongWait))
	c.Conn.SetPongHandler(func(string) error { c.Conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })

	for {
		_, message, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}

		// Parse message to determine type
		var msg map[string]interface{}
		if err := json.Unmarshal(message, &msg); err != nil {
			log.Println("Invalid JSON:", err)
			continue
		}

		msgType, _ := msg["type"].(string)

		switch msgType {
		case "code-update":
			// Broadcast to others
			c.Hub.BroadcastToOthers(message, c)
		case "language-change":
			// Broadcast to others
			c.Hub.BroadcastToOthers(message, c)
		case "cursor-move":
			// Broadcast to others
			c.Hub.BroadcastToOthers(message, c)
		default:
			log.Println("Unknown message type:", msgType)
		}
	}
}

// writePump pumps messages from the hub to the websocket connection.
func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()
	for {
		select {
		case message, ok := <-c.SendChan:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// The hub closed the channel.
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.Conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// Add queued chat messages to the current websocket message.
			n := len(c.SendChan)
			for i := 0; i < n; i++ {
				w.Write(<-c.SendChan)
			}

			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
