package models

import "time"

// User represents a registered user
type User struct {
	ID        string    `json:"id" gorm:"primaryKey"`
	Username  string    `json:"username" gorm:"uniqueIndex;not null"`
	Password  string    `json:"-" gorm:"not null"` // Hashed password
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// Session represents a coding session
type Session struct {
	ID        string    `json:"sessionId" gorm:"primaryKey"`
	Language  string    `json:"language"`
	Code      string    `json:"code"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
	// Clients are transient/in-memory, not stored in DB
}

// Client interface (unchanged)
type Client interface {
	WriteJSON(v interface{}) error
}

// CreateSessionRequest is the payload for creating a session
type CreateSessionRequest struct {
	// Potentially allow setting initial language/code
	Language string `json:"language,omitempty"`
}

// CreateSessionResponse is the response after creating a session
type CreateSessionResponse struct {
	SessionID string `json:"sessionId"`
}

// ExecuteRequest is the payload for code execution
type ExecuteRequest struct {
	Code     string `json:"code"`
	Language string `json:"language"`
}

// ExecuteResponse is the result of code execution
type ExecuteResponse struct {
	Success       bool   `json:"success"`
	Output        string `json:"output"`
	Error         string `json:"error,omitempty"`
	ExecutionTime int64  `json:"executionTime"` // in milliseconds
}

// AuthRequest represents login/register payload
type AuthRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// AuthResponse represents the response after successful login
type AuthResponse struct {
	Token    string `json:"token"`
	UserID   string `json:"userId"`
	Username string `json:"username"`
}
