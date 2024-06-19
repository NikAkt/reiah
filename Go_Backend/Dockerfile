# Use a Golang base image
FROM golang:1.22.4-alpine

# Set the Current Working Directory inside the container
WORKDIR /app

# Copy go mod and sum files
COPY ./Go_Backend/go.mod ./Go_Backend/go.sum ./

# Download all dependencies. Dependencies will be cached if the go.mod and go.sum files are not changed
RUN go mod download

# Install necessary build tools
RUN apk update && apk add --no-cache build-base

# Copy the source from the current directory to the Working Directory inside the container
COPY ./Go_Backend .

# Copy the JSON files into the container
COPY ./frontend/public/assets /app/public/assets

# Build the Go app
RUN go build -o bin/app .

# Expose port 8000 to the outside world
EXPOSE 8000

# Command to run the executable
CMD ["./bin/app"]
