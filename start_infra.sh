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

start_containers() {
    echo -e "${BLUE}Starting infrastructure with Docker Compose...${NC}"
    docker-compose up -d
}

stop_containers() {
    echo -e "${YELLOW}Stopping all infrastructure...${NC}"
    docker-compose down
    echo -e "${GREEN}Stopped.${NC}"
}

run_migrations() {
    echo -e "${BLUE}Running Django Migrations...${NC}"
    # Check if virtualenv is active or python is available
    if command -v python >/dev/null 2>&1; then
        python manage.py migrate
    else
        echo -e "${YELLOW}Warning: python command not found. Skipping migrations.${NC}"
        echo "Please run 'python manage.py migrate' manually inside your virtualenv."
    fi
}

show_status() {
    echo -e "\n${BLUE}Infrastructure Status:${NC}"
    docker-compose ps
}

# Main Logic
check_docker

case "$1" in
    stop)
        stop_containers
        ;;
    restart)
        stop_containers
        sleep 2
        start_containers
        show_status
        ;;
    status)
        show_status
        ;;
    *)
        # Default: Start
        start_containers
        
        echo -e "⏳ ${YELLOW}Waiting for services to be ready...${NC}"
        sleep 5
        
        run_migrations
        show_status
        
        echo -e "\n${GREEN}✅ Infrastructure is ready!${NC}"
        echo "------------------------------------------------"
        echo "Usage: ./start_infra.sh [start|stop|restart|status]"
        echo "------------------------------------------------"
        echo "Next Steps:"
        echo "  Terminal 1: python manage.py runserver"
        echo "  Terminal 2: celery -A config worker -l info"
        echo "  Terminal 3: cd frontend && npm run dev"
        echo "------------------------------------------------"
        ;;
esac
