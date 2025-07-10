#!/bin/bash

# One-liner PostgreSQL migration (run this on your server)
# This creates a backup, upgrades, and restores automatically

BACKUP="gtd_backup_$(date +%Y%m%d_%H%M%S).sql" && \
echo "Creating backup..." && \
docker exec gtd-postgres pg_dump -U gtd_user gtd_tasks > "$BACKUP" && \
echo "Stopping services..." && \
docker-compose down && \
echo "Updating to PostgreSQL 16..." && \
sed -i 's/postgres:15-alpine/postgres:16-alpine/g' docker-compose.yml && \
echo "Clearing old data..." && \
sudo rm -rf /mnt/user/docker/gtd-taskapp/db/* && \
echo "Starting PostgreSQL 16..." && \
docker-compose up -d gtd-postgres && \
echo "Waiting for database..." && \
sleep 15 && \
echo "Restoring data..." && \
docker exec -i gtd-postgres psql -U gtd_user gtd_tasks < "$BACKUP" && \
echo "Starting all services..." && \
docker-compose up -d && \
echo "✅ Migration complete! Backup: $BACKUP"