package handlers

import (
	"encoding/json"
	"net/http"
	"os"

	"github.com/labstack/echo/v4"
)

type Amenity struct {
	Borough            string  `json:"BOROUGH"`
	Name               string  `json:"NAME"`
	FacilityType       string  `json:"FACILITY_TYPE"`
	FacilityDesc       string  `json:"FACILITY_DESC"`
	Zipcode            int     `json:"ZIP_CODE"`
	Longitude          float64 `json:"LNG"`
	Latitude           float64 `json:"LAT"`
	Count              int     `json:"COUNT"`
	DistanceToFacility float64 `json:"DISTANCE_TO_FACILITY"`
}

// TODO: ADD MORE OPTIONS FOR THE HTTP REQUEST
type AmenityFilterParams struct {
	Borough      string `query:"borough"`
	Zipcode      int    `query:"zipcode"`
	FacilityType string `query:"facilitytype"`
	FacilityDesc string `query:"facilitydesc"`
}

func filterAmenities(a []Amenity, f *AmenityFilterParams) []Amenity {
	var filtered []Amenity //
	for _, amenity := range a {
		if f.Borough != "" && amenity.Borough != f.Borough {
			continue
		}
		if f.Zipcode != 0 && amenity.Zipcode != f.Zipcode {
			continue
		}
		if f.FacilityType != "" && amenity.FacilityType != f.FacilityType {
			continue
		}
		if f.FacilityDesc != "" && amenity.FacilityDesc != f.FacilityDesc {
			continue
		}
		filtered = append(filtered, amenity)
	}
	return filtered
}

func ServeAmenitiesData(c echo.Context) error {
	var p AmenityFilterParams // Create a variable that is of type AmenityFilterParams
	c.Bind(&p)                // bind it to the request

	file, err := os.Open("public/cleaned_amenities_data2.json") // open the json file
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Unable to open the amenities file: "+err.Error())
	}

	defer file.Close() // defer its closing to the end of the function scope

	var amenities []Amenity                                          // an array of amenitys
	if err := json.NewDecoder(file).Decode(&amenities); err != nil { // Create a decoder from the file and decode the dson into an array of amenities
		return echo.NewHTTPError(http.StatusInternalServerError, "Unable to parse the amenities file")
	}

	filteredAmenities := filterAmenities(amenities, &p) // filter the amenities using zipcode and borough
	return c.JSON(http.StatusOK, filteredAmenities)     // return the json
}

func ServeBusinessData(c echo.Context) error {
	return c.File("public/cleaned_business_data.json")
}

func ServeRealEstatePriceData(c echo.Context) error {
	return c.File("public/real_estate_price_data.json")
}

func ServeHistoricRealEstatePrices(c echo.Context) error {
	return c.File("public/historic_real_estate_prices.json")
}

func ServeNeighbourhoods(c echo.Context) error {
	return c.File("public/NYC_neighbourhood.geojson")
}
