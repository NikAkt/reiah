CREATE TABLE IF NOT EXISTS amenities (
    id SERIAL PRIMARY KEY,
    borough VARCHAR(255),
    name VARCHAR(255),
    facility_type VARCHAR(255),
    facility_desc VARCHAR(255),
    zipcode VARCHAR(20),
    longitude DOUBLE PRECISION,
    latitude DOUBLE PRECISION,
    distance_to_facility DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS businesses (
    id SERIAL PRIMARY KEY,
    taxi_zone INTEGER,
    business_type VARCHAR(255),
    zipcode INTEGER,
    longitude DOUBLE PRECISION,
    latitude DOUBLE PRECISION,
    counts INTEGER
);

CREATE TABLE IF NOT EXISTS prices (
    id SERIAL PRIMARY KEY,
    zipcode INTEGER,
    home_value DOUBLE PRECISION,
    household_income DOUBLE PRECISION,
    median_age DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS historic_prices (
    id SERIAL PRIMARY KEY,
    zipcode VARCHAR(20),
    history JSONB
);

CREATE TABLE IF NOT EXISTS neighbourhood_mappings (
    id SERIAL PRIMARY KEY,
    neighbourhood VARCHAR(255),
    borough VARCHAR(255),
    zipcodes JSONB
);

CREATE TABLE IF NOT EXISTS demographic_data (
    id SERIAL PRIMARY KEY,
    zipcode INTEGER,
    year INTEGER,
    population INTEGER,
    population_density INTEGER,
    median_household_income DOUBLE PRECISION,
    travel_time_to_work DOUBLE PRECISION,
    male INTEGER,
    female INTEGER,
    white INTEGER,
    black INTEGER,
    asian INTEGER,
    american_indian INTEGER,
    pacific_islander DOUBLE PRECISION,
    other INTEGER,
    family_household INTEGER,
    single_household INTEGER,
    diversity_index DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY,
    price DOUBLE PRECISION,
    beds DOUBLE PRECISION,
    type VARCHAR(255),
    bath DOUBLE PRECISION,
    property_sqft DOUBLE PRECISION,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    zipcode VARCHAR(20),
    borough VARCHAR(255),
    neighborhood VARCHAR(255),
    price_per_sqft DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS zipcode_scores (
    id SERIAL PRIMARY KEY,
    zipcode INTEGER,
    borough VARCHAR(255),
    current_price DOUBLE PRECISION,
    one_yr_roi DOUBLE PRECISION,
    one_yr_roi_lower DOUBLE PRECISION,
    one_yr_roi_upper DOUBLE PRECISION,
    one_yr_forecast DOUBLE PRECISION,
    three_yr_roi DOUBLE PRECISION,
    three_yr_roi_lower DOUBLE PRECISION,
    three_yr_roi_upper DOUBLE PRECISION,
    three_yr_forecast DOUBLE PRECISION,
    five_yr_roi DOUBLE PRECISION,
    five_yr_roi_lower DOUBLE PRECISION,
    five_yr_roi_upper DOUBLE PRECISION,
    five_yr_forecast DOUBLE PRECISION
);
