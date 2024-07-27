from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import json
from utilities.recommendation_system import get_recommendations, predict_price

app = Flask(__name__)
CORS(app)

# Load JSON data
with open('data/processed_zipcode_data.json', 'r') as f:
    zipcode_data = json.load(f)

@app.route('/predict_price', methods=['POST', 'GET'])
def predict_price_endpoint():
    try:
        if request.method == 'POST':
            data = request.get_json()
        else:
            data = request.args

        borough = data.get('borough')
        house_type = data.get('house_type')
        bedrooms = int(data.get('bedrooms'))
        bathrooms = int(data.get('bathrooms'))
        sqft = int(data.get('sqft'))
        latitude = float(data.get('latitude'))
        longitude = float(data.get('longitude'))
        zipcode = data.get('zipcode')

        if zipcode not in zipcode_data:
            return jsonify({'error': 'Zipcode not found'}), 404

        # Retrieve additional parameters based on the provided zipcode
        zip_info = zipcode_data[zipcode]
        population = zip_info['Population']
        liveliness_score = zip_info['LivelinessScore']
        median_household_income = zip_info['MedianHouseholdIncome']
        population_density = zip_info['PopulationDensity']

        prediction = predict_price(
            borough, house_type, bedrooms, bathrooms, sqft, latitude, longitude, zipcode,
            population, liveliness_score, median_household_income, population_density
        )

        return jsonify({'predicted_price': float(prediction)})
    except Exception as e:
        app.logger.error(f"Exception on /predict_price: {e}")
        return jsonify({'error': 'An error occurred', 'message': str(e)}), 500

@app.route('/get_recommendations', methods=['POST', 'GET'])
def get_recommendations_endpoint():
    if request.method == 'POST':
        preferences = request.get_json()
    else:
        preferences = {
            'borough': request.args.get('borough'),
            'max_price': int(request.args.get('max_price')),
            'house_type': request.args.get('house_type'),
            'bedrooms': int(request.args.get('bedrooms')),
            'bathrooms': int(request.args.get('bathrooms')),
            'sqft': int(request.args.get('sqft')),
            'income': request.args.get('income'),
            'neighborhood_preference': request.args.get('neighborhood_preference'),
            'household_type': request.args.get('household_type'),
            'business_environment': request.args.get('business_environment'),
            'amenity_preferences': request.args.getlist('amenity_preferences')
        }
    
    recommendations = get_recommendations(preferences)
    return jsonify(recommendations)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
