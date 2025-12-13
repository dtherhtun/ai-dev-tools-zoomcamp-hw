package api

import "net/http"

// SetupRoutes configures the main router
func (s *Server) SetupRoutes() *http.ServeMux {
	mux := http.NewServeMux()

	// Public Routes
	mux.HandleFunc("/register", s.RegisterHandler)
	mux.HandleFunc("/login", s.LoginHandler)

	// Protected Routes
	// POST /sessions -> Protected
	mux.HandleFunc("/sessions", s.AuthMiddleware(s.CreateSessionHandler))

	// GET /sessions/{id} -> contains WS logic which does its own check.
	// We rely on the handler's internal check for "token" param during WS upgrade,
	// and if standard GET, we allow it (or should protect it? For now, allowing as per implementation).
	mux.HandleFunc("/sessions/", s.GetSessionHandler)

	// POST /execute -> Protected
	mux.HandleFunc("/execute", s.AuthMiddleware(s.ExecuteCodeHandler))

	return mux
}
