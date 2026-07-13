#!/bin/bash

# Exit on any error
set -e

echo "Starting deployment setup for BeyondMaps on Azure Ubuntu..."

# 1. Update and Upgrade Packages
echo "Updating packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

# 2. Install Docker and Docker Compose (if not already installed)
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    sudo apt-get install -y docker.io
    sudo systemctl start docker
    sudo systemctl enable docker
else
    echo "Docker is already installed."
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
else
    echo "Docker Compose is already installed."
fi

# 3. Add user to docker group (so we don't need sudo for docker)
if ! groups $USER | grep -q '\bdocker\b'; then
    echo "Adding $USER to the docker group..."
    sudo usermod -aG docker $USER
    echo "NOTE: You may need to log out and log back in for docker group changes to take effect."
fi

# 4. Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating empty .env file. YOU MUST FILL THIS IN WITH NANO!"
    touch .env
    echo "PORT=5000" >> .env
    echo "MONGO_URI=" >> .env
    echo "JWT_SECRET=" >> .env
    echo "JWT_EXPIRE=30d" >> .env
    echo "SMTP_HOST=smtp.mailtrap.io" >> .env
    echo "SMTP_PORT=2525" >> .env
    echo "SMTP_USER=" >> .env
    echo "SMTP_PASS=" >> .env
    echo "FROM_EMAIL=" >> .env
    echo "FROM_NAME=BeyondMaps" >> .env
fi

# 5. Build and run the Docker containers using sudo just in case the group hasn't taken effect
echo "Building and starting the Docker container..."
sudo docker-compose up -d --build

echo "Deployment script finished! Backend should be running on port 5000."
