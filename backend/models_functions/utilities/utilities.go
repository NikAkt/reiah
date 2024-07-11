package utilities

import (
	"encoding/csv"
	"os"
	"strconv"
)

var rfModel = LoadModel("backend/models_functions/models/rf_model.joblib")
var knnModel = LoadModel("backend/models_functions/models/knn_model.joblib")

type ZipcodeData struct {
	Zipcode                  int
	Latitude                 float64
	Longitude                float64
	IncomeCategory           string
	LivelinessScore          float64
	FamilyFriendlinessScore  float64
	SafetyScore              float64
	BusinessEnvironmentScore float64
	AmenityScore             float64
	DiversityIndex           float64
	MedianHouseholdIncome    float64
}

type UserInput struct {
	Borough                string   `json:"borough"`
	MaxPrice               float64  `json:"max_price"`
	HouseType              string   `json:"house_type"`
	Bedrooms               int      `json:"bedrooms"`
	Bathrooms              int      `json:"bathrooms"`
	Sqft                   int      `json:"sqft"`
	Income                 string   `json:"income"`
	NeighborhoodPreference string   `json:"neighborhood_preference"`
	HouseholdType          string   `json:"household_type"`
	BusinessEnvironment    string   `json:"business_environment"`
	AmenityPreferences     []string `json:"amenity_preferences"`
}

type Recommendation struct {
	Zipcode               int     `json:"zipcode"`
	PredictedPrice        float64 `json:"predicted_price"`
	Score                 float64 `json:"score"`
	MedianHouseholdIncome float64 `json:"median_household_income"`
	SafetyScore           float64 `json:"safety_score"`
	DiversityIndex        float64 `json:"diversity_index"`
	FamilyFriendliness    float64 `json:"family_friendliness"`
	BusinessEnvironment   float64 `json:"business_environment"`
	LivelinessScore       float64 `json:"liveliness_score"`
	SimilarZipcodes       []int   `json:"similar_zipcodes"`
}

var zipcodeDataMap map[int]ZipcodeData

func init() {
	zipcodeDataMap = loadZipcodeData()
}

func loadZipcodeData() map[int]ZipcodeData {
	// Use absolute path for development
	absPath := "/Users/okellyeneko/Documents/real_estate_project/backend/models_functions/data/processed_data_by_zipcode.csv"
	file, err := os.Open(absPath)
	if err != nil {
		panic(err)
	}
	defer file.Close()

	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		panic(err)
	}

	zipcodeDataMap := make(map[int]ZipcodeData)
	for _, record := range records[1:] {
		zipcode, _ := strconv.Atoi(record[0])
		latitude, _ := strconv.ParseFloat(record[1], 64)
		longitude, _ := strconv.ParseFloat(record[2], 64)
		medianHouseholdIncome, _ := strconv.ParseFloat(record[3], 64)
		livelinessScore, _ := strconv.ParseFloat(record[4], 64)
		familyFriendlinessScore, _ := strconv.ParseFloat(record[5], 64)
		safetyScore, _ := strconv.ParseFloat(record[6], 64)
		businessEnvironmentScore, _ := strconv.ParseFloat(record[7], 64)
		amenityScore, _ := strconv.ParseFloat(record[8], 64)
		diversityIndex, _ := strconv.ParseFloat(record[9], 64)
		incomeCategory := record[10]

		zipcodeDataMap[zipcode] = ZipcodeData{
			Zipcode:                  zipcode,
			Latitude:                 latitude,
			Longitude:                longitude,
			IncomeCategory:           incomeCategory,
			LivelinessScore:          livelinessScore,
			FamilyFriendlinessScore:  familyFriendlinessScore,
			SafetyScore:              safetyScore,
			BusinessEnvironmentScore: businessEnvironmentScore,
			AmenityScore:             amenityScore,
			DiversityIndex:           diversityIndex,
			MedianHouseholdIncome:    medianHouseholdIncome,
		}
	}
	return zipcodeDataMap
}

func LoadModel(path string) interface{} {
	// Implement the model loading logic
	// Example placeholder logic
	return nil // Replace with actual loading logic
}

func PredictPrice(input UserInput) float64 {
	// Implement the model prediction logic
	// Example placeholder logic
	return 500000.0 // Replace with actual prediction logic
}

func GetRecommendations(input UserInput) []Recommendation {
	// Implement the recommendation logic
	// Example placeholder logic
	return []Recommendation{
		{
			Zipcode:               12345,
			PredictedPrice:        500000.0,
			Score:                 0.85,
			MedianHouseholdIncome: 75000.0,
			SafetyScore:           0.9,
			DiversityIndex:        0.8,
			FamilyFriendliness:    0.7,
			BusinessEnvironment:   0.6,
			LivelinessScore:       0.5,
			SimilarZipcodes:       []int{12346, 12347},
		},
	}
}
