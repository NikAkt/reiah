package handlers

import (
	"github.com/labstack/echo/v4"
)

// ---------------------------------------
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

type GetAmenityQueryParams struct {
	Borough      string `query:"borough"`
	Zipcode      int    `query:"zipcode"`
	FacilityType string `query:"facilitytype"`
	FacilityDesc string `query:"facilitydesc"`
	Name         string `query:"name"`
}

func filterAmenitiesGetRequest(a []Amenity, f *GetAmenityQueryParams) []Amenity {
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
		if f.Name != "" && amenity.Name != f.Name {
			continue
		}
		filtered = append(filtered, amenity)
	}
	return filtered
}

func GetAmenitiesData(c echo.Context) error {
	return GenericGetDataHandler(c, "public/data/cleaned_amenities_data.json", filterAmenitiesGetRequest)
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
	Zipcode         int     `json:"zipcode"`
	HomeValue       float64 `json:"avg_home_value"`
	HouseholdIncome float64 `json:"median_household_income"`
	MedianAge       float64 `json:"median_age"`
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
	zipSet := make(map[int]struct{})
	for _, zip := range f.Zipcodes {
		zipSet[zip] = struct{}{}
	}

	for _, prices := range a {
		if len(zipSet) > 0 {
			if _, found := zipSet[prices.Zipcode]; !found {
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

type HistoricPrices struct {
	Zipcode string             `json:"zipcode"`
	History map[string]float64 `json:"historicprices"`
}

type GetHistoricPricesQueryParam struct {
	Zipcodes []string `query:"zipcode"` // Ive changed this to a slice to accept multiple zipcodes
	Date     string   `query:"date"`
}

func filterHistoricPricesGetRequest(a []HistoricPrices, f *GetHistoricPricesQueryParam) []HistoricPrices {
	var filtered []HistoricPrices
	zipcodeSet := make(map[string]struct{}) // Map for storing and lookingup the zipcodes
	for _, z := range f.Zipcodes {
		zipcodeSet[z] = struct{}{} // This loop populates the map with all the zipcodes in the query params
	}

	for _, prices := range a {
		if len(zipcodeSet) > 0 {
			if _, ok := zipcodeSet[prices.Zipcode]; !ok {
				continue // This loop cheks if the map (query) contains actual zipcodes in the json (prices.Zipcode)
			}
		}
		if f.Date != "" {
			if price, ok := prices.History[f.Date]; ok {
				prices.History = map[string]float64{f.Date: price}
				filtered = append(filtered, prices)
			} // This loop checks for the date from the query if there is one and filters the History map to include only corresponding prices
		} else {
			filtered = append(filtered, prices)
		}
	}
	return filtered
}

func GetHistoricRealEstatePriceData(c echo.Context) error {
	return GenericGetDataHandler(c, "public/data/historic_real_estate_prices.json", filterHistoricPricesGetRequest)
}

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

func filterNeighbourhoodsGetRequest(data []NeighbourhoodData, f *GetNeighbourhoodQueryParams) []NeighbourhoodData {
	var filtered []NeighbourhoodData
	for _, entry := range data {
		if f.Neighbourhood != entry.Neighbourhood {
			continue
		}
		if f.Borough != entry.Borough {
			continue
		}
		//TODO: Add zipcode loop
		filtered = append(filtered, entry)
	}

	return filtered
}

func GetBoroughNeighbourhood(c echo.Context) error {
	return GenericGetDataHandler(c, "public/data/borough_neighbourhood.json", filterNeighbourhoodsGetRequest)
}

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
	return c.File("public/nyc_zipcode_areas.geojson")
}
