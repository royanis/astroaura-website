# AstroAura Blog Automation Workflows

This directory contains GitHub Actions workflows that automate the AstroAura blog system with complete post tracking and synchronization.

## 🚀 Automated Workflows

### 1. **Blog Post Registration** (`blog-post-registration.yml`)
- **Trigger**: After blog generation workflows complete, or on push to `blog/posts/`
- **Purpose**: Automatically registers new blog posts with the tracking system
- **Actions**:
  - Detects new blog post HTML files
  - Updates `posts_index.json` with metadata
  - Synchronizes `sitemap.xml` and `rss.xml`
  - Validates system integrity
  - Commits and pushes changes

### 2. **Generate Enriched Blog Posts** (`generate-blog.yml`)
- **Trigger**: Daily at 05:17 UTC + manual dispatch
- **Purpose**: Generates new blog posts with trending topics
- **Integration**: Now includes automatic post registration
- **Actions**:
  - Generates blog content using AI APIs
  - Registers posts with new tracking system
  - Updates all feeds and indexes
  - Commits changes automatically

### 3. **Automated Blog Publishing** (`auto-blog-publisher.yml`)
- **Trigger**: Daily at midnight UTC + manual dispatch
- **Purpose**: Full blog publishing pipeline with rate limiting
- **Integration**: Enhanced with new registration system
- **Actions**:
  - Checks publishing schedule (20+ hours between posts)
  - Generates authentic astrology content
  - Registers posts with new system
  - Updates feeds and deployment

### 4. **Manual Blog Sync** (`manual-blog-sync.yml`)
- **Trigger**: Manual dispatch only
- **Purpose**: Maintenance and troubleshooting operations
- **Actions Available**:
  - `sync`: Synchronize all posts with tracking system
  - `validate`: Check system integrity
  - `reset`: Clear all posts (requires force flag)
  - `status`: Generate system status report

## 📊 Workflow Integration

### Automatic Chain
```
Blog Generation → Post Registration → Feed Updates → Git Commit → Deploy
```

### Key Features
- **No manual intervention required** - everything is automated
- **Duplicate detection** - prevents re-processing existing posts
- **Integrity validation** - ensures data consistency
- **Error handling** - graceful fallbacks and reporting
- **Rate limiting** - prevents spam posting

## 🛠️ Manual Operations

### Sync All Posts
```yaml
# Go to Actions → Manual Blog Sync
# Choose: sync
```

### Check System Status  
```yaml
# Go to Actions → Manual Blog Sync
# Choose: status
```

### Emergency Reset (Dangerous!)
```yaml
# Go to Actions → Manual Blog Sync
# Choose: reset
# Set force_reset: true
```

## 📈 Monitoring

### System Health Indicators
- **Post Count**: HTML files vs indexed posts should match
- **Feed Sync**: Sitemap and RSS should contain all posts
- **Last Updated**: posts_index.json metadata shows sync status
- **Workflow Success**: GitHub Actions should complete without errors

### Troubleshooting
1. **Posts not appearing on website**: Check if registration workflow ran successfully
2. **Missing from search engines**: Verify sitemap.xml contains blog posts
3. **RSS feed issues**: Check rss.xml was updated by registration system
4. **Duplicate posts**: Manual sync will deduplicate automatically

## 🔧 Configuration

### Environment Variables
All workflows inherit from the existing setup:
- `GOOGLE_API_KEY`: For content generation
- `COHERE_API_KEY`: AI content enhancement  
- `ANTHROPIC_API_KEY`: Advanced content generation
- `GITHUB_TOKEN`: Repository access (automatic)

### Scheduling
- **Blog Generation**: Daily at 05:17 UTC
- **Blog Publishing**: Daily at 00:00 UTC (with 20hr cooldown)
- **Post Registration**: Triggered by generation workflows
- **Manual Operations**: On-demand only

## 🎯 Key Benefits

### For Content Management
- ✅ **Zero manual work** - posts automatically tracked
- ✅ **No missing posts** - everything gets indexed
- ✅ **SEO optimized** - sitemap always current
- ✅ **Feed compatibility** - RSS updated automatically

### For Development
- ✅ **Clean separation** - blog logic isolated
- ✅ **Error recovery** - failed runs can be retried
- ✅ **Validation built-in** - integrity checks prevent issues
- ✅ **Monitoring** - GitHub Actions provides full visibility

### For Users
- ✅ **Reliable content** - posts always appear correctly
- ✅ **Fresh feeds** - RSS and sitemap stay current
- ✅ **Search friendly** - SEO automatically maintained
- ✅ **Fast loading** - efficient post indexing

## 🚨 Important Notes

- **All blog posts are now auto-managed** - manual JSON editing not needed
- **Old automation scripts** still work but new system is preferred
- **Multiple safety checks** prevent data corruption
- **Manual override available** for emergency situations
- **Full audit trail** in GitHub Actions logs

The blog system is now fully automated with comprehensive tracking and zero maintenance requirements!