import pandas as pd
import numpy as np
from scipy.spatial.distance import cdist
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler
import pickle
import joblib

# Load the house price predictor
rf_model = joblib.load('recommendation_system/models/rf_model.joblib')

# Load the KNN model and processed data
knn_data = joblib.load('recommendation_system/models/knn_model.joblib')

data = pd.read_csv('recommendation_system/data/processed_data_by_zipcode.csv')

#  function to predict house price
def predict_price(borough, house_type, bedrooms, bathrooms, sqft, latitude, longitude, zipcode):
    input_data = pd.DataFrame({
        'BEDS': [bedrooms],
        'BATH': [bathrooms],
        'PROPERTYSQFT': [sqft],
        'LATITUDE': [latitude],
        'LONGITUDE': [longitude],
        'TYPE': [house_type],
        'ZIPCODE': [zipcode],
        'BOROUGH': [borough]
    })
    
    prediction = rf_model.predict(input_data)[0]
    return prediction

#  function to get recommendations + scoring
def get_recommendations(preferences, n_recommendations=5):
    def calculate_zipcode_score(zipcode_data, preferences):
        score = 0
        income_categories = ["Under $50,000", "$50,000-$100,000", "$100,000-$150,000", "$150,000-$200,000", "Over $200,000"]
        if preferences['income'] != "Prefer not to say":
            user_income_category = income_categories.index(preferences['income'])
            zipcode_income_category = ["Very Low", "Low", "Medium", "High", "Very High"].index(zipcode_data['IncomeCategory'])
            score += 0.2 * (1 - abs(user_income_category - zipcode_income_category) / 4)
        else:
            score += 0.2
        
        if preferences['neighborhood_preference'] != "No preference":
            neighborhood_types = {"Quiet residential": 0, "Balanced mix": 0.5, "Lively urban": 1}
            user_pref = neighborhood_types[preferences['neighborhood_preference']]
            score += 0.2 * (1 - abs(user_pref - zipcode_data['LivelinessScore']))
        else:
            score += 0.2
        
        if preferences['household_type'] != "No preference":
            household_types = {"Mostly families": 1, "Mix of families and singles": 0.5, "Mostly singles": 0}
            user_pref = household_types[preferences['household_type']]
            score += 0.15 * (1 - abs(user_pref - zipcode_data['FamilyFriendlinessScore']))
        else:
            score += 0.15
        
        if preferences['business_environment'] != "No preference":
            business_env_types = {"Mostly residential": 0, "Mix of residential and commercial": 0.5, "Bustling commercial area": 1}
            user_pref = business_env_types[preferences['business_environment']]
            score += 0.15 * (1 - abs(user_pref - zipcode_data['BusinessEnvironmentScore']))
        else:
            score += 0.15
        
        amenity_columns = {
            "Parks and recreation": "recreational_facility_density",
            "Shopping and restaurants": "BusinessDensity",
            "Schools and education": "education_facility_density",
            "Public transportation": "transportation_facility_density",
            "Cultural attractions": "cultural_facility_density"
        }
        amenity_score = sum(zipcode_data[amenity_columns[pref]] for pref in preferences['amenity_preferences']) / len(preferences['amenity_preferences'])
        score += 0.15 * amenity_score
        score += 0.1 * zipcode_data['SafetyScore']
        score += 0.05 * zipcode_data['DiversityIndex']
        
        return score
    
    borough_data = data[data['BOROUGH'] == preferences['borough']]
    
    recommended_areas = []
    for _, zipcode_data in borough_data.iterrows():
        zipcode = zipcode_data['ZipCode']
        latitude = zipcode_data['Latitude']
        longitude = zipcode_data['Longitude']
        
        price = predict_price(
            preferences['borough'],
            preferences['house_type'],
            preferences['bedrooms'],
            preferences['bathrooms'],
            preferences['sqft'],
            latitude,
            longitude,
            zipcode
        )
        
        if price is not None and price <= preferences['max_price']:
            score = calculate_zipcode_score(zipcode_data, preferences)
            similar_zipcodes = knn_data['knn_model'].kneighbors([[zipcode_data['LivelinessScore'],
                                                                  zipcode_data['FamilyFriendlinessScore'],
                                                                  zipcode_data['SafetyScore'],
                                                                  zipcode_data['BusinessEnvironmentScore'],
                                                                  zipcode_data['AmenityScore'],
                                                                  zipcode_data['DiversityIndex']]])[1][0][1:]
            recommendation = {
                "zipcode": int(zipcode),
                "predicted_price": float(price),
                "score": float(score),
                "median_household_income": float(zipcode_data['MedianHouseholdIncome']),
                "safety_score": float(zipcode_data['SafetyScore']),
                "diversity_index": float(zipcode_data['DiversityIndex']),
                "family_friendliness": float(zipcode_data['FamilyFriendlinessScore']),
                "business_environment": float(zipcode_data['BusinessEnvironmentScore']),
                "liveliness_score": float(zipcode_data['LivelinessScore']),
                "similar_zipcodes": [int(knn_data['zipcodes'][i]) for i in similar_zipcodes],
            }
            recommended_areas.append(recommendation)
    
    recommended_areas.sort(key=lambda x: x['score'], reverse=True)
    return recommended_areas[:n_recommendations]

# Example query
preferences = {
    'borough': 'Manhattan',
    'max_price': 1000000,
    'house_type': 'Condo',
    'bedrooms': 2,
    'bathrooms': 2,
    'sqft': 1000,
    'income': '$100,000-$150,000',
    'neighborhood_preference': 'Balanced mix',
    'household_type': 'Mix of families and singles',
    'business_environment': 'Mix of residential and commercial',
    'amenity_preferences': ['Parks and recreation', 'Public transportation']
}

# Get and print recommendations for testing
recommendations = get_recommendations(preferences)

for i, rec in enumerate(recommendations, 1):
    print(f"{i}. Zipcode: {rec['zipcode']}")
    print(f"   Predicted Price: ${rec['predicted_price']:,.2f}")
    print(f"   Score: {rec['score']:.2f}")
    print(f"   Median Household Income: ${rec['median_household_income']:,.2f}")
    print(f"   Safety Score: {rec['safety_score']:.2f}")
    print(f"   Diversity Index: {rec['diversity_index']:.2f}")
    print(f"   Family Friendliness: {rec['family_friendliness']:.2f}")
    print(f"   Business Environment: {rec['business_environment']:.2f}")
    print(f"   Liveliness Score: {rec['liveliness_score']:.2f}")
    print(f"   Similar Zipcodes: {', '.join(map(str, rec['similar_zipcodes']))}")
    print()
