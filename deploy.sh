#!/bin/bash

# Unrestricted RP Auto Review System Deployment Script
# This script deploys the review system to your hosting environment

set -e

echo "🚀 Starting Unrestricted RP Review System Deployment"

# Configuration
REVIEW_SERVER_PORT=3001
WEBSITE_DIR="./Website"
REVIEW_SERVER_DIR="./review-server"
PUBLIC_DIR="./public"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_dependencies() {
    log_info "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    log_info "Dependencies check passed ✓"
}

# Install review server dependencies
install_dependencies() {
    log_info "Installing review server dependencies..."
    
    cd "$REVIEW_SERVER_DIR"
    npm install
    cd ..
    
    log_info "Dependencies installed ✓"
}

# Fetch initial reviews
fetch_initial_reviews() {
    log_info "Fetching initial reviews..."
    
    cd "$REVIEW_SERVER_DIR"
    node fetch-reviews.js
    cd ..
    
    log_info "Initial reviews fetched ✓"
}

# Start review server
start_review_server() {
    log_info "Starting review server..."
    
    cd "$REVIEW_SERVER_DIR"
    
    # Check if PM2 is installed, if not use node directly
    if command -v pm2 &> /dev/null; then
        log_info "Using PM2 to manage review server"
        pm2 start server.js --name "unrestricted-review-server"
        pm2 save
    else
        log_warn "PM2 not found, starting server directly with node"
        nohup node server.js > review-server.log 2>&1 &
        echo $! > review-server.pid
    fi
    
    cd ..
    
    log_info "Review server started on port $REVIEW_SERVER_PORT ✓"
}

# Test the review server
test_review_server() {
    log_info "Testing review server..."
    
    # Wait a moment for server to start
    sleep 3
    
    # Test health endpoint
    if curl -f -s "http://localhost:$REVIEW_SERVER_PORT/api/health" > /dev/null; then
        log_info "Health check passed ✓"
    else
        log_error "Health check failed"
        exit 1
    fi
    
    # Test reviews endpoint
    if curl -f -s "http://localhost:$REVIEW_SERVER_PORT/api/reviews" > /dev/null; then
        log_info "Reviews API test passed ✓"
    else
        log_error "Reviews API test failed"
        exit 1
    fi
    
    log_info "Review server tests passed ✓"
}

# Setup GitHub Actions (optional)
setup_github_actions() {
    log_info "Setting up GitHub Actions..."
    
    if [ -d ".git" ]; then
        log_info "GitHub Actions workflows are already configured"
        log_info "To enable automatic updates, push this code to your GitHub repository"
    else
        log_warn "Not a git repository. GitHub Actions setup skipped."
        log_info "To enable automatic updates, initialize a git repository and push to GitHub"
    fi
}

# Display final instructions
display_instructions() {
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Update the review server URL in Website/reviews-auto-loader.js"
    echo "2. Test the website by opening Website/index.html in a browser"
    echo "3. If using GitHub, push to repository to enable automatic updates"
    echo ""
    echo "🔧 Management commands:"
    echo "  - View logs: tail -f review-server/review-server.log"
    echo "  - Stop server: pkill -f 'node.*server.js' (or pm2 stop unrestricted-review-server)"
    echo "  - Manual refresh: curl -X POST http://localhost:3001/api/reviews/refresh"
    echo ""
    echo "📊 The system will automatically:"
    echo "  - Fetch new reviews every hour"
    echo "  - Cache reviews for 30 minutes"
    echo "  - Fallback to stored reviews if fetch fails"
    echo "  - Update the website automatically"
    echo ""
}

# Main deployment function
main() {
    log_info "Starting deployment process..."
    
    check_dependencies
    install_dependencies
    fetch_initial_reviews
    start_review_server
    test_review_server
    setup_github_actions
    display_instructions
    
    log_info "Deployment completed! 🚀"
}

# Handle script interruption
trap 'log_error "Deployment interrupted"; exit 1' INT TERM

# Run main function
main "$@"