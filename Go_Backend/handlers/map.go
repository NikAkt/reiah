package handlers

import (
	"github.com/denartha10/SummerProjectGOTH/views/pages"
	"github.com/labstack/echo/v4"
)

// This is a basic handler which handles the route '/map'
// This page will host the google maps implementation and may rely more on javascript
// The reason it may require more javascrpt is due to the nature of the google maps API
func HandleMap(c echo.Context) error {
	return Render(c, pages.Map())
}
