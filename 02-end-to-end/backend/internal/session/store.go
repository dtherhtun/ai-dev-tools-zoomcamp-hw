package session

import (
	"log"

	"backend/internal/db"
	"backend/internal/models"

	"github.com/google/uuid"
)

// Store manages sessions in database
type Store struct{}

func NewStore() *Store {
	return &Store{}
}

func (s *Store) CreateSession(language string) *models.Session {
	// Default code templates
	defaultCode := ""
	switch language {
	case "javascript":
		defaultCode = "// JavaScript Example\nconsole.log(\"Hello World\");"
	case "python":
		defaultCode = "# Python Example\nprint(\"Hello World\")"
	case "go":
		defaultCode = "// Go Example\npackage main\nimport \"fmt\"\nfunc main() {\n\tfmt.Println(\"Hello World\")\n}"
	}

	session := &models.Session{
		ID:       uuid.New().String(),
		Language: language,
		Code:     defaultCode,
	}

	result := db.GetDB().Create(session)
	if result.Error != nil {
		log.Printf("Failed to create session: %v", result.Error)
		return nil // Should handle error better in real app
	}

	return session
}

func (s *Store) GetSession(id string) (*models.Session, bool) {
	var session models.Session
	result := db.GetDB().First(&session, "id = ?", id)
	if result.Error != nil {
		return nil, false
	}
	return &session, true
}

func (s *Store) UpdateCode(id, code string) {
	db.GetDB().Model(&models.Session{}).Where("id = ?", id).Update("code", code)
}

func (s *Store) UpdateLanguage(id, language string) {
	db.GetDB().Model(&models.Session{}).Where("id = ?", id).Update("language", language)
}
