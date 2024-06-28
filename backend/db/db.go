package db

import (
	"time"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

var DB *sqlx.DB

// INitialise the database by opening it and assigning it to the exported variable DB which will represent the database throughout the application
func InitDB(dataSourceName string) error {
	var err error

	DB, err = sqlx.Open("postgres", dataSourceName)
	if err != nil {
		return err
	}
	// Create the users table
	schema := `
	CREATE TABLE IF NOT EXISTS users (
		id TEXT PRIMARY KEY,
		username TEXT NOT NULL,
		name TEXT NOT NULL,
		email TEXT NOT NULL,
		surname TEXT NOT NULL,
		password_hash TEXT NOT NULL,
		created_at TIMESTAMP NOT NULL,
		updated_at TIMESTAMP NOT NULL
	);`

	DB.MustExec(schema)

	return nil
}

// A USER STRUCT WHICH REPRESENTS THE USER TABLE IN OUR DATABASE
type User struct {
	Id           string    `db:"id"`
	Username     string    `db:"username"`
	Name         string    `db:"name"`
	Email        string    `db:"email"`
	Surname      string    `db:"surname"`
	PasswordHash string    `db:"password_hash"`
	CreatedAt    time.Time `db:"created_at"`
	UpdatedAt    time.Time `db:"updated_at"`
}
