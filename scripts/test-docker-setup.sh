#!/bin/bash
# Test script to verify Docker setup is working correctly

echo "Testing Docker configuration for Astronautics Club website..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Error: Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "Checking if containers are running..."
NEXTJS_RUNNING=$(docker ps | grep astronautics-nextjs | wc -l)
NGINX_RUNNING=$(docker ps | grep astronautics-nginx | wc -l)

if [ "$NEXTJS_RUNNING" -eq 0 ] || [ "$NGINX_RUNNING" -eq 0 ]; then
    echo "Starting containers with docker-compose..."
    docker-compose up -d
else
    echo "Containers are already running."
fi

echo "Checking if uploads volume is properly configured..."
VOLUME_EXISTS=$(docker volume ls | grep uploads_data | wc -l)

if [ "$VOLUME_EXISTS" -eq 0 ]; then
    echo "Warning: uploads_data volume not found. It will be created when you start the containers."
else
    echo "✅ uploads_data volume is properly configured."
fi

echo "Testing connection to the website..."
if curl -s --head http://localhost | grep "200 OK" > /dev/null; then
    echo "✅ Website is accessible at http://localhost"
else
    echo "⚠️ Website is not responding. Check if the containers are running properly."
fi

echo "Testing connection to the API..."
if curl -s --head http://localhost/api/upload | grep "200 OK" > /dev/null; then
    echo "✅ API is accessible at http://localhost/api/upload"
else
    echo "⚠️ API is not responding. Check if the containers are running properly."
fi

echo "Test complete!"
