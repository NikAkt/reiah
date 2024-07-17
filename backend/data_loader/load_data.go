package data_loader

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"

	"github.com/jackc/pgx/v4"
)

var db *pgx.Conn

type Amenity struct {
	Borough            string  `json:"BOROUGH"`
	Name               string  `json:"NAME"`
	FacilityType       string  `json:"FACILITY_T"`
	FacilityDesc       string  `json:"FACILITY_DOMAIN_NAME"`
	Longitude          float64 `json:"LNG"`
	Latitude           float64 `json:"LAT"`
	DistanceToFacility float64 `json:"DISTANCE_TO_FACILITY"`
}

type Businesses struct {
	TaxiZone     int     `json:"taxi_zone"`
	BusinessType string  `json:"business_type"`
	Zipcode      int     `json:"Zip Code"`
	Longitude    float64 `json:"Longitude"`
	Latitude     float64 `json:"Latitude"`
	Counts       int     `json:"Counts"`
}

type Prices struct {
	Zipcode         json.Number `json:"zipcode"`
	HomeValue       float64     `json:"avg_home_value"`
	HouseholdIncome float64     `json:"median_household_income"`
	MedianAge       float64     `json:"median_age"`
}

type HistoricPrices map[string]map[string]float64

type NeighbourhoodMapping struct {
	Neighbourhood string `json:"neighbourhood"`
	Borough       string `json:"borough"`
	Zipcodes      []int  `json:"zipcodes"`
}

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

type AmenitiesByZipcode map[string][]Amenity
type PropertiesByZipcode map[string][]Property

func InitDB() {
	var err error
	connString := os.Getenv("DATABASE_URL")
	for i := 0; i < 10; i++ {
		db, err = pgx.Connect(context.Background(), connString)
		if err == nil {
			return
		}
		log.Printf("Unable to connect to database: %v, retrying in 2 seconds...\n", err)
		time.Sleep(2 * time.Second)
	}
	log.Fatalf("Unable to connect to database after 10 attempts: %v\n", err)
}

func loadJSONData(filePath string, v interface{}) error {
	data, err := os.ReadFile(filepath.Clean(filePath))
	if err != nil {
		return err
	}
	return json.Unmarshal(data, v)
}

func tableHasData(tableName string) (bool, error) {
	var count int
	err := db.QueryRow(context.Background(), fmt.Sprintf("SELECT COUNT(*) FROM %s", tableName)).Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func loadAmenities() error {
	hasData, err := tableHasData("amenities")
	if err != nil {
		return err
	}
	if hasData {
		log.Println("Amenities table already has data, skipping...")
		return nil
	}

	var amenitiesByZipcode AmenitiesByZipcode
	err = loadJSONData("backend/public/data/cleaned_amenities.json", &amenitiesByZipcode)
	if err != nil {
		return fmt.Errorf("error loading amenities data: %v", err)
	}

	for zipcode, amenities := range amenitiesByZipcode {
		for _, a := range amenities {
			_, err := db.Exec(context.Background(),
				"INSERT INTO amenities (borough, name, facility_type, facility_desc, zipcode, longitude, latitude, distance_to_facility) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
				a.Borough, a.Name, a.FacilityType, a.FacilityDesc, zipcode, a.Longitude, a.Latitude, a.DistanceToFacility)
			if err != nil {
				return fmt.Errorf("error inserting amenity: %v", err)
			}
		}
	}
	return nil
}

func loadBusinesses() error {
	hasData, err := tableHasData("businesses")
	if err != nil {
		return err
	}
	if hasData {
		log.Println("Businesses table already has data, skipping...")
		return nil
	}

	var businesses []Businesses
	err = loadJSONData("backend/public/data/cleaned_business_data.json", &businesses)
	if err != nil {
		return fmt.Errorf("error loading businesses data: %v", err)
	}

	for _, b := range businesses {
		_, err := db.Exec(context.Background(),
			"INSERT INTO businesses (taxi_zone, business_type, zipcode, longitude, latitude, counts) VALUES ($1, $2, $3, $4, $5, $6)",
			b.TaxiZone, b.BusinessType, b.Zipcode, b.Longitude, b.Latitude, b.Counts)
		if err != nil {
			return fmt.Errorf("error inserting business: %v", err)
		}
	}
	return nil
}

func loadPrices() error {
	hasData, err := tableHasData("prices")
	if err != nil {
		return err
	}
	if hasData {
		log.Println("Prices table already has data, skipping...")
		return nil
	}

	var prices []Prices
	err = loadJSONData("backend/public/data/real_estate_price_data.json", &prices)
	if err != nil {
		return fmt.Errorf("error loading prices data: %v", err)
	}

	for _, p := range prices {
		_, err := db.Exec(context.Background(),
			"INSERT INTO prices (zipcode, home_value, household_income, median_age) VALUES ($1, $2, $3, $4)",
			p.Zipcode, p.HomeValue, p.HouseholdIncome, p.MedianAge)
		if err != nil {
			return fmt.Errorf("error inserting price: %v", err)
		}
	}
	return nil
}

func loadHistoricPrices() error {
	hasData, err := tableHasData("historic_prices")
	if err != nil {
		return err
	}
	if hasData {
		log.Println("Historic Prices table already has data, skipping...")
		return nil
	}

	var historicPrices HistoricPrices
	err = loadJSONData("backend/public/data/historic_real_estate_prices_by_zipcode.json", &historicPrices)
	if err != nil {
		return fmt.Errorf("error loading historic prices data: %v", err)
	}

	for zipcode, history := range historicPrices {
		historyJSON, err := json.Marshal(history)
		if err != nil {
			return fmt.Errorf("error marshalling history: %v", err)
		}

		_, err = db.Exec(context.Background(),
			"INSERT INTO historic_prices (zipcode, history) VALUES ($1, $2)",
			zipcode, historyJSON)
		if err != nil {
			return fmt.Errorf("error inserting historic price: %v", err)
		}
	}
	return nil
}

func loadNeighbourhoodMappings() error {
	hasData, err := tableHasData("neighbourhood_mappings")
	if err != nil {
		return err
	}
	if hasData {
		log.Println("Neighbourhood Mappings table already has data, skipping...")
		return nil
	}

	var neighbourhoodMappings []NeighbourhoodMapping
	err = loadJSONData("backend/public/data/borough_neighbourhood.json", &neighbourhoodMappings)
	if err != nil {
		return fmt.Errorf("error loading neighbourhood mappings data: %v", err)
	}

	for _, nm := range neighbourhoodMappings {
		zipcodes, err := json.Marshal(nm.Zipcodes)
		if err != nil {
			return fmt.Errorf("error marshalling zipcodes: %v", err)
		}

		_, err = db.Exec(context.Background(),
			"INSERT INTO neighbourhood_mappings (neighbourhood, borough, zipcodes) VALUES ($1, $2, $3)",
			nm.Neighbourhood, nm.Borough, zipcodes)
		if err != nil {
			return fmt.Errorf("error inserting neighbourhood mapping: %v", err)
		}
	}
	return nil
}

func loadDemographicData() error {
	hasData, err := tableHasData("demographic_data")
	if err != nil {
		return err
	}
	if hasData {
		log.Println("Demographic Data table already has data, skipping...")
		return nil
	}

	var demographicData []DemographicData
	err = loadJSONData("backend/public/data/demographic_data.json", &demographicData)
	if err != nil {
		return fmt.Errorf("error loading demographic data: %v", err)
	}

	for _, d := range demographicData {
		_, err := db.Exec(context.Background(),
			"INSERT INTO demographic_data (zipcode, year, population, population_density, median_household_income, travel_time_to_work_in_minutes, male, female, white, black, asian, american_indian, pacific_islander, other, family_household, single_household, diversity_index) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)",
			d.ZipCode, d.Year, d.Population, d.PopulationDensity, d.MedianHouseholdIncome, d.TravelTimeToWork, d.Male, d.Female, d.White, d.Black, d.Asian, d.AmericanIndian, d.PacificIslander, d.Other, d.FamilyHousehold, d.SingleHousehold, d.DiversityIndex)
		if err != nil {
			return fmt.Errorf("error inserting demographic data: %v", err)
		}
	}
	return nil
}

func loadProperties() error {
	hasData, err := tableHasData("properties")
	if err != nil {
		return err
	}
	if hasData {
		log.Println("Properties table already has data, skipping...")
		return nil
	}

	var propertiesByZipcode PropertiesByZipcode
	err = loadJSONData("backend/public/data/property_data_by_zipcode.json", &propertiesByZipcode)
	if err != nil {
		return fmt.Errorf("error loading properties data: %v", err)
	}

	for zipcode, properties := range propertiesByZipcode {
		for _, p := range properties {
			_, err := db.Exec(context.Background(),
				"INSERT INTO properties (price, beds, type, bath, property_sqft, latitude, longitude, zipcode, borough, neighborhood, price_per_sqft) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)",
				p.Price, p.Beds, p.Type, p.Bath, p.PropertySqft, p.Latitude, p.Longitude, zipcode, p.Borough, p.Neighborhood, p.PricePerSqft)
			if err != nil {
				return fmt.Errorf("error inserting property: %v", err)
			}
		}
	}
	return nil
}

func loadZipcodeScores() error {
	hasData, err := tableHasData("zipcode_scores")
	if err != nil {
		return err
	}
	if hasData {
		log.Println("Zipcode Scores table already has data, skipping...")
		return nil
	}

	var zipcodeScores []ZipcodeScore
	err = loadJSONData("backend/public/data/zipcode_scores.json", &zipcodeScores)
	if err != nil {
		return fmt.Errorf("error loading zipcode scores data: %v", err)
	}

	for _, zs := range zipcodeScores {
		_, err := db.Exec(context.Background(),
			"INSERT INTO zipcode_scores (zipcode, borough, current_price, one_yr_roi, one_yr_roi_lower, one_yr_roi_upper, one_yr_forecast, three_yr_roi, three_yr_roi_lower, three_yr_roi_upper, three_yr_forecast, five_yr_roi, five_yr_roi_lower, five_yr_roi_upper, five_yr_forecast) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)",
			zs.Zipcode, zs.Borough, zs.CurrentPrice, zs.OneYrROI, zs.OneYrROILower, zs.OneYrROIUpper, zs.OneYrForecast, zs.ThreeYrROI, zs.ThreeYrROILower, zs.ThreeYrROIUpper, zs.ThreeYrForecast, zs.FiveYrROI, zs.FiveYrROILower, zs.FiveYrROIUpper, zs.FiveYrForecast)
		if err != nil {
			return fmt.Errorf("error inserting zipcode score: %v", err)
		}
	}
	return nil
}

func LoadData() {
	InitDB()
	defer db.Close(context.Background())

	if err := loadAmenities(); err != nil {
		log.Fatalf("Failed to load amenities: %v", err)
	}
	if err := loadBusinesses(); err != nil {
		log.Fatalf("Failed to load businesses: %v", err)
	}
	if err := loadPrices(); err != nil {
		log.Fatalf("Failed to load prices: %v", err)
	}
	if err := loadHistoricPrices(); err != nil {
		log.Fatalf("Failed to load historic prices: %v", err)
	}
	if err := loadNeighbourhoodMappings(); err != nil {
		log.Fatalf("Failed to load neighbourhood mappings: %v", err)
	}
	if err := loadDemographicData(); err != nil {
		log.Fatalf("Failed to load demographic data: %v", err)
	}
	if err := loadProperties(); err != nil {
		log.Fatalf("Failed to load properties: %v", err)
	}
	if err := loadZipcodeScores(); err != nil {
		log.Fatalf("Failed to load zipcode scores: %v", err)
	}
}
