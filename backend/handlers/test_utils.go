package handlers

import (
	"github.com/labstack/echo/v4"
)

func SetupTestEcho() *echo.Echo {
	e := echo.New()
	e.Static("/", "public")
	e.GET("/api/amenities", GetAmenitiesData)
	e.GET("/api/businesses", GetBusinessData)
	e.GET("/api/prices", GetRealEstatePriceData)
	e.GET("/api/historic-prices", GetHistoricRealEstatePriceData)
	e.GET("/api/neighbourhoods", GetNeighbourhoods)
	e.GET("/api/borough", GetBoroughs)
	e.GET("/api/zipcodes", GetZipCodes)
	e.GET("/api/zipcode-areas", GetZipCodeAreas)
	e.GET("/api/property-data", GetPropertyData)
	return e
}
