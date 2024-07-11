import pandas as pd
import numpy as np
from scipy.spatial.distance import cdist
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler
import pickle
import joblib

# Load the house price predictor
rf_model = joblib.load('recommendation_system/models/rf_model.joblib')

# Load the KNN model
knn_pipeline = joblib.load('recommendation_system/models/knn_model.joblib')

data = pd.read_csv('recommendation_system/data/processed_data_with_knn.csv')

# Access features from the pipeline (to find similar zipcodes to the ones recommended)
features = knn_pipeline.steps[-1][1]

# Function to translate user preferences into a vector
def translate_preferences(preferences, data, features):
    neighborhood_types = {"Quiet residential": 0, "Balanced mix": 0.5, "Lively urban": 1}
    household_types = {"Mostly families": 1, "Mix of families and singles": 0.5, "Mostly singles": 0}
    business_env_types = {"Mostly residential": 0, "Mix of residential and commercial": 0.5, "Bustling commercial area": 1}

    user_vector = np.zeros(len(features))
    
    if preferences['neighborhood_preference'] != "No preference":
        user_vector[features.index('LivelinessScore')] = neighborhood_types[preferences['neighborhood_preference']]
    
    if preferences['household_type'] != "No preference":
        user_vector[features.index('FamilyFriendlinessScore')] = household_types[preferences['household_type']]
    
    if preferences['business_environment'] != "No preference":
        user_vector[features.index('BusinessEnvironmentScore')] = business_env_types[preferences['business_environment']]
    
    amenity_columns = {
        "Parks and recreation": 'recreational_facility_density',
        "Shopping and restaurants": 'BusinessDensity',
        "Schools and education": 'education_facility_density',
        "Public transportation": 'transportation_facility_density',
        "Cultural attractions": 'cultural_facility_density'
    }
    user_vector[features.index('AmenityScore')] = sum([data[amenity_columns[pref]].mean() for pref in preferences['amenity_preferences']]) / len(preferences['amenity_preferences'])
    
    user_vector[features.index('SafetyScore')] = 1  
    user_vector[features.index('DiversityIndex')] = 0.5  
    
    return user_vector

# Function to predict house price
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

# Function to get recommendations
def get_recommendations(preferences, n_recommendations=5, n_similar=3):
    user_vector = translate_preferences(preferences, data, features)
    user_vector_scaled = knn_pipeline.named_steps['scaler'].transform([user_vector])

    distances, indices = knn_pipeline.named_steps['knn'].kneighbors(user_vector_scaled, n_neighbors=n_recommendations)

    recommended_areas = []
    for index in indices[0]:
        zipcode_data = data.iloc[index]
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
            similar_zipcode_indices = knn_pipeline.named_steps['knn'].kneighbors(knn_pipeline.named_steps['scaler'].transform([zipcode_data[features].values]), n_neighbors=n_similar+1)[1][0][1:]
            similar_zipcodes = [int(data.iloc[idx]['ZipCode']) for idx in similar_zipcode_indices]
            
            recommendation = {
                "zipcode": int(zipcode),
                "predicted_price": float(price),
                "median_household_income": float(zipcode_data['MedianHouseholdIncome']),
                "safety_score": float(zipcode_data['SafetyScore']),
                "diversity_index": float(zipcode_data['DiversityIndex']),
                "family_friendliness": float(zipcode_data['FamilyFriendlinessScore']),
                "business_environment": float(zipcode_data['BusinessEnvironmentScore']),
                "liveliness_score": float(zipcode_data['LivelinessScore']),
                "amenity_score": float(zipcode_data['AmenityScore']),
                "similarity_score": 1 - distances[0][indices[0].tolist().index(index)],
                "similar_zipcodes": similar_zipcodes
            }
            recommended_areas.append(recommendation)
    
    recommended_areas.sort(key=lambda x: x['similarity_score'], reverse=True)
    return recommended_areas[:n_recommendations]


# Example query
preferences = {
    'borough': 'Brooklyn',
    'max_price': 1000000,
    'house_type': 'House',
    'bedrooms': 2,
    'bathrooms': 1,
    'sqft': 1000,
    'income': 'Prefer not to say', 
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
    print(f"   Median Household Income: ${rec['median_household_income']:,.2f}")
    print(f"   Safety Score: {rec['safety_score']:.2f}")
    print(f"   Diversity Index: {rec['diversity_index']:.2f}")
    print(f"   Family Friendliness: {rec['family_friendliness']:.2f}")
    print(f"   Business Environment: {rec['business_environment']:.2f}")
    print(f"   Liveliness Score: {rec['liveliness_score']:.2f}")
    print(f"   Amenity Score: {rec['amenity_score']:.2f}")
    print(f"   Similarity Score: {rec['similarity_score']:.2f}")
    print(f"   Similar Zipcodes: {', '.join(map(str, rec['similar_zipcodes']))}")
    print()