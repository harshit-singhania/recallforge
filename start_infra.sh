#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== RecallForge Infrastructure Manager ===${NC}"

check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}Error: Docker is not running or not accessible.${NC}"
        echo "Please start Docker Desktop or Colima."
        exit 1
    fi
}

start_container() {
    NAME=$1
    IMAGE=$2
    PORTS=$3
    ENV=$4
    VOL=$5

    echo -n "Checking $NAME... "
    if [ "$(docker ps -q -f name=$NAME)" ]; then
        echo -e "${GREEN}Running.${NC}"
    elif [ "$(docker ps -aq -f name=$NAME)" ]; then
        echo -e "${YELLOW}Stopped. Starting...${NC}"
        docker start $NAME > /dev/null
    else
        echo -e "${BLUE}Creating...${NC}"
        docker run -d $PORTS $ENV $VOL --name $NAME $IMAGE > /dev/null
    fi
}

stop_containers() {
    echo -e "${YELLOW}Stopping all infrastructure...${NC}"
    docker stop redis qdrant db 2>/dev/null || true
    echo -e "${GREEN}Stopped.${NC}"
}

run_migrations() {
    echo -e "${BLUE}Running Django Migrations...${NC}"
    python manage.py migrate
}

show_status() {
    echo -e "\n${BLUE}Infrastructure Status:${NC}"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" -f name=redis -f name=qdrant -f name=db
}

# Main Logic
check_docker

case "$1" in
    stop)
        stop_containers
        ;;
    restart)
        stop_containers
        $0
        ;;
    status)
        show_status
        ;;
    *)
        # Default: Start
        start_container "redis" "redis:7-alpine" "-p 6379:6379" "" ""
        start_container "qdrant" "qdrant/qdrant:latest" "-p 6333:6333" "" "-v qdrant_data:/qdrant/storage"
        start_container "db" "postgres:15-alpine" "-p 5433:5432" "-e POSTGRES_DB=recallforge -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres" "-v postgres_data:/var/lib/postgresql/data"
        
        echo -e "⏳ ${YELLOW}Waiting for services...${NC}"
        sleep 3
        
        run_migrations
        show_status
        
        echo -e "\n${GREEN}✅ Infrastructure is ready!${NC}"
        echo "------------------------------------------------"
        echo "Usage: ./start_infra.sh [start|stop|restart|status]"
        echo "------------------------------------------------"
        echo "Next Steps:"
        echo "  Terminal 1: python manage.py runserver"
        echo "  Terminal 2: celery -A config worker -l info"
        echo "------------------------------------------------"
        ;;
esac
