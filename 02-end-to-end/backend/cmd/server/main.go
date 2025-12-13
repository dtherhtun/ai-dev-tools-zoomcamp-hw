package main

import (
	"log"
	"net/http"
	"os"

	"backend/internal/api"
	"backend/internal/db"
	"backend/internal/session"
	"backend/internal/users"
	"backend/internal/ws"
)

func main() {
	// Initialize Database
	db.Init()

	// Initialize components
	store := session.NewStore()
	userStore := users.NewStore()
	hub := ws.NewHub()

	// Start WebSocket Hub
	go hub.Run()

	// Initialize API Server
	server := api.NewServer(store, userStore, hub)

	// Setup Router
	mux := server.SetupRoutes()

	// Wrap with Middleware (CORS)
	handler := api.CORSMiddleware(mux)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatal("ListenAndServe:", err)
	}
}
