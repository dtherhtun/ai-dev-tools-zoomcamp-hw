package api

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"backend/internal/auth"
	"backend/internal/executor"
	"backend/internal/models"
	"backend/internal/session"
	"backend/internal/users" // Added for user management
	"backend/internal/ws"

	"github.com/gorilla/websocket"
)

type Server struct {
	Store     *session.Store
	UserStore *users.Store // Added UserStore
	Hub       *ws.Hub
	Executor  *executor.Engine
}

func NewServer(store *session.Store, userStore *users.Store, hub *ws.Hub) *Server { // Added userStore parameter
	return &Server{
		Store:     store,
		UserStore: userStore, // Initialized UserStore
		Hub:       hub,
		Executor:  executor.NewEngine(),
	}
}

// RegisterHandler handles POST /register
func (s *Server) RegisterHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.AuthRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Username == "" || req.Password == "" {
		http.Error(w, "Username and password required", http.StatusBadRequest)
		return
	}

	hashed, err := auth.HashPassword(req.Password)
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	user, err := s.UserStore.CreateUser(req.Username, hashed)
	if err != nil {
		http.Error(w, err.Error(), http.StatusConflict) // User exists
		return
	}

	// Auto login
	token, err := auth.GenerateToken(user.ID, user.Username)
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	resp := models.AuthResponse{
		Token:    token,
		UserID:   user.ID,
		Username: user.Username,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}

// LoginHandler handles POST /login
func (s *Server) LoginHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.AuthRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	user, ok := s.UserStore.GetUserByUsername(req.Username)
	if !ok || !auth.CheckPasswordHash(req.Password, user.Password) {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	token, err := auth.GenerateToken(user.ID, user.Username)
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	resp := models.AuthResponse{
		Token:    token,
		UserID:   user.ID,
		Username: user.Username,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// AuthMiddleware protects routes
func (s *Server) AuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Allow OPTIONS (CORS)
		if r.Method == http.MethodOptions {
			next(w, r)
			return
		}

		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Authorization header required", http.StatusUnauthorized)
			return
		}

		// Expect "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			http.Error(w, "Invalid authorization format", http.StatusUnauthorized)
			return
		}

		tokenStr := parts[1]
		claims, err := auth.ValidateToken(tokenStr)
		if err != nil {
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		// Add context? (Optional, skipping for brevity unless needed)
		// r = r.WithContext(context.WithValue(r.Context(), "user", claims))

		_ = claims // Used for validation only for now

		next(w, r)
	}
}

// CreateSessionHandler handles POST /sessions
func (s *Server) CreateSessionHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.CreateSessionRequest
	// Decode optional body, but ignore errors if empty
	_ = json.NewDecoder(r.Body).Decode(&req)

	session := s.Store.CreateSession(req.Language)

	resp := models.CreateSessionResponse{
		SessionID: session.ID,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}

// GetSessionHandler handles GET /sessions/{id}
// It also handles WebSocket upgrades if it detects a WS request
func (s *Server) GetSessionHandler(w http.ResponseWriter, r *http.Request) {
	// Simple ID extraction from path using net/http generic handler usually needs middleware or explicit parsing
	// Assuming Mux will pass ID, but here I'll use simple trimming for now or assume r.URL.Path logic if I write my own mux,
	// but sticking to standard net/http with ServeMux in main.
	// For now, I'll rely on the caller to handle routing or parse here.

	// If this is a websocket upgrade request:
	if websocket.IsWebSocketUpgrade(r) {
		// Extract ID from path... assumes /sessions/{id}
		// A bit hacky without a router, assuming the route is /sessions/ prefix
		id := r.URL.Path[len("/sessions/"):]

		// Auth check for WS (via query param usually)
		token := r.URL.Query().Get("token")
		if token == "" {
			// Try header? Spec says standard JS WebSocket API doesn't allow custom headers easily.
			// Usually query param or copy protocol.
			// Let's rely on Query Param `?token=...`
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		_, err := auth.ValidateToken(token)
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		ws.ServeWs(s.Hub, w, r, id)
		return
	}

	// Normal HTTP GET (Protected via Middleware if wrapped, but let's check manually or wrapper)
	id := r.URL.Path[len("/sessions/"):]
	session, ok := s.Store.GetSession(id)
	if !ok {
		http.Error(w, "Session not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(session)
}

// ExecuteCodeHandler handles POST /execute
func (s *Server) ExecuteCodeHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.ExecuteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Code == "" || req.Language == "" {
		http.Error(w, "Code and Language are required", http.StatusBadRequest)
		return
	}

	ctx := r.Context()
	// Set timeout
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	start := time.Now()
	output, err := s.Executor.Execute(ctx, req.Code, req.Language)
	duration := time.Since(start).Milliseconds()

	resp := models.ExecuteResponse{
		Success:       err == nil,
		Output:        output,
		ExecutionTime: duration,
	}

	if err != nil {
		resp.Error = err.Error()
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// Middleware for CORS
func CORSMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

		if r.Method == "OPTIONS" {
			return
		}

		next.ServeHTTP(w, r)
	})
}
