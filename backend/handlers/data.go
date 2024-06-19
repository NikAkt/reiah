package handlers

import (
	"encoding/json"
	"github.com/labstack/echo/v4"
	"net/http"
	"os"
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

type AmenityFilterParams struct {
	borough string `query:"borough"`
	zipcode int    `query:"zipcode"`
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

func ServeAmenitiesData(c echo.Context) error {
	var p AmenityFilterParams // Create a variable that is of type AmenityFilterParams
	c.Bind(&p)                // bind it to the request

	file, err := os.Open("public/assets/cleaned_amenities_data2.json") // open the json file
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Unable to open the amenities file")
	}

	defer file.Close() // defer its closing to the end of the function scope

	var amenities []Amenity                                          // an array of amenitys
	if err := json.NewDecoder(file).Decode(&amenities); err != nil { // Create a decoder from the file and decode the dson into an array of amenities
		return echo.NewHTTPError(http.StatusInternalServerError, "Unable to parse the amenities file")
	}

	filteredAmenities := filterAmenities(amenities, p.borough, p.zipcode) // filter the amenities using zipcode and borough
	return c.JSON(http.StatusOK, filteredAmenities)                       // return the json
}

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
