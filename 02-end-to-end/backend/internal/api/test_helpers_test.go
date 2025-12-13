package api_test

import (
	"backend/internal/db"
	"backend/internal/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func SetupTestDB() {
	d, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}
	d.AutoMigrate(&models.User{}, &models.Session{})
	db.DB = d
}
