# Astronautics Club Website

This is a [Next.js](https://nextjs.org) project for the Astronautics Club website, containerized with Docker and Nginx.

## Features

- Next.js frontend and backend
- Nginx as a reverse proxy
- Persistent storage for uploaded media files
- Environment-based configuration

## Getting Started (Docker)

### Prerequisites

- Docker and Docker Compose installed on your system
- `.env.local` file in the root directory with required environment variables:
  ```
  MONGODB_URI=your_mongodb_connection_string
  NEXTAUTH_SECRET=your_nextauth_secret
  NEXTAUTH_URL=http://localhost
  FILE_DIRECTORY=/app/public
  # Add other required environment variables
  ```

### Setup and Running

1. Navigate to the Docker-deployment directory:

   ```bash
   cd Docker-deployment
   ```

2. Build and start the containers:

   ```bash
   docker-compose up -d
   ```

   Or use the provided Makefile:

   ```bash
   make start
   ```

3. Access the application:
   - Website: [http://localhost](http://localhost)
   - API endpoints: [http://localhost/api/...](http://localhost/api/)

### Testing the Deployment

After starting the containers, verify the deployment:

```bash
# Check if containers are running
docker ps

# View logs
docker-compose logs -f

# Test the application
curl http://localhost
```

### Troubleshooting

- If the Next.js container fails to start, check logs: `docker-compose logs nextjs`
- Ensure `.env.local` file exists in the root directory
- Verify MongoDB connection string is correct
- Make sure ports 80 and 443 are not already in use

### Data Persistence

All uploaded files are stored in a Docker volume (`uploads_data`), ensuring that:

- Files persist between container restarts
- Files are not lost during application updates
- Both Next.js and Nginx can access the uploaded files

Logs are also stored in a Docker volume (`logs_data`) for persistence.

### Using the Makefile

The project includes a Makefile for easier management of Docker containers and data operations:

```bash
# Show all available commands
make help

# Production commands
make build       # Build production containers
make start       # Start production environment
make stop        # Stop production environment
make logs        # View production logs

# Development commands
make build-dev   # Build development containers
make start-dev   # Start development environment
make stop-dev    # Stop development environment
make logs-dev    # View development logs

# Data management
make download-uploads                  # Download uploads as ZIP
make upload-to-volume SOURCE=./files   # Upload files to volume
make backup-uploads                    # Backup uploads volume
make restore-uploads FILE=path/to.zip  # Restore uploads from backup
make backup-logs                       # Backup logs volume
make restore-logs FILE=path/to.zip     # Restore logs from backup
```

## Development (Without Docker)

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## File Upload API

The application includes an API for file uploads with the following endpoints:

- `POST /api/upload`: Upload a new file

  - Expected form data: `file` (the file to upload)
  - Returns: JSON with file details and URL

- `GET /api/upload`: List all uploaded files

  - Returns: JSON with array of file details

- `GET /api/upload?filename=example.jpg`: Get details of a specific file
  - Returns: JSON with file details

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
