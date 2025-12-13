package users

import (
	"errors"

	"backend/internal/db"
	"backend/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Store manages users in database
type Store struct {
	// No explicit connection field needed if using global db.GetDB(),
	// but can cache it if preferred.
	// Or pass it in. For consistency with previous API, we'll use lazy access or field.
	db *gorm.DB
}

func NewStore() *Store {
	return &Store{
		db: db.GetDB(),
	}
}

// CreateUser creates a new user if username doesn't exist
func (s *Store) CreateUser(username, passwordHash string) (*models.User, error) {
	user := &models.User{
		ID:       uuid.New().String(),
		Username: username,
		Password: passwordHash,
	}

	result := db.GetDB().Create(user)
	if result.Error != nil {
		// Verify if error is constraint violation (e.g. duplicate username)
		// For simplicity, handle generically now
		return nil, errors.New("could not create user (username might already exist)")
	}

	return user, nil
}

// GetUserByUsername retrieves a user by username
func (s *Store) GetUserByUsername(username string) (*models.User, bool) {
	var user models.User
	result := db.GetDB().Where("username = ?", username).First(&user)
	if result.Error != nil {
		return nil, false
	}
	return &user, true
}
