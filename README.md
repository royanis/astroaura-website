# AstroAura Website

🌟 Official website for AstroAura - the AI-powered astrology app supporting 11 languages.

## Features

- **Jekyll-powered**: Static site generator optimized for GitHub Pages
- **Modern UX**: Interactive elements, smooth animations, and cosmic-themed design
- **Performance Optimized**: Lazy loading, asset compression, and service worker
- **Mobile-First**: Responsive design with touch-optimized interactions
- **SEO Optimized**: Structured data, meta tags, and sitemap generation
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation
- **PWA Ready**: Service worker, offline support, and web app manifest

## Quick Start

### Prerequisites

- Ruby 3.1+
- Node.js 18+
- Bundler
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/astroaura/website.git
cd website

# Install dependencies
make install
# or manually:
bundle install && npm install

# Start development server
make dev
# or manually:
bundle exec jekyll serve --livereload
```

Visit `http://localhost:4000` to see the site.

## Development

### Available Commands

```bash
make help          # Show all available commands
make install       # Install dependencies
make dev          # Start development server
make build        # Build for production
make clean        # Clean build artifacts
make test         # Run tests and validation
make lighthouse   # Run performance audit
make optimize     # Optimize assets
make deploy       # Deploy to GitHub Pages
```

### Project Structure

```
├── _config.yml           # Jekyll configuration
├── _layouts/            # Page templates
├── _includes/           # Reusable components
├── _sass/              # Modular SCSS files
├── _data/              # Site data files
├── assets/             # Static assets
│   ├── css/           # Compiled CSS
│   ├── js/            # JavaScript files
│   ├── images/        # Images and graphics
│   └── icons/         # Icons and favicons
├── _posts/             # Blog posts
├── pages/              # Static pages
├── .github/workflows/  # GitHub Actions
└── package.json        # Node.js dependencies
```

### Styling

The site uses a modular SCSS architecture:

- `_variables.scss` - CSS custom properties and SCSS variables
- `_mixins.scss` - Reusable SCSS mixins
- `_base.scss` - Base styles and utilities
- `_components.scss` - Component-specific styles
- `pages/` - Page-specific styles

### JavaScript

Modern JavaScript with:

- Vanilla JS (no framework dependencies)
- ES6+ features with fallbacks
- Performance optimizations
- Accessibility enhancements
- Service worker for offline support

## Deployment

### GitHub Pages (Automatic)

The site automatically deploys to GitHub Pages when you push to the `main` branch.

### Manual Deployment

```bash
make deploy
```

## Performance

The site is optimized for performance with:

- **Lighthouse Score**: 95+ across all metrics
- **Core Web Vitals**: Optimized LCP, FID, and CLS
- **Asset Optimization**: Compressed images and minified code
- **Caching Strategy**: Service worker with intelligent caching
- **Lazy Loading**: Images and non-critical content

## SEO

SEO optimizations include:

- Structured data (JSON-LD)
- Open Graph and Twitter Card meta tags
- Semantic HTML markup
- XML sitemap generation
- RSS feed
- Canonical URLs

## Accessibility

Accessibility features:

- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Reduced motion preferences
- Focus management

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `make test`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email contact@astroaura.me or create an issue on GitHub.

---

Made with ❤️ for the cosmic community