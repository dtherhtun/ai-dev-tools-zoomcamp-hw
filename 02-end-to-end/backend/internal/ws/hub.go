package ws

import (
	"encoding/json"
)

// Hub maintains the set of active clients and broadcasts messages to clients.
type Hub struct {
	// Registered clients.
	Clients map[*Client]bool

	// Inbound messages from the clients.
	Broadcast chan []byte

	// Register requests from the clients.
	Register chan *Client

	// Unregister requests from clients.
	Unregister chan *Client
}

func NewHub() *Hub {
	return &Hub{
		Broadcast:  make(chan []byte),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		Clients:    make(map[*Client]bool),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.Clients[client] = true
			h.broadcastUserJoined(client)

		case client := <-h.Unregister:
			if _, ok := h.Clients[client]; ok {
				delete(h.Clients, client)
				close(client.SendChan)
				h.broadcastUserLeft(client)
			}

		case message := <-h.Broadcast:
			for client := range h.Clients {
				select {
				case client.SendChan <- message:
				default:
					close(client.SendChan)
					delete(h.Clients, client)
				}
			}
		}
	}
}

func (h *Hub) broadcastUserJoined(c *Client) {
	msg := map[string]interface{}{
		"type": "user-joined",
		"data": map[string]interface{}{
			"id":            c.UserID,
			"name":          c.UserName,
			"color":         c.UserColor,
			"isCurrentUser": false, // Frontend will handle checking ID
		},
	}
	bytes, _ := json.Marshal(msg)
	h.BroadcastToOthers(bytes, c)
}

func (h *Hub) broadcastUserLeft(c *Client) {
	msg := map[string]interface{}{
		"type": "user-left",
		"data": map[string]interface{}{
			"id": c.UserID,
		},
	}
	bytes, _ := json.Marshal(msg)
	h.BroadcastToOthers(bytes, c)
}

// BroadcastToOthers sends a message to all clients except the sender
func (h *Hub) BroadcastToOthers(message []byte, sender *Client) {
	for client := range h.Clients {
		if client != sender && client.SessionID == sender.SessionID {
			select {
			case client.SendChan <- message:
			default:
				close(client.SendChan)
				delete(h.Clients, client)
			}
		}
	}
}
