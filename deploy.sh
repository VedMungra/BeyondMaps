#!/bin/bash

# Exit on any error
set -e

echo "Starting deployment setup for BeyondMaps on Azure Ubuntu..."

# 1. Update and Upgrade Packages
echo "Updating packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

# 2. Install Docker and Docker Compose
echo "Installing Docker..."
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin docker-compose

# 3. Add current user to docker group
echo "Adding user to docker group..."
sudo usermod -aG docker $USER
echo "NOTE: You may need to log out and log back in for docker group changes to take effect."

# 4. Prompt for .env setup
if [ ! -f .env ]; then
  echo "⚠️  .env file not found! Please create one in the project root with your production secrets before starting the containers."
  echo "Example:"
  echo "PORT=5000"
  echo "MONGO_URI=your_atlas_uri"
  echo "JWT_SECRET=your_jwt_secret"
else
  echo ".env file found."
fi

# 5. Build and run containers
echo "Building and starting containers in detached mode..."
# Using sudo here in case the user hasn't logged out and back in yet
sudo docker-compose up -d --build

echo "Deployment script finished! Backend should be running on port 5000."
