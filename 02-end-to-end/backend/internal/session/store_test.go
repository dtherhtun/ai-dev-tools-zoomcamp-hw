package session

import (
	"backend/internal/db"
	"backend/internal/models"
	"testing"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupTestDB() {
	d, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}
	d.AutoMigrate(&models.Session{})
	db.DB = d
}

func TestCreateSession(t *testing.T) {
	setupTestDB()
	store := NewStore()
	session := store.CreateSession("python")

	if session.ID == "" {
		t.Errorf("Expected non-empty session ID")
	}

	if session.Language != "python" {
		t.Errorf("Expected language python, got %s", session.Language)
	}

	if session.Code == "" {
		t.Errorf("Expected default code for python")
	}
}

func TestGetSession(t *testing.T) {
	store := NewStore()
	session := store.CreateSession("javascript")

	retrieved, ok := store.GetSession(session.ID)
	if !ok {
		t.Fatalf("Failed to retrieve session")
	}

	if retrieved.ID != session.ID {
		t.Errorf("ID mismatch")
	}
}

func TestUpdateSession(t *testing.T) {
	store := NewStore()
	session := store.CreateSession("javascript")

	newCode := "console.log('updated')"
	store.UpdateCode(session.ID, newCode)

	updated, _ := store.GetSession(session.ID)
	if updated.Code != newCode {
		t.Errorf("Expected code to be updated")
	}

	store.UpdateLanguage(session.ID, "go")
	updated, _ = store.GetSession(session.ID)
	if updated.Language != "go" {
		t.Errorf("Expected language to be updated")
	}
}
