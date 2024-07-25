package main

import (
	"os"

	"github.com/denartha10/SummerProjectGOTH/data_loader"
	"github.com/denartha10/SummerProjectGOTH/handlers"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	if len(os.Args) > 1 && os.Args[1] == "load_data" {
		data_loader.LoadData()
		return
	}

	handlers.InitDB() // Initialize the database connection

	e := echo.New()
	// For CORS restrictions
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{echo.GET, echo.HEAD, echo.PUT, echo.PATCH, echo.POST, echo.DELETE},
	}))

	// API DATA ROUTES
	e.GET("/api/amenities", handlers.GetAmenitiesData)
	e.GET("/api/businesses", handlers.GetBusinessData)
	e.GET("/api/prices", handlers.GetRealEstatePriceData)
	e.GET("/api/historic-prices", handlers.GetHistoricRealEstatePriceData)
	e.GET("/api/neighbourhoods", handlers.GetNeighbourhoods)
	e.GET("/api/borough", handlers.GetBoroughs)
	e.GET("/api/zipcodes", handlers.GetZipCodes)
	e.GET("/api/borough-neighbourhood", handlers.GetBoroughNeighbourhood)
	e.GET("/api/zipcode-areas", handlers.GetZipCodeAreas)
	e.GET("/api/demographic", handlers.GetDemographicData)
	e.GET("/api/property-data", handlers.GetPropertyData)
	e.GET("/api/zipcode-scores", handlers.GetZipcodeScores)

	// Mount the public folder at the public address for accessing css and static files
	e.Static("/api", "public")
	e.Logger.Fatal(e.Start("0.0.0.0:8000"))
}
