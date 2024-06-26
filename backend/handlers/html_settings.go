package handlers

import (
	"net/http"

	"github.com/denartha10/SummerProjectGOTH/db"
	"github.com/denartha10/SummerProjectGOTH/views/components"
	"github.com/denartha10/SummerProjectGOTH/views/pages"
	"github.com/labstack/echo/v4"
)

// This is a basic handler which handles the route '/settings'
func HandleSettingsGet(c echo.Context) error {
	userid := c.Get("userid").(string)

	var user db.User
	if err := db.DB.Get(&user, "SELECT * FROM users WHERE id=?", userid); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Failed to find user in database")
	}

	userValues := components.SettingsFormValues{
		Username: user.Username,
		Name:     user.Name,
		Surname:  user.Surname,
		Email:    user.Email,
	}
	return Render(c, pages.Settings(false, userid, userValues, map[string]string{}))
}

// This is a basic handler which handles the route '/settings/edit get request'
// This will allow users to edit the form
func HandleSettingsEditGet(c echo.Context) error {
	userid := c.Get("userid").(string)

	var user db.User
	if err := db.DB.Get(&user, "SELECT * FROM users WHERE id=?", userid); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Failed to find user in database")
	}

	userValues := components.SettingsFormValues{
		Username: user.Username,
		Name:     user.Name,
		Surname:  user.Surname,
		Email:    user.Email,
	}
	return Render(c, pages.Settings(true, userid, userValues, map[string]string{}))
}

// Parse the form values submitted and validate them
func parseUpdateSettingsFormAndValidate(c echo.Context) (components.SettingsFormValues, map[string]string) {
	var userUpdate components.SettingsFormValues
	if err := c.Bind(&userUpdate); err != nil {
		panic(err)
	}
	return userUpdate, userUpdate.Validate()
}

func HandleSettingsEditPatch(c echo.Context) error {
	// get the user id fromt the request
	userid := c.Param("userid")

	values, errors := parseUpdateSettingsFormAndValidate(c)
	if len(errors) > 0 {
		return Render(c, pages.Settings(true, userid, values, errors))
	}

	// get the user from the database using the id
	var user db.User
	if err := db.DB.Get(&user, "SELECT * FROM users WHERE id=?", userid); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Failed to find user from database")
	}

	newUser := db.User{
		Id:           user.Id,
		Username:     values.Username,
		Name:         values.Name,
		Email:        values.Email,
		Surname:      values.Surname,
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
