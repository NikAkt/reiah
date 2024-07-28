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
	e.GET("/amenities", handlers.GetAmenitiesData)
	e.GET("/businesses", handlers.GetBusinessData)
	e.GET("/prices", handlers.GetRealEstatePriceData)
	e.GET("/historic-prices", handlers.GetHistoricRealEstatePriceData)
	e.GET("/neighbourhoods", handlers.GetNeighbourhoods)
	e.GET("/borough", handlers.GetBoroughs)
	e.GET("/zipcodes", handlers.GetZipCodes)
	e.GET("/borough-neighbourhood", handlers.GetBoroughNeighbourhood)
	e.GET("/zipcode-areas", handlers.GetZipCodeAreas)
	e.GET("/demographic", handlers.GetDemographicData)
	e.GET("/property-data", handlers.GetPropertyData)
	e.GET("/zipcode-scores", handlers.GetZipcodeScores)


	// Mount the public folder at the public address for accessing css and static files
	e.Static("/", "public")
	e.Logger.Fatal(e.Start("0.0.0.0:8000"))
}
