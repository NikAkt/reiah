package handlers

import (
	"encoding/json"
	"github.com/labstack/echo/v4"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
)

type Amenity struct {
	Borough            string  `json:"BOROUGH"`
	Name               string  `json:"NAME"`
	FacilityType       string  `json:"FACILITY_TYPE"`
	FacilityDesc       string  `json:"FACILITY_DESC"`
	ZipCode            int     `json:"ZIP_CODE"`
	Longitude          float64 `json:"LNG"`
	Latitude           float64 `json:"LAT"`
	Count              int     `json:"COUNT"`
	DistanceToFacility float64 `json:"DISTANCE_TO_FACILITY"`
}

func ServeAmenitiesData(c echo.Context) error {
	// Reading the json file
	filePath := filepath.Join("public", "assets", "cleaned_amenities_data2.json")
	file, err := os.Open(filePath)
	if err != nil {
		c.Logger().Errorf("Unable to open the amenities file: %s", filePath)
		return echo.NewHTTPError(http.StatusInternalServerError, "Unable to open the amenities file")
	}
	defer file.Close()

	var amenities []Amenity
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

func filterAmenities(amenities []Amenity, borough string, zipCode int) []Amenity {
	var filtered []Amenity
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
