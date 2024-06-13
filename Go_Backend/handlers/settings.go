package handlers

import (
	"github.com/denartha10/SummerProjectGOTH/views/pages"
	"github.com/labstack/echo/v4"
)

// This is a basic handler which handles the route '/settings'
// This page will eventually allow the user to update the details of their account
func HandleSettings(c echo.Context) error {
	return Render(c, pages.Settings())
}
