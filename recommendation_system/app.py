from flask import Flask, request, jsonify
import joblib
import pandas as pd
from utilities.recommendation_system import get_recommendations, predict_price

app = Flask(__name__)

# Load the models
rf_model = joblib.load('models/rf_model.joblib')
knn_model = joblib.load('models/knn_model.joblib')

@app.route('/predict_price', methods=['POST', 'GET'])
def predict_price_endpoint():
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
    
    prediction = predict_price(borough, house_type, bedrooms, bathrooms, sqft, latitude, longitude, zipcode)
    return jsonify({'predicted_price': prediction})

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
