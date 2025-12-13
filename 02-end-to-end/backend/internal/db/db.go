package db

import (
	"fmt"
	"log"
	"os"
	"time"

	"backend/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Init() {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=UTC",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	)

	// Retry logic for docker-compose startup
	var err error
	for i := 0; i < 10; i++ {
		DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Info),
		})
		if err == nil {
			break
		}
		log.Printf("Failed to connect to database. Retrying in 2s... (%d/10)", i+1)
		time.Sleep(2 * time.Second)
	}

	if err != nil {
		log.Fatalf("Could not connect to database after retries: %v", err)
	}

	log.Println("Connected to database")

	// Migrate schema
	log.Println("Running migrations...")
	err = DB.AutoMigrate(&models.User{}, &models.Session{})
	if err != nil {
		log.Fatalf("Migration failed: %v", err)
	}
	log.Println("Migrations complete")
}

func GetDB() *gorm.DB {
	return DB
}
