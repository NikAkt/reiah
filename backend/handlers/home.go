package handlers

import (
	"github.com/denartha10/SummerProjectGOTH/views/pages"
	"github.com/labstack/echo/v4"
)

// This is a basic handler which handles the route '/'
func HandleHome(c echo.Context) error {
	return Render(c, pages.Index())
}
