package main_test

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"backend/internal/api"
	"backend/internal/db"
	"backend/internal/models"
	"backend/internal/session"
	"backend/internal/users"
	"backend/internal/ws"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupTestDB() {
	d, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}
	d.AutoMigrate(&models.User{}, &models.Session{})
	db.DB = d
}

func TestBackendFlow(t *testing.T) {
	setupTestDB()

	// Setup DB
	// api_test.SetupTestDB()

	// Setup Server
	store := session.NewStore()
	userStore := users.NewStore()
	hub := ws.NewHub()
	go hub.Run() // Start the hub if needed, though for this flow it's minimal usage by broadcast

	server := api.NewServer(store, userStore, hub)
	mux := server.SetupRoutes()

	// Create test server
	ts := httptest.NewServer(mux)
	defer ts.Close()

	baseURL := ts.URL

	// 0. Register & Login
	t.Log("Registering user...")
	regReq := map[string]string{"username": "testuser", "password": "password123"}
	body, _ := json.Marshal(regReq)
	resp, err := http.Post(baseURL+"/register", "application/json", bytes.NewBuffer(body))
	if err != nil {
		t.Fatalf("Failed to register: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Expected 201 Created, got %d", resp.StatusCode)
	}

	t.Log("Logging in...")
	resp, err = http.Post(baseURL+"/login", "application/json", bytes.NewBuffer(body))
	if err != nil {
		t.Fatalf("Failed to login: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK, got %d", resp.StatusCode)
	}

	var authResp map[string]string
	json.NewDecoder(resp.Body).Decode(&authResp)
	token := authResp["token"]
	t.Log("Got token")

	client := ts.Client() // Use the client configured for the test server? Or standard

	// 1. Create Session
	t.Log("Creating session...")
	sessReq := map[string]string{"language": "python"}
	body, _ = json.Marshal(sessReq)
	req, _ := http.NewRequest("POST", baseURL+"/sessions", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)

	resp, err = client.Do(req)
	if err != nil {
		t.Fatalf("Failed to create session: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("Expected 201 Created, got %d", resp.StatusCode)
	}

	var sessResp map[string]string
	json.NewDecoder(resp.Body).Decode(&sessResp)
	sessionID := sessResp["sessionId"]
	t.Logf("Session ID: %s", sessionID)

	// 2. Get Session
	t.Log("Getting session info...")
	req, _ = http.NewRequest("GET", baseURL+"/sessions/"+sessionID, nil)
	// req.Header.Set("Authorization", "Bearer "+token) // assuming public/unprotected for plain GET as per prior logic

	resp, err = client.Do(req)
	if err != nil {
		t.Fatalf("Failed to get session: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected 200 OK, got %d", resp.StatusCode)
	}

	// 3. Execute Code
	t.Log("Executing code...")
	execReq := map[string]string{
		"code":     "print('Hello from test')",
		"language": "python",
	}
	body, _ = json.Marshal(execReq)
	req, _ = http.NewRequest("POST", baseURL+"/execute", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)

	resp, err = client.Do(req)
	if err != nil {
		t.Fatalf("Failed to execute code: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		t.Fatalf("Expected 200 OK, got %d. Body: %s", resp.StatusCode, string(bodyBytes))
	}

	var execResp map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&execResp)

	output := execResp["output"].(string)
	t.Logf("Execution Output: %s", output)

	if execResp["success"] != true {
		t.Errorf("Execution failed")
	}
}
