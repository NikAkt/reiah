package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/denartha10/SummerProjectGOTH/db"
	"github.com/labstack/echo/v4"
)

type Amenity struct {
	Borough            string  `db:"borough"`
	Name               string  `db:"name"`
	FacilityType       string  `db:"facility_type"`
	FacilityDesc       string  `db:"facility_desc"`
	Zipcode            int     `db:"zip_code"`
	Longitude          float64 `db:"lng"`
	Latitude           float64 `db:"lat"`
	Count              int     `db:"count"`
	DistanceToFacility float64 `db:"distance_to_facility"`
}

type AmenityFilterParams struct {
	Borough      string `query:"borough"`
	Zipcode      int    `query:"zipcode"`
	FacilityType string `query:"facilitytype"`
	FacilityDesc string `query:"facilitydesc"`
	Name         string `query:"name"`
}

func filterAmenities(c echo.Context) ([]Amenity, error) {
	var params AmenityFilterParams
	if err := c.Bind(&params); err != nil {
		return nil, fmt.Errorf("invalid filter parameters")
	}

	query := "SELECT * FROM cleaned_amenities WHERE 1=1"
	if params.Borough != "" {
		query += " AND borough = '" + params.Borough + "'"
	}
	if params.Zipcode != 0 {
		query += " AND zip_code = " + strconv.Itoa(params.Zipcode)
	}
	if params.FacilityType != "" {
		query += " AND facility_type = '" + params.FacilityType + "'"
	}
	if params.FacilityDesc != "" {
		query += " AND facility_desc = '" + params.FacilityDesc + "'"
	}
	if params.Name != "" {
		query += " AND name = '" + params.Name + "'"
	}

	var amenities []Amenity
	err := db.DB.Select(&amenities, query)
	return amenities, err
}

func ServeAmenitiesData(c echo.Context) error {
	amenities, err := filterAmenities(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Error querying the database: "+err.Error())
	}
	return c.JSON(http.StatusOK, amenities)
}

type Businesses struct {
	TaxiZone     int     `db:"taxi_zone"`
	BusinessType string  `db:"business_type"`
	Zipcode      int     `db:"zip_code"`
	Longitude    float64 `db:"longitude"`
	Latitude     float64 `db:"latitude"`
	Counts       int     `db:"counts"`
}

type BusinessesFilterParams struct {
	TaxiZone     int    `query:"taxizone"`
	BusinessType string `query:"businesstype"`
	Zipcode      int    `query:"zipcode"`
}

func filterBusinesses(c echo.Context) ([]Businesses, error) {
	var params BusinessesFilterParams
	if err := c.Bind(&params); err != nil {
		return nil, fmt.Errorf("invalid filter parameters")
	}

	query := "SELECT * FROM cleaned_business_data WHERE 1=1"
	if params.TaxiZone != 0 {
		query += " AND taxi_zone = " + strconv.Itoa(params.TaxiZone)
	}
	if params.Zipcode != 0 {
		query += " AND zip_code = " + strconv.Itoa(params.Zipcode)
	}
	if params.BusinessType != "" {
		query += " AND business_type = '" + params.BusinessType + "'"
	}

	var businesses []Businesses
	err := db.DB.Select(&businesses, query)
	return businesses, err
}

func ServeBusinessData(c echo.Context) error {
	businesses, err := filterBusinesses(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Error querying the database: "+err.Error())
	}
	return c.JSON(http.StatusOK, businesses)
}

type Prices struct {
	Zipcode         int     `db:"zipcode"`
	HomeValue       float64 `db:"avg_home_value"`
	HouseholdIncome float64 `db:"median_household_income"`
	MedianAge       float64 `db:"median_age"`
	Latitude        float64 `db:"lat"`
	Longitude       float64 `db:"lng"`
}

type PricesFilterParams struct {
	Zipcode         int     `query:"zipcode"`
	HomeValue       float64 `query:"homevalue"`
	HouseholdIncome float64 `query:"income"`
	MedianAge       float64 `query:"age"`
}

func filterPrices(c echo.Context) ([]Prices, error) {
	var params PricesFilterParams
	if err := c.Bind(&params); err != nil {
		return nil, fmt.Errorf("invalid filter parameters")
	}

	query := "SELECT * FROM real_estate_price WHERE 1=1"
	if params.Zipcode != 0 {
		query += " AND zipcode = " + strconv.Itoa(params.Zipcode)
	}
	if params.HomeValue != 0 {
		query += " AND avg_home_value = " + strconv.FormatFloat(params.HomeValue, 'f', -1, 64)
	}
	if params.HouseholdIncome != 0 {
		query += " AND median_household_income = " + strconv.FormatFloat(params.HouseholdIncome, 'f', -1, 64)
	}
	if params.MedianAge != 0 {
		query += " AND median_age = " + strconv.FormatFloat(params.MedianAge, 'f', -1, 64)
	}

	var prices []Prices
	err := db.DB.Select(&prices, query)
	return prices, err
}

func ServeRealEstatePriceData(c echo.Context) error {
	prices, err := filterPrices(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Error querying the database: "+err.Error())
	}
	return c.JSON(http.StatusOK, prices)
}

type HistoricPrices struct {
	Zipcode int                `db:"zipcode"`
	History map[string]float64 `db:"-"`
}

func (p *HistoricPrices) UnmarshalJSON(data []byte) error {
	var rawMap map[string]interface{}
	if err := json.Unmarshal(data, &rawMap); err != nil {
		return err
	}

	if zip, ok := rawMap["zipcode"].(float64); ok {
		p.Zipcode = int(zip)
	} else {
		return fmt.Errorf("invalid type for zipcode")
	}

	p.History = make(map[string]float64)
	for k, v := range rawMap {
		if k == "zipcode" {
			continue
		}
		if val, ok := v.(float64); ok {
			p.History[k] = val
		}
	}

	return nil
}

type HistoricPricesFilterParams struct {
	Zipcodes []int  `query:"zipcode"`
	Date     string `query:"date"`
}

func filterHistoricPrices(c echo.Context) ([]HistoricPrices, error) {
	var params HistoricPricesFilterParams
	if err := c.Bind(&params); err != nil {
		return nil, fmt.Errorf("invalid filter parameters")
	}

	zipcodes := c.QueryParams()["zipcode"]
	for _, z := range zipcodes {
		zipcode, err := strconv.Atoi(z)
		if err != nil {
			return nil, fmt.Errorf("invalid zipcode format")
		}
		params.Zipcodes = append(params.Zipcodes, zipcode)
	}

	query := "SELECT * FROM historic_real_estate WHERE 1=1"
	if len(params.Zipcodes) > 0 {
		query += " AND zipcode IN (" + strings.Trim(strings.Join(strings.Fields(fmt.Sprint(params.Zipcodes)), ","), "[]") + ")"
	}

	var historicPrices []HistoricPrices
	rows, err := db.DB.Queryx(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var p HistoricPrices
		rawMap := make(map[string]interface{})
		if err := rows.MapScan(rawMap); err != nil {
			return nil, err
		}

		p.Zipcode = int(rawMap["zipcode"].(int64))
		p.History = make(map[string]float64)
		for k, v := range rawMap {
			if k == "zipcode" {
				continue
			}
			if val, ok := v.(float64); ok {
				p.History[k] = val
			}
		}

		if params.Date != "" {
			if price, ok := p.History[params.Date]; ok {
				p.History = map[string]float64{params.Date: price}
			} else {
				continue
			}
		}

		historicPrices = append(historicPrices, p)
	}

	return historicPrices, nil
}

func ServeHistoricRealEstatePrices(c echo.Context) error {
	historicPrices, err := filterHistoricPrices(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Error querying the database: "+err.Error())
	}
	return c.JSON(http.StatusOK, historicPrices)
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

func ServeNeighbourhoods(c echo.Context) error {
	file, err := os.Open("public/NYC_Neighborhood.geojson")
	if err != nil {
		log.Println("Error opening file:", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Unable to open the neighbourhoods file: "+err.Error())
	}
	defer file.Close()
	return c.File("public/NYC_Neighborhood.geojson")
}
