package users

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
	d.AutoMigrate(&models.User{})
	db.DB = d
}

func TestCreateUser(t *testing.T) {
	setupTestDB()
	store := NewStore()

	user, err := store.CreateUser("testuser", "hashedpass")
	if err != nil {
		t.Fatalf("CreateUser failed: %v", err)
	}

	if user.Username != "testuser" {
		t.Errorf("Expected username testuser, got %s", user.Username)
	}

	if user.ID == "" {
		t.Errorf("Expected non-empty ID")
	}

	// Test duplicate
	_, err = store.CreateUser("testuser", "hashedpass")
	if err == nil {
		t.Errorf("Expected error for duplicate user")
	}
}

func TestGetUser(t *testing.T) {
	store := NewStore()
	store.CreateUser("testuser", "hashedpass")

	user, ok := store.GetUserByUsername("testuser")
	if !ok {
		t.Errorf("GetUserByUsername failed")
	}
	if user.Username != "testuser" {
		t.Errorf("Expected username testuser, got %s", user.Username)
	}

	_, ok = store.GetUserByUsername("nonexistent")
	if ok {
		t.Errorf("GetUserByUsername succeeded for nonexistent user")
	}
}
