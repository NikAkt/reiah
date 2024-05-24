#!/bin/bash
set -e

# Check if the user exists and create if it does not
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
  DO
  \$do\$
  BEGIN
     IF NOT EXISTS (
        SELECT 
        FROM   pg_catalog.pg_roles
        WHERE  rolname = 'myuser') THEN
        CREATE ROLE myuser WITH LOGIN PASSWORD 'mypassword';
     END IF;
  END
  \$do\$;
EOSQL

# Check if the database exists and create if it does not
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
  SELECT 'CREATE DATABASE mydatabase OWNER myuser'
  WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'mydatabase')\gexec
EOSQL

# Grant privileges to the user
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
  GRANT ALL PRIVILEGES ON DATABASE mydatabase TO myuser;
EOSQL
