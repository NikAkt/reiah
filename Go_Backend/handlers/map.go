package handlers

import (
	"github.com/denartha10/SummerProjectGOTH/views/pages"
	"github.com/denartha10/SummerProjectGOTH/views/snippets"
	"github.com/labstack/echo/v4"
)

// This is a basic handler which handles the route '/map'
// This page will host the google maps implementation and may rely more on javascript
// The reason it may require more javascrpt is due to the nature of the google maps API
func HandleMap(c echo.Context) error {
	return Render(c, pages.Map())
}

// This type represents the curret create marker form which takes and longitude and latitude
type CreateMarkerForm struct {
	X float64 `form:"x"`
	Y float64 `form:"y"`
}

// The purpose of this function is very straightforward
// It is a handler for the POST request on the map page
func HandleCreateMarker(c echo.Context) error {
	var markerPoints CreateMarkerForm      // create a marker var
	echoBindError := c.Bind(&markerPoints) // bind the form from the post request to it

	if echoBindError != nil {
		return echoBindError
	}

	return Render(c, snippets.Marker(markerPoints.X, markerPoints.Y)) // render a html snippet and return it to the client
}
