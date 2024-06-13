package db

import (
	"database/sql"
	"time"

	"github.com/jmoiron/sqlx"
	_ "github.com/mattn/go-sqlite3"
)

var DB *sqlx.DB

// INitialise the database by opening it and assigning it to the exported variable DB which will represent the database throughout the application
func InitDB(host, port_or_file string) error {
	var err error
	DB, err = sqlx.Open(host, port_or_file)

	if err != nil {
		return err
	}

	return nil
}

// A USER STRUCT WHICH REPRESENTS THE USER TABLE IN OUR DATABASE
type User struct {
	Username     string         `db:"username"`
	Name         string         `db:"name"`
	Email        string         `db:"email"`
	Surname      string         `db:"surname"`
	PasswordHash string         `db:"password_hash"`
	CreatedAt    time.Time      `db:"created_at"`
	UpdatedAt    time.Time      `db:"updated_at"`
	Session      sql.NullString `db:"session"`
}
