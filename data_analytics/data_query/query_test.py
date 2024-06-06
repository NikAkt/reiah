from google.cloud import bigquery
from dotenv import load_dotenv
import folium
import branca.colormap as cm

# Google Application Credentials
load_dotenv()

# Initialize a BigQuery client
client = bigquery.Client()

# schema of the BigQuery table
dataset_id = 'cleaned_prices_data'
table_id = 'cleaned_property_prices'

table_ref = client.dataset(dataset_id).table(table_id)
table = client.get_table(table_ref)  

# Print the schema
print("Schema of the table:")
for schema_field in table.schema:
    print(schema_field.name, schema_field.field_type)

# Query 
query = """
    SELECT 
        ZIP_CODE,
        LATITUDE,
        LONGITUDE,
        AVG(SALE_PRICE) AS avg_sale_price
    FROM `summerproject-424912.cleaned_prices_data.cleaned_property_prices`
    GROUP BY ZIP_CODE, LATITUDE, LONGITUDE
"""

# Execute query
query_job = client.query(query)
geo_data = query_job.result().to_dataframe()

# Filter out rows with NaN values in LATITUDE or LONGITUDE
geo_data = geo_data.dropna(subset=['LATITUDE', 'LONGITUDE'])

# Normalize average sale prices for color gradient
min_price = geo_data['avg_sale_price'].min()
max_price = geo_data['avg_sale_price'].max()

# Create a color map
colormap = cm.LinearColormap(colors=['blue', 'yellow', 'red'], vmin=min_price, vmax=max_price)
colormap.caption = 'Average Sale Price'
m = folium.Map(location=[40.7128, -74.0060], zoom_start=10)

# Add points to the map with color gradient
for _, row in geo_data.iterrows():
    normalized_price = colormap(row['avg_sale_price'])
    folium.CircleMarker(
        location=(row['LATITUDE'], row['LONGITUDE']),
        radius=5,
        popup=f"ZIP Code: {row['ZIP_CODE']}, Avg Sale Price: ${row['avg_sale_price']:.2f}",
        color=normalized_price,
        fill=True,
        fill_color=normalized_price
    ).add_to(m)

# Add the color map legend to the map
colormap.add_to(m)

# Save the map as an HTML file
m.save('property_prices_map.html')
print("Map saved as property_prices_map.html")
