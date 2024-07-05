import joblib
import pandas as pd
import os

# Absolute path needed for pickle files
current_dir = os.path.dirname(os.path.abspath(__file__))

# Load model and encoders 
model = joblib.load(os.path.join(current_dir, 'random_forest_model.pkl'))
le_type = joblib.load(os.path.join(current_dir, 'le_type.pkl'))
le_zipcode = joblib.load(os.path.join(current_dir, 'le_zipcode.pkl'))
le_borough = joblib.load(os.path.join(current_dir, 'le_borough.pkl'))

# Load the data
joined_data = pd.read_csv(os.path.join(current_dir, 'cleaned_property_data.csv'))

def predict_price_and_top_zipcodes_in_borough(borough, beds, baths, house_type, price_range):
    # Encode inputs
    type_encoded = le_type.transform([house_type])[0]
    borough_encoded = le_borough.transform([borough])[0]

    # Filter the data 
    borough_data = joined_data[joined_data['BOROUGH'] == borough]
    
    # Initialize a dictionary to store predictions
    zipcode_predictions = {}
    
    for zipcode in borough_data['ZIPCODE'].unique():
        zipcode_encoded = le_zipcode.transform([zipcode])[0]
        
        # Create a DataFrame for prediction to avoid the warning
        input_data = pd.DataFrame({
            'BEDS': [beds],
            'BATH': [baths],
            'TYPE_ENCODED': [type_encoded],
            'ZIPCODE_ENCODED': [zipcode_encoded],
            'BOROUGH_ENCODED': [borough_encoded]
        })
        
        # Predict price
        prediction = model.predict(input_data)[0]
        if price_range[0] <= prediction <= price_range[1]:
            zipcode_predictions[zipcode] = prediction
    
    # Get zipcodes based on predicted price
    top_zipcodes = sorted(zipcode_predictions.items(), key=lambda item: item[1], reverse=True)[:5]
    
    return top_zipcodes

# Example
if __name__ == '__main__':
    borough = 'Brooklyn'
    beds = 2
    baths = 2
    house_type = 'House'
    price_range = (500000, 800000)

    top_zipcodes = predict_price_and_top_zipcodes_in_borough(borough, beds, baths, house_type, price_range)

    print(f"\nTop 5 zipcodes in {borough} for a {beds} bed, {baths} bath {house_type}:")
    for zipcode, price in top_zipcodes:
        print(f"Zipcode: {zipcode}, Predicted Price: ${price:,.2f}")