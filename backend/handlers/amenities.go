package handlers

import (
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
	"strconv"

	"github.com/denartha10/SummerProjectGOTH/models"
	"github.com/labstack/echo/v4"
)

func ServeAmenitiesData(c echo.Context) error {
	// Reading the json file
	filePath := filepath.Join("public", "assets", "cleaned_amenities_data2.json")
	file, err := os.Open(filePath)
	if err != nil {
		c.Logger().Errorf("Unable to open the amenities file: %s", filePath)
		return echo.NewHTTPError(http.StatusInternalServerError, "Unable to open the amenities file")
	}
	defer file.Close()

	var amenities []models.Amenity
	decoder := json.NewDecoder(file)
	if err := decoder.Decode(&amenities); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Unable to parse the amenities file")
	}

	// parameters for filtering queries
	borough := c.QueryParam("borough")
	zipCodeParam := c.QueryParam("zipcode")
	zipCode, _ := strconv.Atoi(zipCodeParam)

	filteredAmenities := filterAmenities(amenities, borough, zipCode)
	return c.JSON(http.StatusOK, filteredAmenities)
}

func filterAmenities(amenities []models.Amenity, borough string, zipCode int) []models.Amenity {
	var filtered []models.Amenity
	for _, amenity := range amenities {
		if borough != "" && amenity.Borough != borough {
			continue
		}
		if zipCode != 0 && amenity.ZipCode != zipCode {
			continue
		}
		filtered = append(filtered, amenity)
	}
	return filtered
}
