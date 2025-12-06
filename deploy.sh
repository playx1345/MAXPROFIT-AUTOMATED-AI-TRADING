#!/bin/bash

# MAXPROFIT AI Trading Platform - Deployment Helper Script
# This script helps automate the deployment process

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "\n${BLUE}==================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}==================================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Main script
print_header "MAXPROFIT AI Trading Platform - Deployment Helper"

# Check Node.js
print_info "Checking prerequisites..."
if command_exists node; then
    NODE_VERSION=$(node -v)
    print_success "Node.js is installed: $NODE_VERSION"
else
    print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm -v)
    print_success "npm is installed: $NPM_VERSION"
else
    print_error "npm is not installed. Please install npm."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found!"
    echo -e "${YELLOW}Creating .env from .env.example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        print_success "Created .env file. Please edit it with your Supabase credentials."
        print_info "Required variables:"
        echo "  - VITE_SUPABASE_URL"
        echo "  - VITE_SUPABASE_PUBLISHABLE_KEY"
        echo "  - VITE_SUPABASE_PROJECT_ID"
        echo ""
        read -p "Press Enter to continue after updating .env file..."
    else
        print_error ".env.example not found. Please create .env manually."
        exit 1
    fi
else
    print_success ".env file exists"
fi

# Check if Supabase CLI is installed
print_info "Checking Supabase CLI..."
if command_exists supabase; then
    SUPABASE_VERSION=$(supabase --version)
    print_success "Supabase CLI is installed: $SUPABASE_VERSION"
else
    print_warning "Supabase CLI is not installed."
    read -p "Would you like to install it via npm? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm install -g supabase
        print_success "Supabase CLI installed"
    else
        print_info "You can install it later with: npm install -g supabase"
    fi
fi

# Menu
print_header "Deployment Options"
echo "1. Install dependencies"
echo "2. Build application"
echo "3. Deploy Edge Functions (requires Supabase CLI)"
echo "4. Apply database migrations (requires Supabase CLI)"
echo "5. Setup secondary admin user"
echo "6. Run development server"
echo "7. Run full production build"
echo "8. Exit"
echo ""
read -p "Select an option (1-8): " option

case $option in
    1)
        print_header "Installing Dependencies"
        npm install
        print_success "Dependencies installed successfully"
        ;;
    2)
        print_header "Building Application"
        npm run build
        print_success "Build completed successfully"
        print_info "Production build is in the 'dist/' directory"
        ;;
    3)
        print_header "Deploying Edge Functions"
        if ! command_exists supabase; then
            print_error "Supabase CLI is required. Install it first."
            exit 1
        fi
        
        echo "Deploying admin-create-user..."
        supabase functions deploy admin-create-user
        
        echo "Deploying admin-delete-user..."
        supabase functions deploy admin-delete-user
        
        echo "Deploying admin-reset-password..."
        supabase functions deploy admin-reset-password
        
        echo "Deploying admin-suspend-user..."
        supabase functions deploy admin-suspend-user
        
        print_success "All Edge Functions deployed successfully"
        ;;
    4)
        print_header "Applying Database Migrations"
        if ! command_exists supabase; then
            print_error "Supabase CLI is required. Install it first."
            exit 1
        fi
        
        # Check if project is linked
        if [ ! -f .supabase/config.toml ]; then
            print_warning "Project not linked to Supabase."
            read -p "Enter your Supabase project ID: " PROJECT_ID
            supabase link --project-ref "$PROJECT_ID"
        fi
        
        echo "Pushing migrations to database..."
        supabase db push
        print_success "Migrations applied successfully"
        ;;
    5)
        print_header "Setting up Secondary Admin User"
        if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
            print_warning "SUPABASE_SERVICE_ROLE_KEY not found in environment"
            read -sp "Enter your Supabase Service Role Key: " SERVICE_KEY
            echo
            export SUPABASE_SERVICE_ROLE_KEY="$SERVICE_KEY"
        fi
        
        if [ -z "$ADMIN_PASSWORD" ]; then
            print_warning "ADMIN_PASSWORD not set"
            read -sp "Enter password for admin user: " ADMIN_PASS
            echo
            export ADMIN_PASSWORD="$ADMIN_PASS"
        fi
        
        npm run setup:admin
        print_success "Admin user setup completed"
        ;;
    6)
        print_header "Starting Development Server"
        print_info "Server will start at http://localhost:8080"
        print_warning "Press Ctrl+C to stop the server"
        npm run dev
        ;;
    7)
        print_header "Running Full Production Build"
        
        # Install dependencies
        print_info "Step 1/3: Installing dependencies..."
        npm install
        print_success "Dependencies installed"
        
        # Build
        print_info "Step 2/3: Building application..."
        npm run build
        print_success "Build completed"
        
        # Summary
        print_header "Build Summary"
        print_success "Production build is ready in 'dist/' directory"
        print_info "Next steps:"
        echo "  1. Deploy the 'dist/' folder to your hosting platform"
        echo "  2. Set environment variables on your hosting platform"
        echo "  3. Configure custom domain (optional)"
        echo ""
        print_info "For detailed deployment instructions, see DEPLOYMENT.md"
        ;;
    8)
        print_info "Exiting..."
        exit 0
        ;;
    *)
        print_error "Invalid option selected"
        exit 1
        ;;
esac

print_header "Deployment Helper Completed"
print_info "For more detailed instructions, refer to DEPLOYMENT.md"
