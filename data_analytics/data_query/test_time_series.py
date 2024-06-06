from google.cloud import bigquery
from dotenv import load_dotenv
import matplotlib.pyplot as plt

# Google Application Credentials
load_dotenv()

# Initialize a BigQuery client
client = bigquery.Client()

# Verify the schema of the BigQuery table
dataset_id = 'cleaned_prices_data'
table_id = 'cleaned_property_prices'

# Time Series Analysis - Average Sale Price Over Time
query = """
    SELECT 
        EXTRACT(YEAR FROM SALE_DATE) AS year,
        AVG(SALE_PRICE) AS avg_sale_price
    FROM `summerproject-424912.cleaned_prices_data.cleaned_property_prices`
    GROUP BY year
    ORDER BY year
"""

query_job = client.query(query)
time_series_data = query_job.result().to_dataframe()

# Plot the data
plt.figure(figsize=(10, 6))
plt.plot(time_series_data['year'], time_series_data['avg_sale_price'], marker='o')
plt.xlabel('Year')
plt.ylabel('Average Sale Price')
plt.title('Average Sale Price Over Time')
plt.grid(True)
plt.show()
