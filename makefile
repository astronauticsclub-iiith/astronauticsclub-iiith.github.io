# Astronautics Club Website Makefile
# This Makefile provides commands for Docker management, development, and maintenance tasks.
# For Bare-Metal NGINX Deployment (No Docker)

SERVER_PATH=/var/data/astronautics
BACKUP_PATH=/var/data/astronautics-backup
AVATARS_UPLOAD_PATH=$(SERVER_PATH)/avatars
BLOG_IMAGES_UPLOAD_PATH=$(SERVER_PATH)/blogs
GALLERY_UPLOAD_PATH=$(SERVER_PATH)/gallery
LOGS_PATH=$(SERVER_PATH)/logs
LOCAL_BACKUP_DIR=./backups

.PHONY: help build deploy start stop restart status \
        backup-uploads restore-uploads backup-logs restore-logs \
        clean-backups clean-downloads init-project rebuild

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
	npm install --omit=dev
	npm run build
	@echo "Production build completed."

# === DEPLOYMENT ===
deploy:
	@echo "Building the project"
	make build-production
#	if	pm2 --version
#	npm install pm2 -g
#	fi
	@echo "Deploying via pm2"
	pm2 restart astronautics || pm2 start ecosystem.config.js
	pm2 save
	@echo "Deployment completed"

# === SERVICE MANAGEMENT ===
start:
	@echo "Starting NGINX, pm2"
	sudo systemctl start nginx
	pm2 restart astronautics || pm2 start ecosystem.config.js
	pm2 save
	@echo "Started NGINX, pm2 successfully"

stop:
	@echo "Stopping NGINX, pm2"
	sudo systemctl stop nginx
	pm2 stop astronautics
	@echo "Stopped NGINX, pm2"

restart: stop start

logs:
	@echo "Showing logs from NGINX, pm2"
	cat /var/log/nginx/access.log
	cat /var/log/nginx/error.log
	pm2 logs astronautics

restart:
	@echo "Restarting NGINX, pm2"
	ssh $(SERVER_USER)@$(SERVER_HOST) 'sudo systemctl restart nginx'
	pm2 restart astronautics

status:
	@echo "pm2, NGINX status"
	pm2 status astronautics

# === BACKUPS ===
backup-uploads:
	@echo "Backing up uploads from server..."
	mkdir -p $(LOCAL_BACKUP_DIR)
	ssh $(SERVER_USER)@$(SERVER_HOST) "cd $(UPLOADS_PATH) && zip -r /tmp/uploads_backup.zip ."
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

init-backup:
	@echo "Initializing local directories..."
	mkdir -p $(LOCAL_BACKUP_DIR) $(LOCAL_UPLOADS_DIR) $(LOCAL_LOGS_DIR)
	@echo "Done."

rebuild:
	@echo "Rebuilding and deploying project..."
	make build
	make deploy