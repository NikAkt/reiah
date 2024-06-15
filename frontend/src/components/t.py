import json

# File paths
input_file_path = '/Users/caitlin/PycharmProjects/summer/SummerProject/frontend/public/assets/us_zip_codes.txt'
output_file_path = '/Users/caitlin/PycharmProjects/summer/SummerProject/frontend/public/assets/us_zip_codes.json'

# Read the input file
with open(input_file_path, 'r') as file:
    lines = file.readlines()

# Parse the file content
zip_codes_data = []
for line in lines:
    zip_code, latitude, longitude = line.strip().split(',')
    zip_codes_data.append({
        'zip_code': zip_code,
        'latitude': latitude,
        'longitude': longitude
    })

# Convert to JSON
json_data = json.dumps(zip_codes_data, indent=4)

# Save the JSON data to a file
with open(output_file_path, 'w') as json_file:
    json_file.write(json_data)

print("Transformation complete. JSON data saved to:", output_file_path)
