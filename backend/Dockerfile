# Use a Golang base image
FROM golang:1.22.4-alpine

# Set the Current Working Directory inside the container
WORKDIR /app

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download all dependencies. Dependencies will be cached if the go.mod and go.sum files are not changed
RUN go mod download

# Install necessary build tools and postgresql-client
RUN apk update && apk add --no-cache build-base postgresql-client

# Copy the source from the current directory to the Working Directory inside the container
COPY . .

# Ensure the public/data directory is copied
RUN mkdir -p backend/public/data
COPY ./public/data ./backend/public/data

# Build the Go app
RUN go build -o bin/app ./cmd/main.go

# Expose port 8000 to the outside world
EXPOSE 8000

# Command to run the executable
ENTRYPOINT ["/app/bin/app"]
