#!/bin/bash
set -e

echo "=== RecallForge Infrastructure Startup ==="

# Function to start a container if not running
start_container() {
    NAME=$1
    IMAGE=$2
    PORTS=$3 # e.g. "-p 6379:6379"
    ENV=$4   # e.g. "-e KEY=VAL"
    VOL=$5   # e.g. "-v vol:/path"

    if [ "$(docker ps -q -f name=$NAME)" ]; then
        echo "✅ $NAME is already running."
    else
        if [ "$(docker ps -aq -f name=$NAME)" ]; then
            echo "🔄 Starting existing $NAME container..."
            docker start $NAME
        else
            echo "🚀 Creating and starting $NAME..."
            # We use eval to handle spaces in arguments correctly if needed, 
            # but for simple cases passing vars directly works with proper quoting interaction.
            # Simpler approach: construct command string for clarity in echo/debug
            docker run -d $PORTS $ENV $VOL --name $NAME $IMAGE
        fi
    fi
}

# 1. Redis
start_container "redis" "redis:7-alpine" "-p 6379:6379" "" ""

# 2. Qdrant
start_container "qdrant" "qdrant/qdrant:latest" "-p 6333:6333" "" "-v qdrant_data:/qdrant/storage"

# 3. Postgres
# Using port 5433 for host binding as discovered during setup (5432 was busy)
start_container "db" "postgres:15-alpine" "-p 5433:5432" "-e POSTGRES_DB=recallforge -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres" "-v postgres_data:/var/lib/postgresql/data"

echo "⏳ Waiting for services to initialize..."
sleep 5

echo "🛠 Running Django Migrations..."
python manage.py migrate

echo "✅ Infrastructure is ready!"
echo "------------------------------------------------"
echo "To start the application run:"
echo "  Terminal 1: python manage.py runserver"
echo "  Terminal 2: celery -A config worker -l info"
echo "------------------------------------------------"
