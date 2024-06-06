import os
import requests
from bs4 import BeautifulSoup
from tqdm import tqdm

# Define the base URL for the website
base_url = 'https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page'

# Fetch the website content
response = requests.get(base_url)
if response.status_code != 200:
    raise Exception(f"Failed to load page {base_url}")

# Parse the HTML content using BeautifulSoup
soup = BeautifulSoup(response.content, 'html.parser')

# Define the directory to store downloaded Parquet files
download_dir = 'raw_taxi_data'
os.makedirs(download_dir, exist_ok=True)

# Function to download Parquet file with resume capability
def download_parquet(url, filename):
    temp_filename = filename + ".part"
    mode = 'ab' if os.path.exists(temp_filename) else 'wb'
    file_size = os.path.getsize(temp_filename) if os.path.exists(temp_filename) else 0

    headers = {'Range': f'bytes={file_size}-'}
    with requests.get(url, headers=headers, stream=True) as r:
        r.raise_for_status()
        total_size = int(r.headers.get('content-length', 0)) + file_size
        with open(temp_filename, mode) as f:
            for chunk in r.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
    os.rename(temp_filename, filename)

# Loop through years and months to find specific Parquet files 
for year in range(2022, 2024):
    for month in range(1, 13):
        month_str = str(month).zfill(2)
        yellow_pattern = f'yellow_tripdata_{year}-{month_str}.parquet'
        green_pattern = f'green_tripdata_{year}-{month_str}.parquet'
        for link in soup.find_all('a', href=True):
            href = link['href']
            if href.endswith('.parquet'):
                if yellow_pattern in href or green_pattern in href:
                    file_name = os.path.basename(href)
                    local_file_path = os.path.join(download_dir, file_name)
                    if not os.path.exists(local_file_path):
                        try:
                            download_parquet(href, local_file_path)
                        except requests.exceptions.RequestException as e:
                            print(f"Failed to download {file_name}. Error: {e}")
                        
print("All relevant Parquet files have been downloaded and stored in the 'raw_taxi_data' folder.")
