package main

import (
	"log"

	"github.com/denartha10/SummerProjectGOTH/db"
	"github.com/denartha10/SummerProjectGOTH/handlers"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {

	dataSourceName := "user=username dbname=yourdb sslmode=disable password=yourpassword host=yourhost port=yourport"
	err := db.InitDB(dataSourceName)
	if err != nil {
		log.Fatalf("Failed to start application database: %v", err)
	}

	e := echo.New()
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{echo.GET, echo.PUT, echo.POST, echo.DELETE},
	}))

	//For CORS restrictions
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{echo.GET, echo.HEAD, echo.PUT, echo.PATCH, echo.POST, echo.DELETE},
	}))

	// HOME PAGE
	e.GET("/", handlers.HandleHome, handlers.CustomAuthMiddleware, middleware.Logger())

	// MAP PAGE
	e.GET("/map", handlers.HandleMap, handlers.CustomAuthMiddleware, middleware.Logger())

	// SETTINGS PAGE
	e.GET("/settings", handlers.HandleSettingsGet, handlers.CustomAuthMiddleware, middleware.Logger())
	e.GET("/settings/edit", handlers.HandleSettingsEditGet, handlers.CustomAuthMiddleware, middleware.Logger())
	e.PATCH("/settings/edit/:userid", handlers.HandleSettingsEditPatch, handlers.CustomAuthMiddleware, middleware.Logger())

	// DASHBOARD PAGE
	e.GET("/dashboard", handlers.HandleDashboard, handlers.CustomAuthMiddleware, middleware.Logger())

	//LOGIN AND REGISTER PAGE
	e.GET("/login", handlers.HandleLoginPage, middleware.Logger())
	e.POST("/login", handlers.HandleLoginAttempt, middleware.Logger())
	e.GET("/register", handlers.HandleRegisterPage, middleware.Logger())
	e.POST("/register", handlers.HandleRegisterAttempt, middleware.Logger())

	// Routes
	e.GET("/", handlers.HandleHome, handlers.CustomAuthMiddleware)

	// API DATA ROUTES
	e.GET("/api/amenities", handlers.ServeAmenitiesData)
	e.GET("/api/businesses", handlers.ServeBusinessData)
	e.GET("/api/prices", handlers.ServeRealEstatePriceData)
	e.GET("/api/historic-prices", handlers.ServeHistoricRealEstatePrices)
	e.GET("/api/neighbourhoods", handlers.ServeNeighbourhoods)

	// Mount the public folder at the publci address for accessing css and static files
	e.Static("/", "public")
	e.Logger.Fatal(e.Start("0.0.0.0:8000"))
}
