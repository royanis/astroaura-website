# AstroAura Automated Blog System

🌟 **Production-ready automated blog publishing system for GitHub Pages with authentic AI-powered astrology content.**

## Features

✅ **Authentic Content Generation**: Real astronomical data + AI-powered authentic astrology content  
✅ **GitHub Actions Automation**: Daily automated publishing to GitHub Pages  
✅ **Content Quality Validation**: Comprehensive quality scoring and validation system  
✅ **SEO Optimization**: Complete meta tags, structured data, and search engine optimization  
✅ **RSS/Atom/JSON Feeds**: Multi-format feed generation with automatic updates  
✅ **Responsive Design**: Mobile-first design matching AstroAura's cosmic theme  
✅ **Real-time Cosmic Data**: Live astronomical data integration (moon phases, planetary positions, etc.)  
✅ **Cost Effective**: ~$0.01-0.05 per blog post with OpenAI API  

## Quick Setup

### 1. Install Dependencies
```bash
cd automation
pip install -r requirements.txt
```

### 2. Set up GitHub Secrets (Choose Free APIs!)
**🆓 RECOMMENDED FREE APIS:**

1. **Google Gemini** (BEST - Unlimited free tier):
   - Get free API key: https://ai.google.dev
   - Add secret: `GOOGLE_API_KEY`
   - ✅ Unlimited monthly usage, excellent quality

2. **Cohere** (100 calls/month free):
   - Get free API key: https://cohere.com
   - Add secret: `COHERE_API_KEY`
   - ✅ Good quality, decent free tier

3. **Anthropic Claude** ($5 free credits):
   - Get free API key: https://anthropic.com
   - Add secret: `ANTHROPIC_API_KEY`
   - ✅ Excellent quality, ~500 free blog posts

4. **OpenAI** (Paid - $0.01-0.05 per post):
   - Get API key: https://platform.openai.com/api-keys
   - Add secret: `OPENAI_API_KEY`
   - ⚠️  Paid but very affordable

**No API keys?** No problem! System works with high-quality fallback content.

### 3. Configure GitHub Pages
1. Repository Settings → Pages
2. Source: "Deploy from a branch"  
3. Branch: "main", Folder: "/ (root)"

### 4. Run Setup Script
```bash
python automation/setup_production_blog.py
```

### 5. Enable Automation
The GitHub Action automatically runs daily at midnight UTC (00:00). You can also trigger manually:
- Go to Actions tab → "Automated Blog Publishing" → "Run workflow"

## System Components

### Core Scripts

#### `authentic_blog_generator.py`
- **AI-Powered Content**: Uses OpenAI GPT-4 for authentic astrology content
- **Astronomical Data**: Integrates real moon phases, planetary positions, retrograde periods
- **Fallback System**: High-quality template-based content when AI unavailable
- **SEO Optimized**: Complete meta tags, schema markup, Open Graph tags

```bash
# Generate single post
python authentic_blog_generator.py --topic "Mercury Retrograde Guide"

# Test system
python authentic_blog_generator.py --test
```

#### `content_quality_validator.py`
- **Quality Scoring**: 100-point quality assessment system
- **Astrology Authenticity**: Validates proper astrological terminology and concepts
- **SEO Validation**: Checks meta descriptions, title optimization, keyword consistency
- **Current Relevance**: Validates content matches current astronomical conditions

```bash
# Test validator
python content_quality_validator.py
```

#### `update_sitemap.py`
- **Dynamic Sitemap**: Auto-updates XML sitemap with new blog posts
- **Image SEO**: Includes image sitemap data for better search visibility
- **Robots.txt**: Updates robots.txt with AI crawler permissions

```bash
# Update sitemap
python update_sitemap.py
```

#### `rss_generator.py`
- **Multi-Format Feeds**: Generates RSS 2.0, Atom 1.0, and JSON Feed formats
- **SEO Integration**: Includes structured data and proper feed metadata
- **Auto-Updates**: Automatically regenerates feeds when new posts are published

### GitHub Action Workflow

**File**: `.github/workflows/auto-blog-publisher.yml`

**Schedule**: Daily at midnight UTC (00:00) (configurable)  
**Triggers**: 
- Scheduled daily execution
- Manual workflow dispatch
- Intelligent publishing (won't publish if recent post exists)

**Process**:
1. ✅ Check if should publish (anti-spam protection)
2. 🤖 Generate authentic astrology content using AI + astronomical data  
3. ✅ Validate content quality (must score ≥70 to publish)
4. 🗺️ Update sitemap and RSS feeds
5. 📝 Commit and push to GitHub Pages
6. 📊 Update publishing statistics

## Content Generation System

### Authentic Astrology Content
- **Real Astronomical Data**: Current moon phases, planetary positions, Mercury retrograde status
- **AI Enhancement**: GPT-4 generates authentic, helpful astrology content
- **Quality Validation**: Multi-layer validation ensures high-quality, relevant content
- **SEO Optimized**: Every post includes proper meta tags, structured data, and search optimization

### Topic Selection
The system automatically selects from 15+ authentic astrology topics:
- Current Mercury Retrograde Effects and Survival Guide
- Today's Full Moon in {sign}: Spiritual Significance and Rituals  
- Weekly Planetary Transits: What the Stars Hold for Each Zodiac Sign
- Current Cosmic Weather: How Today's Planetary Alignments Affect You
- New Moon Manifestation: Harnessing {sign} Energy for Growth
- And more...

### Content Quality Standards
- **Minimum 500 words**: Substantial, valuable content
- **Astrology Authenticity**: Proper astrological terminology and concepts
- **Current Relevance**: Content matches real astronomical conditions
- **Practical Application**: Actionable advice readers can use today
- **SEO Optimization**: Complete meta tags and structured data

## Cost Analysis

### OpenAI API Costs
- **Per Blog Post**: ~$0.01-0.05 (very affordable)
- **Monthly Cost**: ~$0.30-1.50 for daily posting
- **Annual Cost**: ~$3.60-18.00 total

### Alternative: Free Fallback System
- High-quality template-based content generation
- Real astronomical data integration
- No API costs - completely free
- Automatically activates if OpenAI API unavailable

## Quick Start Commands

```bash
# Complete system setup
python automation/setup_production_blog.py

# Generate single blog post
python automation/authentic_blog_generator.py --topic "Your Topic"

# Test system without publishing
python automation/authentic_blog_generator.py --test

# Validate content quality
python automation/content_quality_validator.py

# Update sitemap manually
python automation/update_sitemap.py

# Generate RSS feeds
python automation/rss_generator.py
```

## File Structure

```
automation/
├── authentic_blog_generator.py    # AI-powered content generation
├── content_quality_validator.py   # Quality validation system  
├── update_sitemap.py             # Sitemap generation
├── rss_generator.py              # RSS/Atom/JSON feeds
├── setup_production_blog.py      # Complete system setup
├── publisher_config.json         # System configuration
├── requirements.txt              # Python dependencies
└── README.md                     # This file

.github/workflows/
└── auto-blog-publisher.yml       # GitHub Actions workflow

blog/
├── index.html                    # Blog homepage
├── posts/                       # Generated blog posts
├── js/blog.js                   # Blog JavaScript  
├── posts_index.json             # Blog post index
├── rss.xml                      # RSS 2.0 feed
├── atom.xml                     # Atom 1.0 feed  
└── feed.json                    # JSON Feed
```

---

**🌟 Your automated astrology blog is now ready to inspire thousands of readers with authentic cosmic wisdom!**