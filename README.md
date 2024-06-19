# Real Estate Advisor

An application that provides real estate insights and predictions based on busyness data.

## Table of Contents

- [Getting Started](#getting-started)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Backend](#running-the-backend)
- [Running the Frontend](#running-the-frontend)
- [Docker Setup](#docker-setup)
- [Contributing](#contributing)
- [License](#license)

## Getting Started

Follow these instructions to set up the project locally.

## Prerequisites

Making sure you have the following software installed:

- Python 3.9 or higher
- Git
- Node.js and npm
- Docker (optional, for Docker setup)
- Virtualenv (optional, but recommended)

## Installation

### 1. Clone the Repository

```sh
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2. Create and Activate Virtual Environment

- On Unix or macOS:

  ```sh
  python3 -m venv backend/venv
  source backend/venv/bin/activate
  ```

- On Windows:

  ```sh
  python -m venv backend\\venv
  backend\\venv\\Scripts\\activate
  ```

### 3. Install Backend Requirements

```sh
pip install -r backend/requirements.txt
```

### 4. Set Up Environment Variables

Create a `.env` file in the `backend` directory and add the necessary environment variables:

```sh
cd backend
touch .env
```

Then open the `.env` file and add the following content:

```env
DATABASE_URL=postgresql://user:password@localhost/real_estate
```

## Running the Backend

### 1. Navigate to Backend Directory

```sh
cd backend
```

### 2. Run the FastAPI Application

```sh
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend should now be running on `http://0.0.0.0:8000`.

## Running the Frontend

### 1. Navigate to Frontend Directory

```sh
cd ../frontend
```

### 2. Install Frontend Dependencies

```sh
npm install
```

### 3. Run the Frontend Application

```sh
npm start
```

The frontend should now be running on `http://localhost:3000`.

## Docker Setup

To use Docker, follow these steps:

### 1. Build and Run the Containers

```sh
docker-compose up --build
```

This will build and run the backend, frontend, and database containers.

## Contributing

Follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature-branch`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature-branch`)
5. Open a pull request
