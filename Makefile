# Astronautics Club Website Makefile
# This Makefile provides commands for Docker management, development, and maintenance tasks.

.PHONY: help build build-dev start start-dev stop stop-dev restart restart-dev logs logs-dev \
        status download-uploads upload-to-volume backup-uploads restore-uploads \
        backup-logs restore-logs clean-backups clean-downloads init-project

# Default target
help:
	@echo "Astronautics Club Website Makefile"
	@echo ""
	@echo "Production Commands:"
	@echo "  make build           - Build production Docker images"
	@echo "  make start           - Start production containers"
	@echo "  make stop            - Stop production containers"
	@echo "  make restart         - Restart production containers"
	@echo "  make logs            - Show logs from production containers"
	@echo "  make status          - Show status of Docker containers"
	@echo ""
	@echo "Development Commands:"
	@echo "  make build-dev       - Build development Docker images"
	@echo "  make start-dev       - Start development containers"
	@echo "  make stop-dev        - Stop development containers"
	@echo "  make restart-dev     - Restart development containers"
	@echo "  make logs-dev        - Show logs from development containers"
	@echo ""
	@echo "Data Management Commands:"
	@echo "  make download-uploads               - Download all uploads as a ZIP file"
	@echo "  make upload-to-volume SOURCE=path   - Upload files to uploads volume"
	@echo "  make backup-uploads                 - Backup uploads volume to ZIP file"
	@echo "  make restore-uploads FILE=path      - Restore uploads from backup file"
	@echo "  make backup-logs                    - Backup logs volume to ZIP file"
	@echo "  make restore-logs FILE=path         - Restore logs from backup file"
	@echo ""
	@echo "Maintenance Commands:"
	@echo "  make clean-backups    - Remove all backup files"
	@echo "  make clean-downloads  - Remove all downloaded files"
	@echo "  make init-project     - Initialize project directories"

# Production commands
build:
	@echo "Building production containers..."
	docker-compose build

start:
	@echo "Starting production containers..."
	docker-compose up -d
	@echo "Production environment started at http://localhost"

stop:
	@echo "Stopping production containers..."
	docker-compose down

restart: stop start

logs:
	@echo "Showing logs from production containers..."
	docker-compose logs -f

# Development commands
build-dev:
	@echo "Building development containers..."
	docker-compose -f docker-compose.dev.yml build

start-dev:
	@echo "Starting development containers..."
	docker-compose -f docker-compose.dev.yml up -d
	@echo "Development environment started at http://localhost:3000"

stop-dev:
	@echo "Stopping development containers..."
	docker-compose -f docker-compose.dev.yml down

restart-dev: stop-dev start-dev

logs-dev:
	@echo "Showing logs from development containers..."
	docker-compose -f docker-compose.dev.yml logs -f

# Container status
status:
	@echo "Container status:"
	docker ps -a | grep astronautics

# Data management commands
download-uploads:
	@echo "Downloading uploads as ZIP file..."
	./scripts/download-uploads.sh

upload-to-volume:
	@if [ -z "$(SOURCE)" ]; then \
		echo "Error: SOURCE parameter is required."; \
		echo "Usage: make upload-to-volume SOURCE=path/to/files"; \
		exit 1; \
	fi
	@echo "Uploading files to uploads volume..."
	./scripts/upload-to-volume.sh "$(SOURCE)"

backup-uploads:
	@echo "Backing up uploads volume..."
	./scripts/backup-uploads.sh

restore-uploads:
	@if [ -z "$(FILE)" ]; then \
		echo "Error: FILE parameter is required."; \
		echo "Usage: make restore-uploads FILE=path/to/backup.zip"; \
		exit 1; \
	fi
	@echo "Restoring uploads from backup file..."
	./scripts/restore-uploads.sh "$(FILE)"

backup-logs:
	@echo "Backing up logs volume..."
	./scripts/backup-logs.sh

# Maintenance commands
clean-backups:
	@echo "Removing all backup files..."
	rm -rf ./backups/*.zip

clean-downloads:
	@echo "Removing all downloaded files..."
	rm -rf ./downloads/*.zip

# Initialize project directories
init-project:
	@echo "Initializing project directories..."
	mkdir -p ./backups ./downloads ./logs ./public/uploads
	@echo "Done!"

# Create script for restoring logs if it doesn't exist
restore-logs-script:
	@if [ ! -f ./scripts/restore-logs.sh ]; then \
		echo "Creating restore-logs.sh script..."; \
		cat > ./scripts/restore-logs.sh <<-'EOL'; \
		#!/bin/bash \
		# Script to restore logs from a backup zip file \
		\
		if [ -z "$$1" ]; then \
		  echo "Error: Backup file path is required." \
		  echo "Usage: $$0 <backup_file_path>" \
		  exit 1 \
		fi \
		\
		BACKUP_FILE="$$1" \
		LOGS_VOLUME="logs_data" \
		TEMP_DIR="/tmp/logs_restore_$$(date +%Y%m%d_%H%M%S)" \
		\
		# Check if backup file exists \
		if [ ! -f "$$BACKUP_FILE" ]; then \
		  echo "Error: Backup file does not exist: $$BACKUP_FILE" \
		  exit 1 \
		fi \
		\
		# Create temporary directory \
		mkdir -p "$$TEMP_DIR" \
		\
		echo "Restoring logs from $$BACKUP_FILE..." \
		\
		# Extract zip archive to temporary directory \
		unzip -q "$$BACKUP_FILE" -d "$$TEMP_DIR" \
		\
		# Copy files to Docker volume \
		docker run --rm -v "$$LOGS_VOLUME:/data" -v "$$TEMP_DIR:/backup" alpine sh -c "rm -rf /data/* && cp -R /backup/* /data/ 2>/dev/null || true" \
		\
		# Clean up \
		rm -rf "$$TEMP_DIR" \
		\
		echo "Logs restored successfully." \
		\
		# Log the restore action \
		./scripts/log-action.sh "Logs restored" "From backup: $$BACKUP_FILE" \
		EOL \
		chmod +x ./scripts/restore-logs.sh; \
		echo "Created restore-logs.sh script."; \
	else \
		echo "restore-logs.sh script already exists."; \
	fi

restore-logs: restore-logs-script
	@if [ -z "$(FILE)" ]; then \
		echo "Error: FILE parameter is required."; \
		echo "Usage: make restore-logs FILE=path/to/backup.zip"; \
		exit 1; \
	fi
	@echo "Restoring logs from backup file..."
	./scripts/restore-logs.sh "$(FILE)"
