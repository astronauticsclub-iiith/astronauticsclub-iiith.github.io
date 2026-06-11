# Astronautics Club Website Makefile
# This Makefile provides commands for Docker management, development, and maintenance tasks.
# For Bare-Metal NGINX Deployment (No Docker)

SERVER_PATH=/var/data/astronautics
BACKUP_PATH=/var/data/astronautics-backup
AVATARS_UPLOAD_PATH=$(SERVER_PATH)/avatars
BLOG_IMAGES_UPLOAD_PATH=$(SERVER_PATH)/blogs
GALLERY_UPLOAD_PATH=$(SERVER_PATH)/gallery
LOGS_PATH=$(SERVER_PATH)/logs
LOCAL_BACKUP_DIR=$(abspath ./backups)
LOCAL_UPLOADS_BACKUP_DIR=$(abspath ./backups/uploads)
LOCAL_LOGS_BACKUP_DIR=$(abspath ./backups/logs)

.PHONY: help build build-dev deploy start stop restart status logs \
        backup-uploads restore-uploads backup-logs restore-logs \
        backup-cron clean-backups init-backup rebuild

help:
	@echo "Astronautics Club Website Makefile"
	@echo ""
	@echo "Core Commands:"
	@echo "  make build                 - Build development files (Next.js build)"
	@echo "  make build-production      - Build for production"
	@echo "  make deploy                - Deploy build to server"
	@echo "  make restart               - Restart pm2, NGINX service"
	@echo "  make status                - Check pm2, NGINX service status"
	@echo ""
	@echo "Backup & Restore:"
	@echo "  make backup-uploads                               - Backup uploads from server"
	@echo "  make restore-uploads FILE=path/to/zip  - Restore uploads to server"
	@echo "  make backup-logs                                     - Backup logs from server"
	@echo "  make restore-logs FILE=path/to/zip         - Restore logs to server"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean-backups         - Delete local backup files"
	@echo "  make init-backup          - Setup local folders for backup"
	@echo "  make rebuild               - Clean and redeploy from scratch"


# === BUILD ===
build-dev:
	@echo "Building frontend for development..."
# 	@if [ ! -f ".env.local" ]; then \
# 		cp .env.example .env.local \
# 	fi
	npm install
	npx tsx scripts/create-db-tables.ts
	npm run dev
	@echo "Build completed."

build:
	@echo "Building frontend for production..."
# 	@if [ ! -f ".env.local" ]; then \
# 		cp .env.example .env.local \
# 	fi
	npm install
	npm run build
	@echo "Production build completed."

# === DEPLOYMENT ===
deploy:
	@echo "Building the project"
# 	make build-production
#	if	pm2 --version
#	npm install pm2 -g
#	fi
	@echo "Deploying via pm2"
	pm2 restart astronautics || pm2 start ecosystem.config.cjs
	pm2 save
	@echo "Deployment completed"

# === SERVICE MANAGEMENT ===
start:
	@echo "Starting NGINX, pm2"
	sudo systemctl start nginx
	pm2 restart astronautics || pm2 start ecosystem.config.cjs
	pm2 save
	@echo "Started NGINX, pm2 successfully"

stop:
	@echo "Stopping NGINX, pm2"
	sudo systemctl stop nginx
	pm2 stop astronautics
	@echo "Stopped NGINX, pm2"

logs:
	@echo "Showing logs from NGINX, pm2"
	cat /var/log/nginx/access.log
	cat /var/log/nginx/error.log
	pm2 logs astronautics

restart:
	@echo "Restarting NGINX, pm2"
	sudo systemctl restart nginx
	pm2 restart astronautics

status:
	@echo "pm2, NGINX status"
	pm2 status astronautics

# === BACKUPS ===
backup-uploads:
	@echo "Backing up uploads from server..."
	mkdir -p $(LOCAL_UPLOADS_BACKUP_DIR)
	cd $(SERVER_PATH) && zip -r $(LOCAL_UPLOADS_BACKUP_DIR)/uploads_$$(date +%Y%m%d_%H%M%S).zip .
	@echo "Uploads backed up successfully."
	
restore-uploads:
	@if [ -z "$(FILE)" ]; then \
		echo "Error: FILE parameter is required."; \
		echo "Usage: make restore-uploads FILE=path/to/backup.zip"; \
		exit 1; \
	fi
	@echo "Restoring uploads to server..."
	unzip -o "$(FILE)" -d $(SERVER_PATH)
	@echo "Uploads restored successfully."

backup-logs:
	@echo "Backing up logs..."
	mkdir -p $(LOCAL_LOGS_BACKUP_DIR)
	cd $(LOGS_PATH) && zip -r $(LOCAL_LOGS_BACKUP_DIR)/logs_$$(date +%Y%m%d_%H%M%S).zip .
	@echo "Logs backed up successfully."


#Schedules `scripts/backup-job.sh` to run at 3 AM on the 1st and 16th
#of each month under the invoking user's crontab. Re-running this won't create duplicate cron entries.
backup-cron:
	@mkdir -p logs/cronlogs
	@(crontab -l 2>/dev/null | grep -Fv "# astronautics-backup"; \
	echo "0 3 1,16 * * $(abspath scripts/backup-job.sh) >> $(abspath logs/cronlogs/cron.log) 2>&1 # astronautics-backup") \
	| crontab -
	@echo "Cron job installed."

# FILE is path to where the previous zip was saved
# example: make restore-logs FILE=./backups/logs_20260510_123456.zip
restore-logs:
	@if [ -z "$(FILE)" ]; then \
		echo "Error: FILE parameter is required."; \
		echo "Usage: make restore-logs FILE=path/to/backup.zip"; \
		exit 1; \
	fi 
	@echo "Restoring logs..."
	unzip -o "$(FILE)" -d $(LOGS_PATH)
	@echo "Logs restored successfully."

# === MAINTENANCE ===
clean-backups:
	@echo "Cleaning local backups..."
	rm -rf $(LOCAL_BACKUP_DIR)/*.zip
	@echo "All backups removed."

rebuild:
	@echo "Rebuilding and deploying project..."
	make build
	make deploy