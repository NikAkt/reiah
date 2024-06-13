run: build
	@./bin/app

build:
	npx tailwindcss -i views/css/app.css -o public/styles.css
	templ generate views/**/*
	templ fmt views/**/*
	@go build -o bin/app .

css:
	npx tailwindcss -i views/css/app.css -o public/styles.css
