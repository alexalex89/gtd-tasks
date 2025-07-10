# GTD Task Manager - Docker Setup

This guide explains how to run the GTD Task Manager using Docker containers.

## Prerequisites

- Docker and Docker Compose installed
- Git (to clone the repository)

## Quick Start

### 1. Environment Configuration

Before running the application, create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file and update the IP address placeholder:

```env
# Replace XX.XX.XX.XX with your actual server IP address
VITE_API_URL=http://YOUR_SERVER_IP:3742
```

### 2. Production Deployment

For production deployment with Nginx:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 3. Development Mode

For development with hot reload:

```bash
# Use the development compose file
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

## Service Details

### Services

1. **gtd-postgres** - PostgreSQL database (port 5432)
2. **gtd-backend** - Node.js API server (port 3742)
3. **gtd-frontend** - React frontend served by Nginx (port 3744)

### Ports

- **Frontend**: http://localhost:3744 (production) or http://localhost:3000 (development)
- **Backend API**: http://localhost:3742
- **Database**: localhost:5432

### Volumes

- **Database**: `/mnt/user/docker/gtd-taskapp/db` (production)
- **Database Dev**: `./docker/data/dev-db` (development)

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BACKEND_PORT` | 3742 | Backend API port |
| `FRONTEND_PORT` | 3000 | Frontend development port |
| `DB_NAME` | gtd_tasks | Database name |
| `DB_USER` | gtd_user | Database username |
| `DB_PASSWORD` | gtd_password | Database password |

### Network Configuration

The application uses a custom Docker network `gtd-network` for inter-service communication.

For external access, update the `VITE_API_URL` in your `.env` file with your server's IP address.

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check which process is using the port
   lsof -i :3742
   
   # Stop the process or change the port in .env
   ```

2. **Database connection issues**
   ```bash
   # Check database health
   docker-compose exec gtd-postgres pg_isready -U gtd_user -d gtd_tasks
   
   # View database logs
   docker-compose logs gtd-postgres
   ```

3. **Frontend can't connect to backend**
   - Verify the `VITE_API_URL` in your `.env` file
   - Check that the backend service is running: `docker-compose ps`

### Useful Commands

```bash
# Rebuild specific service
docker-compose build gtd-backend
docker-compose up -d gtd-backend

# Access container shell
docker-compose exec gtd-backend sh
docker-compose exec gtd-postgres psql -U gtd_user -d gtd_tasks

# View container logs
docker-compose logs -f gtd-backend
docker-compose logs -f gtd-frontend

# Reset database
docker-compose down
docker volume rm gtd-task-manager_postgres_data
docker-compose up -d
```

## Security Notes

- Default passwords are used for demonstration. Change them in production.
- The application runs with `DEBUG=true` by default. Set to `false` in production.
- Consider using Docker secrets for sensitive information in production.
- IP addresses have been anonymized as XX.XX.XX.XX - replace with your actual server IP.

## File Structure

```
.
├── docker-compose.yml          # Production configuration
├── docker-compose.dev.yml      # Development configuration
├── .env                        # Environment variables
├── backend/
│   ├── Dockerfile             # Backend container config
│   └── ...
├── frontend/
│   ├── Dockerfile             # Frontend build container
│   ├── Dockerfile.nginx       # Production Nginx container
│   ├── Dockerfile.dev         # Development container
│   ├── nginx.conf             # Nginx configuration
│   └── ...
└── docker/
    └── data/                  # Local database storage
```