# ATTENTION: This script may or may not work. Since i primarily use Linux, i have no way of testing this script. :^)
# All snippets you see are eithe GitHub Copilot suggestions or taken from stackoverflow.

# check if docker is installed
Get-Command docker -ErrorAction SilentlyContinue | Out-Null
if ($LastExitCode -ne 0) {
    Write-Host "Docker is not installed. Please install it and try again."
    exit 1
}

# check if docker-compose is installed
Get-Command docker compose -ErrorAction SilentlyContinue | Out-Null
if ($LastExitCode -ne 0) {
    Write-Host "Docker-compose is not installed. Please install it and try again."
    exit 1
}

# remove old images
echo "Removing old images..."
docker rmi -f faculty_manager

# pull fresh images
echo "Pulling fresh images..."
docker pull ghcr.io/rndrmu/facultymanager:latest

# start containers
echo "Starting containers..."
docker compose -f docker-db.yml up -d

# wait for db to start
echo "Waiting for db to start..."
sleep 10

echo "Starting faculty manager..."
docker run -d --name="faculty_manager" --net host -v $PWD/config.json:/config.json -v $PWD/images:/images --env-file .env faculty_manager:latest
