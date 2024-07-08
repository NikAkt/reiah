package handlers

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

func Logout(c echo.Context) error {
	// Perform any necessary logout operations, such as clearing cookies or sessions
	c.SetCookie(&http.Cookie{
		Name:   "session",
		Value:  "",
		Path:   "/",
		MaxAge: -1,
	})

	// Redirect to the login page
	return c.Redirect(http.StatusFound, "http://localhost:3000/login")
}
