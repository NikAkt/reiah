#!/bin/bash
set -e

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

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    SELECT 'CREATE DATABASE mydatabase OWNER myuser'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'mydatabase')\gexec
EOSQL

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    GRANT ALL PRIVILEGES ON DATABASE mydatabase TO myuser;
    \c mydatabase
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO myuser;
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO myuser;
    GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO myuser;
EOSQL
