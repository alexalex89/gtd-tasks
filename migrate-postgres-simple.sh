#!/bin/bash

# Simple PostgreSQL 15 to 16 Migration using dump/restore
# This is safer and more reliable than pg_upgrade

set -e  # Exit on any error

echo "🔄 Simple PostgreSQL 15 → 16 Migration..."

# Configuration
BACKUP_FILE="gtd_backup_$(date +%Y%m%d_%H%M%S).sql"
POSTGRES_USER="gtd_user"
POSTGRES_DB="gtd_tasks"
POSTGRES_PASSWORD="gtd_password"

# Step 1: Create backup from PostgreSQL 15
echo "💾 Creating backup from PostgreSQL 15..."
docker exec gtd-postgres pg_dump -U $POSTGRES_USER $POSTGRES_DB > "$BACKUP_FILE"

if [ ! -s "$BACKUP_FILE" ]; then
  echo "❌ Backup failed or is empty!"
  exit 1
fi

echo "✅ Backup created: $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))"

# Step 2: Stop all services
echo "🛑 Stopping services..."
docker-compose down

# Step 3: Update docker-compose.yml to PostgreSQL 16
echo "📝 Updating to PostgreSQL 16..."
cp docker-compose.yml docker-compose.yml.backup
sed -i 's/postgres:15-alpine/postgres:16-alpine/g' docker-compose.yml

# Step 4: Remove old database data
echo "🗑️ Removing old database data..."
sudo rm -rf /mnt/user/docker/gtd-taskapp/db/*

# Step 5: Start PostgreSQL 16
echo "🚀 Starting PostgreSQL 16..."
docker-compose up -d gtd-postgres

# Step 6: Wait for PostgreSQL 16 to be ready
echo "⏳ Waiting for PostgreSQL 16 to initialize..."
for i in {1..60}; do
  if docker exec gtd-postgres pg_isready -U $POSTGRES_USER -d $POSTGRES_DB 2>/dev/null; then
    echo "✅ PostgreSQL 16 is ready!"
    break
  fi
  echo "Waiting... ($i/60)"
  sleep 2
done

# Step 7: Restore data
echo "📥 Restoring data to PostgreSQL 16..."
docker exec -i gtd-postgres psql -U $POSTGRES_USER $POSTGRES_DB < "$BACKUP_FILE"

# Step 8: Start all services
echo "🚀 Starting all services..."
docker-compose up -d

# Step 9: Verify migration
echo "🔍 Verifying migration..."
sleep 3

# Test database connection and version
VERSION=$(docker exec gtd-postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -t -c "SELECT version();" | head -1)
TABLE_COUNT=$(docker exec gtd-postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')

if [[ "$VERSION" == *"PostgreSQL 16"* ]]; then
  echo "✅ Migration successful!"
  echo "📊 Version: $(echo $VERSION | xargs)"
  echo "📋 Tables found: $TABLE_COUNT"
  echo "💾 Backup file: $BACKUP_FILE"
  echo ""
  echo "🎉 You can now remove the backup file if everything works:"
  echo "   rm $BACKUP_FILE docker-compose.yml.backup"
else
  echo "❌ Migration verification failed!"
  echo "🔙 Rolling back to PostgreSQL 15..."
  docker-compose down
  cp docker-compose.yml.backup docker-compose.yml
  sudo rm -rf /mnt/user/docker/gtd-taskapp/db/*
  docker-compose up -d gtd-postgres
  
  # Wait and restore
  sleep 10
  docker exec -i gtd-postgres psql -U $POSTGRES_USER $POSTGRES_DB < "$BACKUP_FILE"
  docker-compose up -d
  echo "🔙 Restored to PostgreSQL 15"
  exit 1
fi