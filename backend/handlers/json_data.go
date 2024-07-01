package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"

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
	var p GetAmenityQueryParams // Create a variable that is of type GetAmenityQueryParams
	if err := c.Bind(&p); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid filter parameters")
	} // bind it to the request with proper error message if so

	file, err := os.Open("public/cleaned_amenities_data2.json") // open the json file
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Unable to open the amenities file: "+err.Error())
	}

	defer file.Close() // defer its closing to the end of the function scope

	var amenities []Amenity                                          // an array of amenitys
	if err := json.NewDecoder(file).Decode(&amenities); err != nil { // Create a decoder from the file and decode the dson into an array of amenities
		return echo.NewHTTPError(http.StatusBadRequest, "Unable to parse the amenities file")
	}

	filteredAmenities := filterAmenitiesGetRequest(amenities, &p) // filter the amenities using zipcode and borough
	return c.JSON(http.StatusOK, filteredAmenities)               // return the json
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
	var p GetBusinessQueryParams // Create a variable that is of type BusinessesFilterParams
	if err := c.Bind(&p); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid filter parameters")
	} // bind it to the request with proper error message if so

	file, err := os.Open("public/cleaned_business_data.json") // open the json file
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Unable to open the business file: "+err.Error())
	}

	defer file.Close() // defer its closing to the end of the function scope

	var business []Businesses                                       // an array of business
	if err := json.NewDecoder(file).Decode(&business); err != nil { // Create a decoder from the file and decode the dson into an array of business
		return echo.NewHTTPError(http.StatusBadRequest, "Unable to parse the business file")
	}

	filteredBusiness := filterBusinessGetRequest(business, &p) // filter the business
	return c.JSON(http.StatusOK, filteredBusiness)             // return the json
}

// ---------------------------------------
// REAL ESTATE
type Prices struct {
	Zipcode         int     `json:"zipcode"`
	HomeValue       float64 `json:"avg_home_value"`
	HouseholdIncome float64 `json:"median_household_income"`
	MedianAge       float64 `json:"median_age"`
	Latitude        float64 `json:"lat"`
	Longitude       float64 `json:"lng"`
}

type GetPricesQueryParams struct {
	Zipcode         int     `query:"zipcode"`
	HomeValue       float64 `query:"homevalue"`
	HouseholdIncome float64 `query:"income"`
	MedianAge       float64 `query:"age"`
}

func filterPricesGetRequest(a []Prices, f *GetPricesQueryParams) []Prices {
	var filtered []Prices
	for _, prices := range a {
		if f.Zipcode != 0 && prices.Zipcode != f.Zipcode {
			continue
		}
		if f.HomeValue != 0 && prices.HomeValue != f.HomeValue {
			continue
		}
		if f.HouseholdIncome != 0 && prices.HouseholdIncome != f.HouseholdIncome {
			continue
		}
		if f.MedianAge != 0 && prices.MedianAge != f.MedianAge {
			continue
		}
		filtered = append(filtered, prices)
	}
	return filtered
}

func GetRealEstatePriceData(c echo.Context) error {
	var p GetPricesQueryParams
	if err := c.Bind(&p); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid filter parameters")
	}

	file, err := os.Open("public/historic_real_estate_prices.json")
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Unable to open the real_estate_price_data file: "+err.Error())
	}
	defer file.Close()

	var prices []Prices
	if err := json.NewDecoder(file).Decode(&prices); err != nil {
		c.Logger().Error("Error decoding JSON: ", err)
		return echo.NewHTTPError(http.StatusBadRequest, "Unable to parse the prices file")
	}

	filteredPrices := filterPricesGetRequest(prices, &p)
	return c.JSON(http.StatusOK, filteredPrices)
}

type HistoricPrices struct {
	Zipcode string             `json:"zipcode"`
	History map[string]float64 `json:"history"`
}

func (p *HistoricPrices) UnmarshalJSON(data []byte) error {

	var rawMap map[string]interface{} //map to hold the raw json
	if err := json.Unmarshal(data, &rawMap); err != nil {
		return err
	} //This here parses the json data to store it in rawMap.

	//Below we are checking if the zipcode is string and converting it to string.
	// We also assign it to the HistoricPrices struct in the Zipcode field
	if zip, ok := rawMap["zipcode"].(string); ok {
		p.Zipcode = zip
	} else {
		return fmt.Errorf("invalid type for zipcode")
	}

	p.History = make(map[string]float64) // This is a map to store key value pairs for date: price
	//Here a loop goes trhough all the pairs in rawMap except zipcode to store in the History map created just above
	for k, v := range rawMap {
		if k == "zipcode" {
			continue
		}
		if val, ok := v.(string); ok {
			parsedVal, err := strconv.ParseFloat(val, 64)
			if err != nil {
				return err
			}
			p.History[k] = parsedVal
		}
	}

	return nil
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
	var p GetHistoricPricesQueryParam

	// Here we bind zipcodes / date params
	if err := c.Bind(&p); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid filter parameters")
	}

	// For multiple zipcodes
	zipcodes := c.QueryParams()["zipcode"]       // This fetches all the different values for "zipcode" in the query
	p.Zipcodes = append(p.Zipcodes, zipcodes...) // I simplified this by removing the unecessary loop

	file, err := os.Open("public/historic_real_estate_prices.json")
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Unable to open the historic_real_estate_prices file: "+err.Error())
	}
	defer file.Close()

	var prices []HistoricPrices
	if err := json.NewDecoder(file).Decode(&prices); err != nil { //calls the UnmarshalJSON method using the encoding/json package
		c.Logger().Error("Error decoding JSON: ", err)
		return echo.NewHTTPError(http.StatusBadRequest, "Unable to parse the historic prices file")
	}

	filteredPrices := filterHistoricPricesGetRequest(prices, &p)
	return c.JSON(http.StatusOK, filteredPrices)
}

// TODO: Just a question. Do we need this? I just load in the geojson and populate the whole map?
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
	file, err := os.Open("public/2020_Neighborhood_Tabulation_Areas(NTAs).geojson")
	if err == nil {
		log.Println("MANAGED TO OPEN THE FILE")
	} else {
		log.Println(err.Error())
	}
	defer file.Close()
	return c.File("public/2020_Neighborhood_Tabulation_Areas(NTAs).geojson")
}

func GetBoroughs(c echo.Context) error {
	file, err := os.Open("public/borough.geojson")
	if err == nil {
		log.Println("MANAGED TO OPEN THE FILE")
	} else {
		log.Println(err.Error())
	}
	defer file.Close()
	return c.File("public/borough.geojson")
}

func GetZipCodes(c echo.Context) error {
	file, err := os.Open("public/us_zip_codes.json")
	if err == nil {
		log.Println("MANAGED TO OPEN THE FILE")
	} else {
		log.Println(err.Error())
	}
	defer file.Close()
	return c.File("public/us_zip_codes.json")
}

//TODO: Above todo ends here

type NeighbourhoodData map[string]map[string]map[string][]int

type GetNeighbourhoodQueryParams struct {
	Borough       string   `query:"borough"`
	Neighbourhood string   `query:"neighbourhood"`
	Cdta          string   `query:"cdta"`
	Zipcodes      []string `query:"zipcode"`
}

func filterNeighbourhoodsGetRequest(data NeighbourhoodData, borough, neighbourhood, cdta string, zipcodes []string) NeighbourhoodData {
	result := make(NeighbourhoodData)

	zipSet := make(map[int]struct{})
	if len(zipcodes) > 0 && zipcodes[0] != "all" {
		for _, zip := range zipcodes {
			zipcode, err := strconv.Atoi(zip)
			if err == nil {
				zipSet[zipcode] = struct{}{}
			}
		}
	}

	for bName, nData := range data {
		if borough != "" && borough != bName {
			continue
		}
		bResult := make(map[string]map[string][]int)
		for nName, cData := range nData {
			if neighbourhood != "" && neighbourhood != "all" && neighbourhood != nName {
				continue
			}
			nResult := make(map[string][]int)
			for cName, zips := range cData {
				if cdta != "" && cdta != cName {
					continue
				}
				if len(zipSet) > 0 {
					match := false
					for _, z := range zips {
						if _, found := zipSet[z]; found {
							match = true
							break
						}
					}
					if !match {
						continue
					}
				}
				nResult[cName] = zips
			}
			if len(nResult) > 0 {
				bResult[nName] = nResult
			}
		}
		if len(bResult) > 0 {
			result[bName] = bResult
		}
	}

	return result
}

func GetBoroughNeighbourhood(c echo.Context) error {
	var p GetNeighbourhoodQueryParams
	if err := c.Bind(&p); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid filter parameters")
	}

	log.Println("Filter Parameters:", p)

	// Open and decode the JSON file within the handler
	filePath := "public/borough_neighbourhood.json"
	log.Println("Opening file:", filePath)
	file, err := os.Open(filePath)
	if err != nil {
		log.Println("Error opening file:", err)
		return echo.NewHTTPError(http.StatusBadRequest, "Unable to open the file: "+err.Error())
	}
	defer file.Close()

	// Read the raw JSON content
	rawContent, err := io.ReadAll(file)
	if err != nil {
		log.Println("Error reading file:", err)
		return echo.NewHTTPError(http.StatusBadRequest, "Unable to read the file: "+err.Error())
	}

	log.Println("Raw JSON Content:", string(rawContent))

	// Decode the JSON content
	var data NeighbourhoodData
	if err := json.Unmarshal(rawContent, &data); err != nil {
		log.Println("Error decoding JSON:", err)
		return echo.NewHTTPError(http.StatusBadRequest, "Unable to parse the file: "+err.Error())
	}

	log.Println("Loaded Data:", data)

	result := filterNeighbourhoodsGetRequest(data, p.Borough, p.Neighbourhood, p.Cdta, p.Zipcodes)
	log.Println("Filter Result:", result)
	return c.JSON(http.StatusOK, result)
}
