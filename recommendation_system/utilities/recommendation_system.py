import pandas as pd
import numpy as np
import joblib
import json

# Load models
xgb_model = joblib.load('models/xgb_model_features.joblib')
knn_model = joblib.load('models/knn_model.joblib')

# Extract features from the KNN model pipeline
features = knn_model.steps[-3][1]
amenity_options = knn_model.steps[-2][1]
income_categories = knn_model.steps[-1][1]

# Load JSON data
with open('data/processed_zipcode_data.json', 'r') as f:
    data = json.load(f)

def translate_preferences(preferences):
    user_vector = np.zeros(len(features))

    # Mapping dictionaries
    neighborhood_types = {"Quiet residential": 0, "Balanced mix": 0.5, "Lively urban": 1}
    household_types = {"Mostly families": 1, "Mix of families and singles": 0.5, "Mostly singles": 0}
    business_env_types = {"Mostly residential": 0, "Mix of residential and commercial": 0.5, "Bustling commercial area": 1}

    # Assign values based on preferences
    if preferences['neighborhood_preference'] != "No preference":
        user_vector[features.index('LivelinessScore')] = neighborhood_types[preferences['neighborhood_preference']]

    if preferences['household_type'] != "No preference":
        user_vector[features.index('FamilyFriendlinessScore')] = household_types[preferences['household_type']]

    if preferences['business_environment'] != "No preference":
        user_vector[features.index('BusinessEnvironmentScore')] = business_env_types[preferences['business_environment']]

    # Amenity preferences
    for amenity, feature_key in amenity_options.items():
        if feature_key in features:
            user_vector[features.index(feature_key)] = 1 if amenity in preferences['amenity_preferences'] else 0

    # Income preference
    if 'IncomeCategory' in features:
        if preferences['income'] != "Prefer not to say":
            user_income_category = income_categories.index(preferences['income'])
            user_vector[features.index('IncomeCategory')] = user_income_category / (len(income_categories) - 1)
        else:
            user_vector[features.index('IncomeCategory')] = 0.5

    # Default values for features
    if 'SafetyScore' in features:
        user_vector[features.index('SafetyScore')] = 1
    if 'DiversityIndex' in features:
        user_vector[features.index('DiversityIndex')] = 0.5

    return user_vector

def predict_price(borough, house_type, bedrooms, bathrooms, sqft, latitude, longitude, zipcode, population, liveliness_score, median_household_income, population_density):
    input_data = pd.DataFrame({
        'BEDS': [bedrooms],
        'BATH': [bathrooms],
        'PROPERTYSQFT': [sqft],
        'LATITUDE': [latitude],
        'LONGITUDE': [longitude],
        'TYPE': [house_type],
        'ZIPCODE': [zipcode],
        'BOROUGH': [borough],
        'Population': [population],
        'LivelinessScore': [liveliness_score],
        'MedianHouseholdIncome': [median_household_income],
        'PopulationDensity': [population_density],
    })

    prediction = xgb_model.predict(input_data)[0]
    return prediction

def get_recommendations(preferences, n_recommendations=5):
    user_vector = translate_preferences(preferences)
    user_vector_scaled = knn_model.named_steps['scaler'].transform([user_vector])

    distances, indices = knn_model.named_steps['knn'].kneighbors(user_vector_scaled, n_neighbors=len(data))

    recommended_areas = []
    for i, index in enumerate(indices[0]):
        zipcode = list(data.keys())[index]
        zipcode_data = data[zipcode]

        if zipcode_data['BOROUGH'] != preferences['borough']:
            continue

        price = predict_price(
            preferences['borough'],
            preferences['house_type'],
            preferences['bedrooms'],
            preferences['bathrooms'],
            preferences['sqft'],
            zipcode_data['Latitude'],
            zipcode_data['Longitude'],
            zipcode,
            zipcode_data['Population'],
            zipcode_data['LivelinessScore'],
            zipcode_data['MedianHouseholdIncome'],
            zipcode_data['PopulationDensity'],
        )

        if price is not None and price <= preferences['max_price']:
            recommendation = {
                "zipcode": int(zipcode),
                "predicted_price": float(price),
                "income_category": zipcode_data.get('IncomeCategory', 'Unknown'),
                "safety_score": float(zipcode_data['SafetyScore']),
                "diversity_index": float(zipcode_data['DiversityIndex']),
                "family_friendliness": float(zipcode_data['FamilyFriendlinessScore']),
                "business_environment": float(zipcode_data['BusinessEnvironmentScore']),
                "liveliness_score": float(zipcode_data['LivelinessScore']),
                "similarity_score": 1 - distances[0][i],
            }

            # Add amenity scores to the recommendation
            for amenity, feature_key in amenity_options.items():
                if feature_key in zipcode_data:
                    recommendation[f"{amenity.lower().replace(' ', '_')}_score"] = float(zipcode_data[feature_key])

            recommended_areas.append(recommendation)

    recommended_areas.sort(key=lambda x: x['similarity_score'], reverse=True)
    return recommended_areas[:n_recommendations]