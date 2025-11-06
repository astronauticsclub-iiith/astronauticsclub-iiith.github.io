# Astronautics Club Website Makefile
# For Bare-Metal NGINX Deployment (No Docker)

SERVER_USER=ubuntu
SERVER_HOST=iiit.example.edu
SERVER_PATH=/var/www/astronautics-club
BACKUP_PATH=/var/backups/astronautics-club
UPLOADS_PATH=$(SERVER_PATH)/public/uploads
LOGS_PATH=$(SERVER_PATH)/logs
LOCAL_BACKUP_DIR=./backups
LOCAL_UPLOADS_DIR=./public/uploads
LOCAL_LOGS_DIR=./logs

.PHONY: help build deploy start stop restart status \
        backup-uploads restore-uploads backup-logs restore-logs \
        clean-backups clean-downloads init-project rebuild

help:
	@echo "Astronautics Club Website Makefile"
	@echo ""
	@echo "Core Commands:"
	@echo "  make build                 - Build production files (e.g., Next.js/Vite build)"
	@echo "  make deploy                - Deploy build to server"
	@echo "  make restart               - Restart NGINX service"
	@echo "  make status                - Check NGINX service status"
	@echo ""
	@echo "Backup & Restore:"
	@echo "  make backup-uploads        - Backup uploads from server"
	@echo "  make restore-uploads FILE=path/to/zip - Restore uploads to server"
	@echo "  make backup-logs           - Backup logs from server"
	@echo "  make restore-logs FILE=path/to/zip    - Restore logs to server"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean-backups         - Delete local backup files"
	@echo "  make init-project          - Setup local folders"
	@echo "  make rebuild               - Clean and redeploy from scratch"

# === BUILD ===
build:
	@echo "Building frontend for production..."
	npm run build
	@echo "Build completed."

# === DEPLOYMENT ===
deploy:
	@echo "Deploying to server $(SERVER_HOST)..."
	rsync -avz --delete --exclude 'node_modules' --exclude '.git' ./ $(SERVER_USER)@$(SERVER_HOST):$(SERVER_PATH)
	@echo "Restarting NGINX..."
	ssh $(SERVER_USER)@$(SERVER_HOST) 'sudo systemctl restart nginx'
	@echo "Deployment complete! Visit http://$(SERVER_HOST)"

# === SERVICE MANAGEMENT ===
start:
	@echo "Starting NGINX..."
	ssh $(SERVER_USER)@$(SERVER_HOST) 'sudo systemctl start nginx'

stop:
	@echo "Stopping NGINX..."
	ssh $(SERVER_USER)@$(SERVER_HOST) 'sudo systemctl stop nginx'

restart:
	@echo "Restarting NGINX..."
	ssh $(SERVER_USER)@$(SERVER_HOST) 'sudo systemctl restart nginx'

status:
	ssh $(SERVER_USER)@$(SERVER_HOST) 'sudo systemctl status nginx'

# === BACKUPS ===
backup-uploads:
	@echo "Backing up uploads from server..."
	mkdir -p $(LOCAL_BACKUP_DIR)
	ssh $(SERVER_USER)@$(SERVER_HOST) "cd $(UPLOADS_PATH) && zip -r /tmp/uploads_backup.zip ."
	scp $(SERVER_USER)@$(SERVER_HOST):/tmp/uploads_backup.zip $(LOCAL_BACKUP_DIR)/uploads_$$(date +%Y%m%d_%H%M%S).zip
	ssh $(SERVER_USER)@$(SERVER_HOST) "rm /tmp/uploads_backup.zip"
	@echo "Uploads backed up successfully."

restore-uploads:
	@if [ -z "$(FILE)" ]; then \
		echo "Error: FILE parameter is required."; \
		echo "Usage: make restore-uploads FILE=path/to/backup.zip"; \
		exit 1; \
	fi
	@echo "Restoring uploads to server..."
	scp "$(FILE)" $(SERVER_USER)@$(SERVER_HOST):/tmp/uploads_restore.zip
	ssh $(SERVER_USER)@$(SERVER_HOST) "sudo unzip -o /tmp/uploads_restore.zip -d $(UPLOADS_PATH) && rm /tmp/uploads_restore.zip"
	@echo "Uploads restored successfully."

backup-logs:
	@echo "Backing up logs from server..."
	mkdir -p $(LOCAL_BACKUP_DIR)
	ssh $(SERVER_USER)@$(SERVER_HOST) "cd $(LOGS_PATH) && zip -r /tmp/logs_backup.zip ."
	scp $(SERVER_USER)@$(SERVER_HOST):/tmp/logs_backup.zip $(LOCAL_BACKUP_DIR)/logs_$$(date +%Y%m%d_%H%M%S).zip
	ssh $(SERVER_USER)@$(SERVER_HOST) "rm /tmp/logs_backup.zip"
	@echo "Logs backed up successfully."

restore-logs:
	@if [ -z "$(FILE)" ]; then \
		echo "Error: FILE parameter is required."; \
		echo "Usage: make restore-logs FILE=path/to/backup.zip"; \
		exit 1; \
	fi
	@echo "Restoring logs to server..."
	scp "$(FILE)" $(SERVER_USER)@$(SERVER_HOST):/tmp/logs_restore.zip
	ssh $(SERVER_USER)@$(SERVER_HOST) "sudo unzip -o /tmp/logs_restore.zip -d $(LOGS_PATH) && rm /tmp/logs_restore.zip"
	@echo "Logs restored successfully."

# === MAINTENANCE ===
clean-backups:
	@echo "Cleaning local backups..."
	rm -rf $(LOCAL_BACKUP_DIR)/*.zip
	@echo "All backups removed."

init-project:
	@echo "Initializing local directories..."
	mkdir -p $(LOCAL_BACKUP_DIR) $(LOCAL_UPLOADS_DIR) $(LOCAL_LOGS_DIR)
	@echo "Done."

rebuild:
	@echo "Rebuilding and deploying project..."
	make build
	make deploy
