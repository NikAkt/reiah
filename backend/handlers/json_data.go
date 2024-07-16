package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/labstack/echo/v4"
)

var db *pgxpool.Pool

func InitDB() {
	var err error
	connString := os.Getenv("DATABASE_URL")
	db, err = pgxpool.Connect(context.Background(), connString)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}
}

// Amenity struct definition
type Amenity struct {
	Borough            string  `json:"BOROUGH"`
	Name               string  `json:"NAME"`
	FacilityType       string  `json:"FACILITY_T"`
	FacilityDesc       string  `json:"FACILITY_DOMAIN_NAME"`
	Zipcode            string  `json:"ZIPCODE"`
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
func filterAmenitiesGetRequest(a []Amenity, f *GetAmenityQueryParams) []Amenity {
	var filtered []Amenity
	for _, amenity := range a {
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
	return filtered
}

func loadAmenitiesFromDB() ([]Amenity, error) {
	rows, err := db.Query(context.Background(), "SELECT borough, name, facility_type, facility_desc, zipcode, longitude, latitude, distance_to_facility FROM amenities")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var amenities []Amenity
	for rows.Next() {
		var a Amenity
		err = rows.Scan(&a.Borough, &a.Name, &a.FacilityType, &a.FacilityDesc, &a.Zipcode, &a.Longitude, &a.Latitude, &a.DistanceToFacility)
		if err != nil {
			return nil, err
		}
		amenities = append(amenities, a)
	}

	return amenities, nil
}

func GetAmenitiesData(c echo.Context) error {
	var params GetAmenityQueryParams
	if err := c.Bind(&params); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	amenities, err := loadAmenitiesFromDB()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	filtered := filterAmenitiesGetRequest(amenities, &params)
	return c.JSON(http.StatusOK, filtered)
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

func loadBusinessesFromDB() ([]Businesses, error) {
	rows, err := db.Query(context.Background(), "SELECT taxi_zone, business_type, zipcode, longitude, latitude, counts FROM businesses")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var businesses []Businesses
	for rows.Next() {
		var b Businesses
		err = rows.Scan(&b.TaxiZone, &b.BusinessType, &b.Zipcode, &b.Longitude, &b.Latitude, &b.Counts)
		if err != nil {
			return nil, err
		}
		businesses = append(businesses, b)
	}

	return businesses, nil
}

func GetBusinessData(c echo.Context) error {
	var params GetBusinessQueryParams
	if err := c.Bind(&params); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	businesses, err := loadBusinessesFromDB()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	filtered := filterBusinessGetRequest(businesses, &params)
	return c.JSON(http.StatusOK, filtered)
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

func loadPricesFromDB() ([]Prices, error) {
	rows, err := db.Query(context.Background(), "SELECT zipcode, avg_home_value, median_household_income, median_age FROM prices")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var prices []Prices
	for rows.Next() {
		var p Prices
		err = rows.Scan(&p.Zipcode, &p.HomeValue, &p.HouseholdIncome, &p.MedianAge)
		if err != nil {
			return nil, err
		}
		prices = append(prices, p)
	}

	return prices, nil
}

func GetRealEstatePriceData(c echo.Context) error {
	var params GetPricesQueryParams
	if err := c.Bind(&params); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	prices, err := loadPricesFromDB()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	filtered := filterPricesGetRequest(prices, &params)
	return c.JSON(http.StatusOK, filtered)
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
	Zipcodes         []string `query:"zipcode"` // Changed this to a slice to accept multiple zipcodes
	Date             string   `query:"date"`
	AggregateByMonth bool     `query:"aggregateByMonth"`
	Neighbourhood    string   `query:"neighbourhood"`
	Borough          string   `query:"borough"`
}

func loadNeighborhoodMappings() ([]NeighbourhoodMapping, error) {
	rows, err := db.Query(context.Background(), "SELECT neighbourhood, borough, zipcodes FROM neighbourhood_mappings")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var mappings []NeighbourhoodMapping
	for rows.Next() {
		var m NeighbourhoodMapping
		var zipcodes string
		err = rows.Scan(&m.Neighbourhood, &m.Borough, &zipcodes)
		if err != nil {
			return nil, err
		}
		json.Unmarshal([]byte(zipcodes), &m.Zipcodes)
		mappings = append(mappings, m)
	}

	return mappings, nil
}

func filterHistoricPricesGetRequest(data map[string]map[string]float64, f *GetHistoricPricesQueryParam, mappings []NeighbourhoodMapping) map[string]map[string]float64 {
	filtered := make(map[string]map[string]float64)
	zipcodeSet := make(map[string]struct{}) // Map to store and look for zipcodes
	var aggregatedZipcodes []string

	// Populate the map with the zipcodes from the query
	for _, z := range f.Zipcodes {
		zipcodeSet[z] = struct{}{}
	}

	// Populate zipcode set with neighborhood zipcodes if they exist
	for _, mapping := range mappings {
		if f.Neighbourhood != "" && f.Neighbourhood == mapping.Neighbourhood {
			for _, z := range mapping.Zipcodes {
				zipcodeStr := fmt.Sprintf("%d", z)
				zipcodeSet[zipcodeStr] = struct{}{}
				aggregatedZipcodes = append(aggregatedZipcodes, zipcodeStr)
			}
		}
		if f.Borough != "" && f.Borough == mapping.Borough {
			for _, z := range mapping.Zipcodes {
				zipcodeStr := fmt.Sprintf("%d", z)
				zipcodeSet[zipcodeStr] = struct{}{}
				aggregatedZipcodes = append(aggregatedZipcodes, zipcodeStr)
			}
		}
	}

	if f.AggregateByMonth {
		monthlyTotals := make(map[string]float64)
		monthlyCounts := make(map[string]int)

		// Loop data and apply filters
		for zipcode, history := range data {
			if len(zipcodeSet) > 0 {
				if _, ok := zipcodeSet[zipcode]; !ok {
					continue
				}
			}

			// Loop for aggregating by month
			for dateStr, price := range history {
				month := dateStr[:7] //  Slicing the month part from the date "2023-04"
				monthlyTotals[month] += price
				monthlyCounts[month]++
			}
		}

		// Calculate the averages
		averages := make(map[string]float64)
		for month, total := range monthlyTotals {
			averages[month] = total / float64(monthlyCounts[month])
		}

		// Aggregated zipcodes as the key
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

func loadHistoricPricesFromDB() (map[string]map[string]float64, error) {
	rows, err := db.Query(context.Background(), "SELECT zipcode, history FROM historic_prices")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	data := make(map[string]map[string]float64)
	for rows.Next() {
		var zipcode string
		var historyJSON string
		err = rows.Scan(&zipcode, &historyJSON)
		if err != nil {
			return nil, err
		}

		history := make(map[string]float64)
		err = json.Unmarshal([]byte(historyJSON), &history)
		if err != nil {
			return nil, err
		}

		data[zipcode] = history
	}

	return data, nil
}

func GetHistoricRealEstatePriceData(c echo.Context) error {
	var params GetHistoricPricesQueryParam
	if err := c.Bind(&params); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	mappings, err := loadNeighborhoodMappings()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Could not load neighborhood mappings: "+err.Error())
	}

	data, err := loadHistoricPricesFromDB()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	filtered := filterHistoricPricesGetRequest(data, &params, mappings)
	return c.JSON(http.StatusOK, filtered)
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

func loadNeighbourhoodsFromDB() ([]NeighbourhoodData, error) {
	rows, err := db.Query(context.Background(), "SELECT neighbourhood, borough, zipcodes FROM neighbourhood_mappings")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var neighbourhoods []NeighbourhoodData
	for rows.Next() {
		var n NeighbourhoodData
		var zipcodes string
		err = rows.Scan(&n.Neighbourhood, &n.Borough, &zipcodes)
		if err != nil {
			return nil, err
		}
		json.Unmarshal([]byte(zipcodes), &n.Zipcodes)
		neighbourhoods = append(neighbourhoods, n)
	}

	return neighbourhoods, nil
}

func GetBoroughNeighbourhood(c echo.Context) error {
	var params GetNeighbourhoodQueryParams
	if err := c.Bind(&params); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	neighbourhoods, err := loadNeighbourhoodsFromDB()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	filtered := filterNeighbourhoodsGetRequest(neighbourhoods, &params)
	return c.JSON(http.StatusOK, filtered)
}

// ---------------------------------------

type DemographicData struct {
	ZipCode               int     `json:"ZipCode"`
	Year                  int     `json:"Year"`
	Population            int     `json:"Population"`
	PopulationDensity     int     `json:"PopulationDensity"`
	MedianHouseholdIncome float64 `json:"MedianHouseholdIncome"`
	TravelTimeToWork      float64 `json:"travel_time_to_work_in_minutes"`
	Male                  int     `json:"Male"`
	Female                int     `json:"Female"`
	White                 int     `json:"white"`
	Black                 int     `json:"black"`
	Asian                 int     `json:"asian"`
	AmericanIndian        int     `json:"american_indian"`
	PacificIslander       float64 `json:"pacific_islander"`
	Other                 int     `json:"other"`
	FamilyHousehold       int     `json:"FamilyHousehold"`
	SingleHousehold       int     `json:"SingleHousehold"`
	DiversityIndex        float64 `json:"DiversityIndex"`
}

type GetDemographicQueryParams struct {
	Zipcodes []int `query:"zipcode"`
}

func filterDemographicGetRequest(a []DemographicData, f *GetDemographicQueryParams) []DemographicData {
	var filtered []DemographicData
	zipSet := make(map[int]struct{})
	for _, zip := range f.Zipcodes {
		zipSet[zip] = struct{}{}
	}

	for _, data := range a {
		if len(zipSet) > 0 {
			if _, found := zipSet[data.ZipCode]; !found {
				continue
			}
		}
		filtered = append(filtered, data)
	}
	return filtered
}

func loadDemographicDataFromDB() ([]DemographicData, error) {
	rows, err := db.Query(context.Background(), "SELECT zipcode, year, population, population_density, median_household_income, travel_time_to_work_in_minutes, male, female, white, black, asian, american_indian, pacific_islander, other, family_household, single_household, diversity_index FROM demographic_data")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var data []DemographicData
	for rows.Next() {
		var d DemographicData
		err = rows.Scan(&d.ZipCode, &d.Year, &d.Population, &d.PopulationDensity, &d.MedianHouseholdIncome, &d.TravelTimeToWork, &d.Male, &d.Female, &d.White, &d.Black, &d.Asian, &d.AmericanIndian, &d.PacificIslander, &d.Other, &d.FamilyHousehold, &d.SingleHousehold, &d.DiversityIndex)
		if err != nil {
			return nil, err
		}
		data = append(data, d)
	}

	return data, nil
}

func GetDemographicData(c echo.Context) error {
	var params GetDemographicQueryParams
	if err := c.Bind(&params); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	data, err := loadDemographicDataFromDB()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	filtered := filterDemographicGetRequest(data, &params)
	return c.JSON(http.StatusOK, filtered)
}

// ---------------------------------------

type Property struct {
	Price        float64 `json:"PRICE"`
	Beds         float64 `json:"BEDS"`
	Type         string  `json:"TYPE"`
	Bath         float64 `json:"BATH"`
	PropertySqft float64 `json:"PROPERTYSQFT"`
	Latitude     float64 `json:"LATITUDE"`
	Longitude    float64 `json:"LONGITUDE"`
	Zipcode      string  `json:"ZIPCODE"`
	Borough      string  `json:"BOROUGH"`
	Neighborhood string  `json:"NEIGHBORHOOD"`
	PricePerSqft float64 `json:"PRICE_PER_SQFT"`
}

type GetPropertyQueryParams struct {
	Zipcodes     []string `query:"zipcode"`
	Beds         float64  `query:"beds"`
	Type         string   `query:"type"`
	MinPrice     float64  `query:"minprice"`
	MaxPrice     float64  `query:"maxprice"`
	Neighborhood string   `query:"neighborhood"`
}

func filterPropertyGetRequest(a []Property, f *GetPropertyQueryParams) []Property {
	var filtered []Property
	zipSet := make(map[string]bool)

	for _, zip := range f.Zipcodes {
		for _, z := range strings.Split(zip, ",") {
			zipSet[z] = true
		}
	}

	for _, property := range a {
		if len(zipSet) > 0 && !zipSet[property.Zipcode] {
			continue
		}

		if f.Beds != 0 && property.Beds != f.Beds {
			continue
		}
		if f.Type != "" && property.Type != f.Type {
			continue
		}
		if f.MinPrice != 0 && property.Price < f.MinPrice {
			continue
		}
		if f.MaxPrice != 0 && property.Price > f.MaxPrice {
			continue
		}
		if f.Neighborhood != "" && property.Neighborhood != f.Neighborhood {
			continue
		}
		filtered = append(filtered, property)
	}
	return filtered
}

func loadPropertiesFromDB() ([]Property, error) {
	rows, err := db.Query(context.Background(), "SELECT price, beds, type, bath, property_sqft, latitude, longitude, zipcode, borough, neighborhood, price_per_sqft FROM properties")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var properties []Property
	for rows.Next() {
		var p Property
		err = rows.Scan(&p.Price, &p.Beds, &p.Type, &p.Bath, &p.PropertySqft, &p.Latitude, &p.Longitude, &p.Zipcode, &p.Borough, &p.Neighborhood, &p.PricePerSqft)
		if err != nil {
			return nil, err
		}
		properties = append(properties, p)
	}

	return properties, nil
}

func GetPropertyData(c echo.Context) error {
	zipcode := c.QueryParam("zipcode")
	if zipcode == "" {
		return c.JSON(http.StatusBadRequest, "zipcode is required")
	}

	var properties []Property
	query := `
		SELECT price, beds, type, bath, property_sqft, latitude, longitude, zipcode, borough, neighborhood, price_per_sqft
		FROM properties
		WHERE zipcode = $1
	`
	rows, err := db.Query(context.Background(), query, zipcode)
	if err != nil {
		return err
	}
	defer rows.Close()

	for rows.Next() {
		var p Property
		if err := rows.Scan(&p.Price, &p.Beds, &p.Type, &p.Bath, &p.PropertySqft, &p.Latitude, &p.Longitude, &p.Zipcode, &p.Borough, &p.Neighborhood, &p.PricePerSqft); err != nil {
			return err
		}
		properties = append(properties, p)
	}

	if err := rows.Err(); err != nil {
		return err
	}

	return c.JSON(http.StatusOK, properties)
}

// ---------------------------------------

type ZipcodeScore struct {
	Zipcode         int     `json:"zipcode"`
	Borough         string  `json:"borough"`
	CurrentPrice    float64 `json:"current_price"`
	OneYrROI        float64 `json:"1Yr_ROI"`
	OneYrROILower   float64 `json:"1Yr_ROI_Lower"`
	OneYrROIUpper   float64 `json:"1Yr_ROI_Upper"`
	OneYrForecast   float64 `json:"1Yr_forecast_price"`
	ThreeYrROI      float64 `json:"3Yr_ROI"`
	ThreeYrROILower float64 `json:"3Yr_ROI_Lower"`
	ThreeYrROIUpper float64 `json:"3Yr_ROI_Upper"`
	ThreeYrForecast float64 `json:"3Yr_forecast_price"`
	FiveYrROI       float64 `json:"5Yr_ROI"`
	FiveYrROILower  float64 `json:"5Yr_ROI_Lower"`
	FiveYrROIUpper  float64 `json:"5Yr_ROI_Upper"`
	FiveYrForecast  float64 `json:"5Yr_forecast_price"`
}

type GetZipcodeScoreQueryParams struct {
	Zipcodes []int   `query:"zipcode"`
	Borough  string  `query:"borough"`
	MinPrice float64 `query:"minprice"`
	MaxPrice float64 `query:"maxprice"`
}

func filterZipcodeScores(data []ZipcodeScore, f *GetZipcodeScoreQueryParams) []ZipcodeScore {
	var filtered []ZipcodeScore
	zipSet := make(map[int]bool)
	for _, zip := range f.Zipcodes {
		zipSet[zip] = true
	}

	for _, score := range data {
		if len(zipSet) > 0 {
			if _, found := zipSet[score.Zipcode]; !found {
				continue
			}
		}
		if f.Borough != "" && score.Borough != f.Borough {
			continue
		}
		if f.MinPrice != 0 && score.CurrentPrice < f.MinPrice {
			continue
		}
		if f.MaxPrice != 0 && score.CurrentPrice > f.MaxPrice {
			continue
		}
		filtered = append(filtered, score)
	}
	return filtered
}

func loadZipcodeScoresFromDB() ([]ZipcodeScore, error) {
	rows, err := db.Query(context.Background(), "SELECT zipcode, borough, current_price, one_yr_roi, one_yr_roi_lower, one_yr_roi_upper, one_yr_forecast_price, three_yr_roi, three_yr_roi_lower, three_yr_roi_upper, three_yr_forecast_price, five_yr_roi, five_yr_roi_lower, five_yr_roi_upper, five_yr_forecast_price FROM zipcode_scores")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var scores []ZipcodeScore
	for rows.Next() {
		var s ZipcodeScore
		err = rows.Scan(&s.Zipcode, &s.Borough, &s.CurrentPrice, &s.OneYrROI, &s.OneYrROILower, &s.OneYrROIUpper, &s.OneYrForecast, &s.ThreeYrROI, &s.ThreeYrROILower, &s.ThreeYrROIUpper, &s.ThreeYrForecast, &s.FiveYrROI, &s.FiveYrROILower, &s.FiveYrROIUpper, &s.FiveYrForecast)
		if err != nil {
			return nil, err
		}
		scores = append(scores, s)
	}

	return scores, nil
}

func GetZipcodeScores(c echo.Context) error {
	var params GetZipcodeScoreQueryParams
	if err := c.Bind(&params); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	scores, err := loadZipcodeScoresFromDB()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	filtered := filterZipcodeScores(scores, &params)
	return c.JSON(http.StatusOK, filtered)
}

// GeoJSON endpoints to serve static files
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
