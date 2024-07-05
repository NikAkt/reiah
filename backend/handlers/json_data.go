package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/labstack/echo/v4"
)

// Amenity struct definition
type Amenity struct {
	Borough            string  `json:"BOROUGH"`
	Name               string  `json:"NAME"`
	FacilityType       string  `json:"FACILITY_T"`
	FacilityDesc       string  `json:"FACILITY_DOMAIN_NAME"`
	Zipcode            string  `json:"-"`
	Longitude          float64 `json:"LNG"`
	Latitude           float64 `json:"LAT"`
	DistanceToFacility float64 `json:"DISTANCE_TO_FACILITY"`
}

// GetAmenityQueryParams struct definition
type GetAmenityQueryParams struct {
	Borough      string `query:"borough"`
	Zipcode      int    `query:"zipcode"`
	FacilityType string `query:"facilitytype"`
	FacilityDesc string `query:"facilitydesc"`
	Name         string `query:"name"`
}

// filterAmenitiesGetRequest function
func filterAmenitiesGetRequest(a map[string][]Amenity, f *GetAmenityQueryParams) []Amenity {
	var filtered []Amenity
	for zipcode, amenities := range a {
		for _, amenity := range amenities {
			// Populate Zipcode field for filtering
			amenity.Zipcode = zipcode

			if f.Borough != "" && amenity.Borough != f.Borough {
				continue
			}
			if f.Zipcode != 0 && amenity.Zipcode != strconv.Itoa(f.Zipcode) {
				continue
			}
			if f.FacilityType != "" && amenity.FacilityType != f.FacilityType {
				continue
			}
			if f.FacilityDesc != "" && amenity.FacilityDesc != f.FacilityDesc {
				continue
			}
			if f.Name != "" && amenity.Name != f.Name {
				continue
			}
			filtered = append(filtered, amenity)
		}
	}
	return filtered
}

func GetAmenitiesData(c echo.Context) error {
	filterFunc := func(a map[string][]Amenity, f *GetAmenityQueryParams) map[string][]Amenity {
		filtered := filterAmenitiesGetRequest(a, f)
		filteredMap := make(map[string][]Amenity)
		for _, amenity := range filtered {
			zipcode := amenity.Zipcode
			filteredMap[zipcode] = append(filteredMap[zipcode], amenity)
		}
		return filteredMap
	}
	return GenericGetDataHandler[GetAmenityQueryParams, map[string][]Amenity](c, "public/data/cleaned_amenities.json", filterFunc)
}

// ---------------------------------------
type Businesses struct {
	TaxiZone     int     `json:"taxi_zone"`
	BusinessType string  `json:"business_type"`
	Zipcode      int     `json:"Zip Code"`
	Longitude    float64 `json:"Longitude"`
	Latitude     float64 `json:"Latitude"`
	Counts       int     `json:"Counts"`
}

type GetBusinessQueryParams struct {
	TaxiZone     int    `query:"taxizone"`
	BusinessType string `query:"businesstype"`
	Zipcode      int    `query:"zipcode"`
}

func filterBusinessGetRequest(a []Businesses, f *GetBusinessQueryParams) []Businesses {
	var filtered []Businesses
	for _, business := range a {
		if f.TaxiZone != 0 && business.TaxiZone != f.TaxiZone {
			continue
		}
		if f.Zipcode != 0 && business.Zipcode != f.Zipcode {
			continue
		}
		if f.BusinessType != "" && business.BusinessType != f.BusinessType {
			continue
		}
		filtered = append(filtered, business)
	}
	return filtered
}

func GetBusinessData(c echo.Context) error {
	return GenericGetDataHandler(c, "public/data/cleaned_business_data.json", filterBusinessGetRequest)
}

// ---------------------------------------
type Prices struct {
	Zipcode         json.Number `json:"zipcode"`
	HomeValue       float64     `json:"avg_home_value"`
	HouseholdIncome float64     `json:"median_household_income"`
	MedianAge       float64     `json:"median_age"`
}

type GetPricesQueryParams struct {
	Zipcodes     []int   `query:"zipcode"`
	MinHomeValue float64 `query:"min_homevalue"`
	MaxHomeValue float64 `query:"max_homevalue"`
	MinIncome    float64 `query:"min_income"`
	MaxIncome    float64 `query:"max_income"`
	MinAge       float64 `query:"min_age"`
	MaxAge       float64 `query:"max_age"`
}

func filterPricesGetRequest(a []Prices, f *GetPricesQueryParams) []Prices {
	var filtered []Prices
	zipSet := make(map[int]bool)
	for _, zip := range f.Zipcodes {
		zipSet[zip] = true
	}

	for _, prices := range a {
		if len(zipSet) > 0 {
			intZip, err := strconv.Atoi(prices.Zipcode.String())
			if err != nil {
				log.Printf("Error converting zipcode to int: %v\n", err)
				continue
			}
			if _, found := zipSet[int(intZip)]; !found {
				continue
			}
		}
		if f.MinHomeValue != 0 && prices.HomeValue < f.MinHomeValue {
			continue
		}
		if f.MaxHomeValue != 0 && prices.HomeValue > f.MaxHomeValue {
			continue
		}
		if f.MinIncome != 0 && prices.HouseholdIncome < f.MinIncome {
			continue
		}
		if f.MaxIncome != 0 && prices.HouseholdIncome > f.MaxIncome {
			continue
		}
		if f.MinAge != 0 && prices.MedianAge < f.MinAge {
			continue
		}
		if f.MaxAge != 0 && prices.MedianAge > f.MaxAge {
			continue
		}
		filtered = append(filtered, prices)
	}
	return filtered
}

func GetRealEstatePriceData(c echo.Context) error {
	return GenericGetDataHandler(c, "public/data/real_estate_price_data.json", filterPricesGetRequest)
}

// ---------------------------------------
type HistoricPrices struct {
	Zipcode string                 `json:"zipcode"`
	History map[string]json.Number `json:"historicprices"`
}

type NeighbourhoodMapping struct {
	Neighbourhood string `json:"neighbourhood"`
	Borough       string `json:"borough"`
	Zipcodes      []int  `json:"zipcodes"`
}

type GetHistoricPricesQueryParam struct {
	Zipcodes         []string `query:"zipcode"` // Ive changed this to a slice to accept multiple zipcodes
	Date             string   `query:"date"`
	AggregateByMonth bool     `query:"aggregateByMonth"`
	Neighbourhood    string   `query:"neighbourhood"`
	Borough          string   `query:"borough"`
}

func loadNeighborhoodMappings(filePath string) ([]NeighbourhoodMapping, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	var mappings []NeighbourhoodMapping
	if err := json.NewDecoder(file).Decode(&mappings); err != nil {
		return nil, err
	}
	return mappings, nil
}

func filterHistoricPricesGetRequest(data map[string]map[string]float64, f *GetHistoricPricesQueryParam, mappings []NeighbourhoodMapping) map[string]map[string]float64 {
	filtered := make(map[string]map[string]float64)
	zipcodeSet := make(map[string]struct{}) // Map to store and look for zipcodes
	var aggregatedZipcodes []string

	// This loop populates the map with the zipcodes from the query
	for _, z := range f.Zipcodes {
		zipcodeSet[z] = struct{}{}
	}

	// zipcode set with neighborhood zipcodes if there are
	for _, mapping := range mappings {
		if f.Neighbourhood != "" && f.Neighbourhood == mapping.Neighbourhood {
			for _, z := range mapping.Zipcodes {
				zipcodeStr := fmt.Sprintf("%d", z)
				zipcodeSet[zipcodeStr] = struct{}{} // int to string
				aggregatedZipcodes = append(aggregatedZipcodes, zipcodeStr)
			}
		}
		if f.Borough != "" && f.Borough == mapping.Borough {
			for _, z := range mapping.Zipcodes {
				zipcodeStr := fmt.Sprintf("%d", z)
				zipcodeSet[zipcodeStr] = struct{}{} // int to string
				aggregatedZipcodes = append(aggregatedZipcodes, zipcodeStr)
			}
		}
	}

	if f.AggregateByMonth {
		monthlyTotals := make(map[string]float64)
		monthlyCounts := make(map[string]int)

		// loop data and apply filters
		for zipcode, history := range data {
			if len(zipcodeSet) > 0 {
				if _, ok := zipcodeSet[zipcode]; !ok {
					continue
				}
			}

			// loop for aggregating by month
			for dateStr, price := range history {
				month := dateStr[:7] //  slicing the month part from the date "2023-04"
				monthlyTotals[month] += price
				monthlyCounts[month]++
			}
		}

		// calculates the averages
		averages := make(map[string]float64)
		for month, total := range monthlyTotals {
			averages[month] = total / float64(monthlyCounts[month])
		}

		// aggregated zipcodes as the key
		aggregatedKey := "aggregated: " + strings.Join(aggregatedZipcodes, ",")
		filtered[aggregatedKey] = averages
	} else {
		// If AggregateByMonth is not in the query loop data and apply filters
		for zipcode, history := range data {
			if len(zipcodeSet) > 0 {
				if _, ok := zipcodeSet[zipcode]; !ok {
					continue
				}
			}
			// No date filter, include all data
			filtered[zipcode] = history
		}
	}
	return filtered
}

func GetHistoricRealEstatePriceData(c echo.Context) error {
	mappings, err := loadNeighborhoodMappings("public/data/borough_neighbourhood.json")
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Could not load neighborhood mappings: "+err.Error())
	}

	filter := func(data map[string]map[string]float64, f *GetHistoricPricesQueryParam) map[string]map[string]float64 {
		return filterHistoricPricesGetRequest(data, f, mappings)
	}

	return GenericGetDataHandler(c, "public/data/historic_real_estate_prices_by_zipcode.json", filter)
}

// ---------------------------------------
type NeighbourhoodData struct {
	Neighbourhood string `json:"neighbourhood"`
	Borough       string `json:"borough"`
	Zipcodes      []int  `json:"zipcodes"`
}

type GetNeighbourhoodQueryParams struct {
	Neighbourhood string   `query:"neighbourhood"`
	Borough       string   `query:"borough"`
	Cdta          string   `query:"cdta"`
	Zipcodes      []string `query:"zipcode"`
}

func filterNeighbourhoodsGetRequest(a []NeighbourhoodData, f *GetNeighbourhoodQueryParams) []NeighbourhoodData {
	var filtered []NeighbourhoodData
	for _, entry := range a {
		if f.Neighbourhood != "" {
			if entry.Neighbourhood != f.Neighbourhood {
				continue
			}
		}
		if f.Borough != "" {
			if entry.Borough != f.Borough {
				continue
			}
		}
		if len(f.Zipcodes) > 0 {
			zipSet := make(map[string]struct{})
			for _, z := range f.Zipcodes {
				zipSet[z] = struct{}{}
			}
			found := false
			for _, zip := range entry.Zipcodes {
				if _, ok := zipSet[fmt.Sprintf("%d", zip)]; ok {
					found = true
					break
				}
			}
			if !found {
				log.Printf("Skipping entry due to zipcode mismatch: %v\n", entry.Zipcodes)
				continue
			}
		}
		filtered = append(filtered, entry)
	}
	return filtered
}

func GetBoroughNeighbourhood(c echo.Context) error {
	return GenericGetDataHandler(c, "public/data/borough_neighbourhood.json", filterNeighbourhoodsGetRequest)
}

// ---------------------------------------
type FeatureCollection struct {
	Type     string    `json:"type"`
	Features []Feature `json:"features"`
}

type Feature struct {
	Type       string     `json:"type"`
	Properties Properties `json:"properties"`
	Geometry   Geometry   `json:"geometry"`
}

type Properties struct {
	ShapeArea  string `json:"shape_area"`
	Ntaname    string `json:"ntaname"`
	Cdtaname   string `json:"cdtaname"`
	ShapeLeng  string `json:"shape_leng"`
	Boroname   string `json:"boroname"`
	Ntatype    string `json:"ntatype"`
	Nta2020    string `json:"nta2020"`
	Borocode   string `json:"borocode"`
	Countyfips string `json:"countyfips"`
	Ntaabbrev  string `json:"ntaabbrev"`
	Cdta2020   string `json:"cdta2020"`
}

type Geometry struct {
	Type        string        `json:"type"`
	Coordinates []interface{} `json:"coordinates"`
}

func GetNeighbourhoods(c echo.Context) error {
	return c.File("public/data/2020_Neighborhood_Tabulation_Areas(NTAs).geojson")
}

func GetBoroughs(c echo.Context) error {
	return c.File("public/data/borough.geojson")
}

func GetZipCodes(c echo.Context) error {
	return c.File("public/data/us_zip_codes.json")
}

func GetZipCodeAreas(c echo.Context) error {
	return c.File("public/data/nyc_zipcode_areas.geojson")
}
