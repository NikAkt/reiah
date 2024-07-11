from flask import Flask, request, jsonify
from utilities.recommendation_system import get_recommendations, predict_price
import joblib

app = Flask(__name__)

# Load models
rf_model = joblib.load('models/rf_model.joblib')
knn_model = joblib.load('models/knn_model.joblib')

# Define features
features = knn_model.steps[-3][1]

@app.route('/predict_price', methods=['POST'])
def predict_price_endpoint():
    data = request.json
    borough = data['borough']
    house_type = data['house_type']
    bedrooms = data['bedrooms']
    bathrooms = data['bathrooms']
    sqft = data['sqft']
    latitude = data['latitude']
    longitude = data['longitude']
    zipcode = data['zipcode']
    prediction = predict_price(borough, house_type, bedrooms, bathrooms, sqft, latitude, longitude, zipcode)
    return jsonify({'predicted_price': prediction})

@app.route('/get_recommendations', methods=['POST'])
def get_recommendations_endpoint():
    preferences = request.json
    recommendations = get_recommendations(preferences)
    return jsonify(recommendations)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
