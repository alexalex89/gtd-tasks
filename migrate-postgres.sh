#!/bin/bash

# PostgreSQL 15 to 16 Migration Script
# This script performs an in-place upgrade using pg_upgrade

set -e  # Exit on any error

echo "🔄 Starting PostgreSQL 15 → 16 Migration..."

# Configuration
COMPOSE_FILE="docker-compose.yml"
DB_VOLUME="/mnt/user/docker/gtd-taskapp/db"
BACKUP_DIR="/mnt/user/docker/gtd-taskapp/backup-$(date +%Y%m%d_%H%M%S)"
POSTGRES_USER="gtd_user"
POSTGRES_DB="gtd_tasks"

# Step 1: Create backup directory
echo "📂 Creating backup directory..."
mkdir -p "$BACKUP_DIR"

# Step 2: Stop all services
echo "🛑 Stopping services..."
docker-compose down

# Step 3: Backup current data
echo "💾 Creating backup of current database..."
cp -r "$DB_VOLUME" "$BACKUP_DIR/db_backup"

# Step 4: Start PostgreSQL 15 temporarily for dump
echo "📤 Creating SQL dump from PostgreSQL 15..."
docker run --rm \
  -v "$DB_VOLUME:/var/lib/postgresql/data" \
  -v "$BACKUP_DIR:/backup" \
  postgres:15-alpine \
  sh -c "
    # Start PostgreSQL 15
    docker-entrypoint.sh postgres &
    PG_PID=\$!
    
    # Wait for PostgreSQL to be ready
    until pg_isready -U $POSTGRES_USER -d $POSTGRES_DB; do
      echo 'Waiting for PostgreSQL 15 to be ready...'
      sleep 2
    done
    
    # Create dump
    pg_dump -U $POSTGRES_USER -h localhost $POSTGRES_DB > /backup/dump.sql
    
    # Stop PostgreSQL
    kill \$PG_PID
    wait \$PG_PID
  "

# Step 5: Clear data directory for PostgreSQL 16
echo "🗑️ Clearing data directory for PostgreSQL 16..."
rm -rf "$DB_VOLUME"/*

# Step 6: Update docker-compose.yml to PostgreSQL 16
echo "📝 Updating docker-compose.yml to PostgreSQL 16..."
sed -i 's/postgres:15-alpine/postgres:16-alpine/g' "$COMPOSE_FILE"

# Step 7: Start PostgreSQL 16 and restore data
echo "🔄 Starting PostgreSQL 16 and restoring data..."
docker-compose up -d gtd-postgres

# Wait for PostgreSQL 16 to be ready
echo "⏳ Waiting for PostgreSQL 16 to initialize..."
until docker exec gtd-postgres pg_isready -U $POSTGRES_USER -d $POSTGRES_DB 2>/dev/null; do
  echo "Waiting for PostgreSQL 16 to be ready..."
  sleep 3
done

# Step 8: Restore data to PostgreSQL 16
echo "📥 Restoring data to PostgreSQL 16..."
docker exec -i gtd-postgres psql -U $POSTGRES_USER $POSTGRES_DB < "$BACKUP_DIR/dump.sql"

# Step 9: Start all services
echo "🚀 Starting all services..."
docker-compose up -d

# Step 10: Verify migration
echo "🔍 Verifying migration..."
sleep 5
if docker exec gtd-postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT version();" > /dev/null 2>&1; then
  echo "✅ Migration successful!"
  echo "📊 PostgreSQL version:"
  docker exec gtd-postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT version();"
  
  echo ""
  echo "📋 Database tables:"
  docker exec gtd-postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -c "\dt"
  
  echo ""
  echo "🎉 Migration completed successfully!"
  echo "💾 Backup stored in: $BACKUP_DIR"
  echo "🗑️ You can remove the backup after verifying everything works: rm -rf $BACKUP_DIR"
else
  echo "❌ Migration failed! Restoring from backup..."
  docker-compose down
  rm -rf "$DB_VOLUME"/*
  cp -r "$BACKUP_DIR/db_backup/"* "$DB_VOLUME/"
  sed -i 's/postgres:16-alpine/postgres:15-alpine/g' "$COMPOSE_FILE"
  docker-compose up -d
  echo "🔙 Restored to PostgreSQL 15. Check logs for errors."
  exit 1
fi