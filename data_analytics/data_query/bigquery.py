from google.cloud import bigquery
from dotenv import load_dotenv

# Google Application Credentials
load_dotenv()

# BigQuery client
client = bigquery.Client()

gcs_uri = 'gs://price_data_test/cleaned_property_prices_dataset.csv'

# dataset and table name
dataset_id = 'summerproject-424912.cleaned_prices_data'
table_id = 'cleaned_property_prices'

# Define the schema
schema = [
    bigquery.SchemaField("BOROUGH", "STRING"),
    bigquery.SchemaField("NEIGHBORHOOD", "STRING"),
    bigquery.SchemaField("BUILDING_CLASS_CATEGORY", "STRING"),
    bigquery.SchemaField("ADDRESS", "STRING"),
    bigquery.SchemaField("ZIP_CODE", "STRING"),
    bigquery.SchemaField("RESIDENTIAL_UNITS", "FLOAT"),
    bigquery.SchemaField("COMMERCIAL_UNITS", "FLOAT"),
    bigquery.SchemaField("LAND_SQUARE_FEET", "FLOAT"),
    bigquery.SchemaField("GROSS_SQUARE_FEET", "FLOAT"),
    bigquery.SchemaField("YEAR_BUILT", "FLOAT"),
    bigquery.SchemaField("SALE_PRICE", "FLOAT"),
    bigquery.SchemaField("SALE_DATE", "DATE"),
    bigquery.SchemaField("STREET NAME", "STRING"),
    bigquery.SchemaField("Latitude", "FLOAT"),
    bigquery.SchemaField("Longitude", "FLOAT"),
]

# Create LoadJobConfig
job_config = bigquery.LoadJobConfig(
    source_format=bigquery.SourceFormat.CSV,
    skip_leading_rows=1,  
    schema=schema,
    max_bad_records=10,  
)

# Load CSV data from GCS to BigQuery
load_job = client.load_table_from_uri(
    gcs_uri,
    f'{dataset_id}.{table_id}',
    job_config=job_config
)

load_job.result()

print(f'Loaded {load_job.output_rows} rows into {dataset_id}.{table_id}.')
