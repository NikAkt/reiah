package handlers

import (
	"github.com/labstack/echo/v4"
)

// func ServeAmenitiesData(c echo.Context) error {
// 	return c.File("public/assets/cleaned_amenities_data2.json")
// }

func ServeBusinessData(c echo.Context) error {
	return c.File("public/assets/cleaned_business_data.json")
}

func ServeRealEstatePriceData(c echo.Context) error {
	return c.File("public/assets/real_estate_price_data.json")
}

func ServeHistoricRealEstatePrices(c echo.Context) error {
	return c.File("public/assets/historic_real_estate_prices.json")
}

func ServeNeighbourhoods(c echo.Context) error {
	return c.File("public/assets/NYC_neighbourhood.geojson")
}
