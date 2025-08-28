# Makefile for AstroAura Website Development

.PHONY: help install dev build clean test deploy

# Default target
help:
	@echo "AstroAura Website Development Commands:"
	@echo ""
	@echo "  install     Install all dependencies (Ruby gems and npm packages)"
	@echo "  dev         Start development server with live reload"
	@echo "  build       Build the site for production"
	@echo "  clean       Clean build artifacts"
	@echo "  test        Run tests and validation"
	@echo "  deploy      Deploy to GitHub Pages"
	@echo "  lighthouse  Run Lighthouse performance audit"
	@echo "  optimize    Optimize images and assets"
	@echo ""

# Install dependencies
install:
	@echo "Installing Ruby dependencies..."
	bundle install
	@echo "Installing Node.js dependencies..."
	npm install
	@echo "Dependencies installed successfully!"

# Development server
dev:
	@echo "Starting development server..."
	bundle exec jekyll serve --livereload --drafts --port 4000

# Build for production
build:
	@echo "Building assets..."
	npm run build:assets
	@echo "Building Jekyll site..."
	JEKYLL_ENV=production bundle exec jekyll build
	@echo "Build completed!"

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	bundle exec jekyll clean
	rm -rf node_modules/.cache
	@echo "Clean completed!"

# Run tests
test:
	@echo "Running HTML validation..."
	bundle exec htmlproofer ./_site --disable-external --check-html --allow-hash-href
	@echo "Tests completed!"

# Deploy to GitHub Pages
deploy:
	@echo "Deploying to GitHub Pages..."
	git add .
	git commit -m "Deploy: $(shell date)"
	git push origin main
	@echo "Deployment initiated!"

# Run Lighthouse audit
lighthouse:
	@echo "Running Lighthouse performance audit..."
	npm run lighthouse
	@echo "Lighthouse audit completed!"

# Optimize assets
optimize:
	@echo "Optimizing images..."
	npm run optimize:images
	@echo "Minifying CSS..."
	npm run minify:css
	@echo "Minifying JavaScript..."
	npm run minify:js
	@echo "Asset optimization completed!"

# Quick setup for new developers
setup: install
	@echo "Setting up development environment..."
	@echo "Creating necessary directories..."
	mkdir -p _site
	mkdir -p assets/images/optimized
	@echo "Setup completed! Run 'make dev' to start developing."

# Production build with optimization
prod: clean optimize build test
	@echo "Production build completed successfully!"