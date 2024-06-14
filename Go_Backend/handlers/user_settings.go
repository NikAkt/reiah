package handlers

import (
	"net/http"

	"github.com/denartha10/SummerProjectGOTH/db"
	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
)

type UpdateUserSettingsForm struct {
	Username string `form:"username"`
	Email    string `form:"email"`
	Password string `form:"password"`
}

func HandleUpdateUserSettings(c echo.Context) error {
	var form UpdateUserSettingsForm
	if err := c.Bind(&form); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid form submission")
	}

	// Get current user session
	userCookie, err := c.Cookie("session")
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "Unauthorized")
	}

	// Parse user session
	userClaims, err := ParseToken(userCookie.Value)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "Unauthorized")
	}

	// Get the current user from the database
	var user db.User
	err = db.DB.Get(&user, "SELECT * FROM users WHERE username=?", userClaims.ID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to get user")
	}

	// Update the user details
	user.Username = form.Username
	user.Email = form.Email
	if form.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(form.Password), bcrypt.DefaultCost)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "Failed to hash password")
		}
		user.PasswordHash = string(hashedPassword)
	}

	_, err = db.DB.NamedExec("UPDATE users SET username=:username, email=:email, password_hash=:password_hash WHERE username=:old_username", map[string]interface{}{
		"username":      user.Username,
		"email":         user.Email,
		"password_hash": user.PasswordHash,
		"old_username":  userClaims.ID,
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to update user settings")
	}

	// Optionally, update the session token
	newToken, err := GenerateJWTToken(&user)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to generate new session token")
	}

	// Update the session cookie
	newCookie := &http.Cookie{
		Name:     "session",
		Value:    newToken,
		Secure:   true,
		HttpOnly: true,
		SameSite: http.SameSiteStrictMode,
	}
	c.SetCookie(newCookie)

	return c.Redirect(http.StatusSeeOther, "/settings")
}
