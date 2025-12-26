# Astronautics Club Website Makefile
# This Makefile provides commands for development, production deployment, and maintenance.
# Designed to run on the production server with pm2 process management.

SERVER_PATH=/var/data/astronautics
BACKUP_PATH=/var/data/astronautics-backup
AVATARS_UPLOAD_PATH=$(SERVER_PATH)/avatars
BLOG_IMAGES_UPLOAD_PATH=$(SERVER_PATH)/blogs
GALLERY_UPLOAD_PATH=$(SERVER_PATH)/gallery
LOGS_PATH=$(SERVER_PATH)/logs
LOCAL_BACKUP_DIR=./backups
PM2_APP_NAME=astronautics

.PHONY: help dev build deploy start stop restart status logs \
        backup-uploads restore-uploads backup-logs restore-logs \
        clean-backups init-backup rebuild

help:
	@echo "Astronautics Club Website Makefile"
	@echo ""
	@echo "Development:"
	@echo "  make dev                   - Start development server"
	@echo "  make build                 - Build for production"
	@echo ""
	@echo "Production Deployment (run on server):"
	@echo "  make deploy                - Build and deploy with pm2"
	@echo "  make start                 - Start pm2 application"
	@echo "  make stop                  - Stop pm2 application"
	@echo "  make restart               - Restart pm2 application"
	@echo "  make status                - Check pm2 status"
	@echo "  make logs                  - View pm2 logs"
	@echo ""
	@echo "Backup & Restore (run on server):"
	@echo "  make backup-uploads        - Backup uploads directory"
	@echo "  make restore-uploads FILE=path/to/zip - Restore uploads"
	@echo "  make backup-logs           - Backup logs directory"
	@echo "  make restore-logs FILE=path/to/zip    - Restore logs"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean-backups         - Delete local backup files"
	@echo "  make init-backup           - Create backup directories"
	@echo "  make rebuild               - Clean rebuild and deploy"


# === DEVELOPMENT ===
dev:
	@echo "Starting development server..."
	@if [ ! -f ".env.local" ]; then \
		echo "Warning: .env.local not found. Copy from .env.example if needed."; \
	fi
	npm install
	npx tsx scripts/create-db-tables.ts
	npm run dev

# === BUILD ===
build:
	@echo "Building for production..."
	@if [ ! -f ".env.local" ]; then \
		echo "Warning: .env.local not found. Copy from .env.example if needed."; \
	fi
	npm install --omit=dev
	npx tsx scripts/create-db-tables.ts
	npm run build
	@echo "Production build completed."

# === DEPLOYMENT ===
deploy:
	@echo "Deploying application with pm2..."
	@$(MAKE) build
	@echo "Starting/restarting pm2 process..."
	@if ! command -v pm2 > /dev/null; then \
		echo "Error: pm2 not found. Install with: npm install -g pm2"; \
		exit 1; \
	fi
	pm2 restart $(PM2_APP_NAME) || pm2 start ecosystem.config.js --name $(PM2_APP_NAME)
	pm2 save
	@echo "Deployment completed successfully."


# === SERVICE MANAGEMENT ===
start:
	@echo "Starting pm2 application..."
	@if ! command -v pm2 > /dev/null; then \
		echo "Error: pm2 not found. Install with: npm install -g pm2"; \
		exit 1; \
	fi
	pm2 start ecosystem.config.js --name $(PM2_APP_NAME) || pm2 restart $(PM2_APP_NAME)
	pm2 save
	@echo "Application started successfully."

stop:
	@echo "Stopping pm2 application..."
	pm2 stop $(PM2_APP_NAME)
	@echo "Application stopped."

restart:
	@echo "Restarting pm2 application..."
	pm2 restart $(PM2_APP_NAME)
	@echo "Application restarted successfully."

status:
	@echo "Checking pm2 status..."
	pm2 status $(PM2_APP_NAME)

logs:
	@echo "Showing pm2 logs (Ctrl+C to exit)..."
	pm2 logs $(PM2_APP_NAME)


# === BACKUPS ===
backup-uploads:
	@echo "Backing up uploads..."
	@mkdir -p $(LOCAL_BACKUP_DIR)
	@cd $(SERVER_PATH) && tar -czf $(LOCAL_BACKUP_DIR)/uploads_$$(date +%Y%m%d_%H%M%S).tar.gz \
		avatars blogs gallery 2>/dev/null || echo "Some upload directories may not exist"
	@echo "Uploads backed up successfully to $(LOCAL_BACKUP_DIR)"

restore-uploads:
	@if [ -z "$(FILE)" ]; then \
		echo "Error: FILE parameter is required."; \
		echo "Usage: make restore-uploads FILE=path/to/backup.tar.gz"; \
		exit 1; \
	fi
	@echo "Restoring uploads from $(FILE)..."
	@tar -xzf "$(FILE)" -C $(SERVER_PATH)
	@echo "Uploads restored successfully."

backup-logs:
	@echo "Backing up logs..."
	@mkdir -p $(LOCAL_BACKUP_DIR)
	@if [ -d "$(LOGS_PATH)" ]; then \
		cd $(LOGS_PATH) && tar -czf $(LOCAL_BACKUP_DIR)/logs_$$(date +%Y%m%d_%H%M%S).tar.gz .; \
	else \
		echo "Warning: Logs directory $(LOGS_PATH) not found."; \
	fi
	@echo "Logs backed up successfully to $(LOCAL_BACKUP_DIR)"

restore-logs:
	@if [ -z "$(FILE)" ]; then \
		echo "Error: FILE parameter is required."; \
		echo "Usage: make restore-logs FILE=path/to/backup.tar.gz"; \
		exit 1; \
	fi
	@echo "Restoring logs from $(FILE)..."
	@mkdir -p $(LOGS_PATH)
	@tar -xzf "$(FILE)" -C $(LOGS_PATH)
	@echo "Logs restored successfully."


# === MAINTENANCE ===
clean-backups:
	@echo "Cleaning local backups..."
	@rm -f $(LOCAL_BACKUP_DIR)/*.tar.gz $(LOCAL_BACKUP_DIR)/*.zip
	@echo "All backups removed."

init-backup:
	@echo "Initializing backup directory..."
	@mkdir -p $(LOCAL_BACKUP_DIR)
	@echo "Backup directory created at $(LOCAL_BACKUP_DIR)"

rebuild:
	@echo "Rebuilding and redeploying application..."
	@$(MAKE) stop || true
	@$(MAKE) build
	@$(MAKE) start
	@echo "Rebuild and deployment completed."