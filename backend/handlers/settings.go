package handlers

import (
	"net/http"

	"github.com/denartha10/SummerProjectGOTH/db"
	"github.com/denartha10/SummerProjectGOTH/views/pages"
	"github.com/labstack/echo/v4"
)

// This is a basic handler which handles the route '/settings'
func HandleSettings(c echo.Context) error {
	userid := c.Get("userid").(string)

	var user db.User
	if err := db.DB.Get(&user, "SELECT * FROM users WHERE id=?", userid); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Failed to find user in database")
	}

	return Render(c, pages.Settings(&user, false))
}

// This is a basic handler which handles the route '/settings/edit get request'
// This will allow users to edit the form
func HandleSettingsEdit(c echo.Context) error {
	userid := c.Get("userid").(string)

	var user db.User
	if err := db.DB.Get(&user, "SELECT * FROM users WHERE id=?", userid); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Failed to find user in database")
	}

	return Render(c, pages.Settings(&user, true))
}

type UpdateUserSettingsForm struct {
	Username string `form:"username"`
	Email    string `form:"email"`
	Password string `form:"password"`
	Name     string `form:"name"`
	Surname  string `form:"surname"`
}

func HandleUpdateUserSettings(c echo.Context) error {
	var userUpdate UpdateUserSettingsForm
	if err := c.Bind(&userUpdate); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "failed to parse form values"+err.Error())
	}

	// get the user id fromt the request
	userid := c.Param("userid")

	// get the user from the database using the id
	var user db.User
	if err := db.DB.Get(&user, "SELECT * FROM users WHERE id=?", userid); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Failed to find user from database")
	}

	newUser := db.User{
		Id:           user.Id,
		Username:     userUpdate.Username,
		Name:         userUpdate.Name,
		Email:        userUpdate.Email,
		Surname:      userUpdate.Surname,
		PasswordHash: user.PasswordHash,
		CreatedAt:    user.CreatedAt,
		UpdatedAt:    user.UpdatedAt,
	}

	_, err := db.DB.NamedExec(`UPDATE users SET username=:username, email=:email, name=:name, surname=:surname WHERE id=:id`, &newUser)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to update user settings"+err.Error())
	}

	c.Response().Header().Set("HX-Location", "/settings")
	return c.String(200, "Successful Update")
}
