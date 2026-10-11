================================================================================
SUMMERS MEDIA GROUP (SMGPUB) ENTERPRISE PLATFORM - DEPLOYMENT MANUAL
This document outlines the simplified deployment procedure for launching the
entire SMGPUB production stack (PostgreSQL, Express Backend, Next.js Dashboard,
Nginx Reverse Proxy, and the static Beat Storefront).
1. PREREQUISITES & SERVER SETUP
￼ Target OS: Ubuntu 22.04 LTS or 24.04 LTS recommended.
￼ Required Tools: Docker (v24+) and Docker Compose (v2+).
To install Docker on a clean Ubuntu instance:
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
1. CONFIGURATION & ENVIRONMENT SECRETS
1. Clone your repository to the production server directory (e.g., /var/www/smgpub):
git clone https://github.com/your-org/smgpub-enterprise-platform.git /var/www/smgpub-platform
cd /var/www/smgpub-platform
2. Generate your production environment file from the template:
cp .env.example .env
3. Open the file and fill in all mandatory production keys:
nano .env
￼ Set secure POSTGRES_PASSWORD
￼ Set live STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET
￼ Set production URLs (NEXT_PUBLIC_API_URL, NEXT_PUBLIC_APP_URL, etc.)
1. LAUNCHING THE PLATFORM (ONE COMMAND)
Build and start all containerized microservices in detached mode:
docker-compose up --build -d
1. VERIFICATION & MAINTENANCE
￼ Check container health and running status:
docker-compose ps
￼ View real-time logs across all services:
docker-compose logs -f
￼ Perform zero-downtime rolling updates after a code push:
git pull origin main
docker-compose up -d --build --no-deps backend web
