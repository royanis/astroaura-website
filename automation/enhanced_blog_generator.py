#!/usr/bin/env python3
"""
Enhanced AstroAura Blog Generator with Trending Topics Integration

This script integrates trending topic research with the existing blog generation system
to create more engaging and varied content with improved storytelling.
"""

import json
import random
from datetime import datetime, timezone
import requests
import re
from typing import List, Dict, Any
import os
import sys
from pathlib import Path
from trending_blog_generator import BlogContentGenerator, TrendingTopicResearcher
from free_api_content_generator import FreeAPIContentGenerator

class EnhancedBlogGenerator:
    """Enhanced blog generator with trending topics and improved storytelling"""
    
    def __init__(self, blog_dir: str):
        self.blog_dir = Path(blog_dir)
        self.posts_dir = self.blog_dir / "posts"
        self.content_generator = BlogContentGenerator()
        self.free_api_generator = FreeAPIContentGenerator()
        
        # Ensure directories exist
        self.posts_dir.mkdir(exist_ok=True)
        
    def generate_html_content(self, post_data: Dict[str, Any]) -> str:
        """Generate complete HTML content for a blog post with enhanced storytelling"""
        
        # Enhanced HTML template with better storytelling structure
        html_content = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="{post_data['meta_description']}">
    <title>{post_data['title']} | AstroAura Cosmic Insights</title>
    
    <!-- SEO Meta Tags -->
    <meta name="keywords" content="{', '.join(post_data['keywords'])}">
    <meta name="author" content="{post_data['author']}">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
    <meta name="revisit-after" content="3 days">
    
    <!-- Canonical Tag -->
    <link rel="canonical" href="https://astroaura.me/blog/posts/{post_data['slug']}.html">
    
    <!-- Open Graph Tags -->
    <meta property="og:title" content="{post_data['title']} | AstroAura">
    <meta property="og:description" content="{post_data['meta_description']}">
    <meta property="og:image" content="{og_image}">
    <meta property="og:url" content="https://astroaura.me/blog/posts/{post_data['slug']}.html">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="AstroAura">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{post_data['title']}">
    <meta name="twitter:description" content="{post_data['meta_description']}">
    <meta name="twitter:image" content="{og_image}">
    
    <!-- Schema.org Markup -->
    <script type="application/ld+json">
    {{
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "{post_data['title']}",
        "description": "{post_data['meta_description']}",
        "author": {{
            "@type": "Organization",
            "name": "{post_data['author']}"
        }},
        "publisher": {{
            "@type": "Organization",
            "name": "AstroAura",
            "logo": {{
                "@type": "ImageObject",
                "url": "https://astroaura.me/assets/icons/app_icon.png"
            }}
        }},
        "datePublished": "{post_data['date']}",
        "dateModified": "{post_data['date']}",
        "url": "https://astroaura.me/blog/posts/{post_data['slug']}.html",
        "image": "{og_image}",
        "mainEntityOfPage": {{
            "@type": "WebPage",
            "@id": "https://astroaura.me/blog/posts/{post_data['slug']}.html"
        }},
        "keywords": "{', '.join(post_data['keywords'])}"
    }}
    </script>
    
    <!-- CSS -->
    <link rel="stylesheet" href="../../styles/blog.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Georgia:wght@400;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <!-- Navigation -->
    <header class="blog-header">
        <nav class="blog-nav">
            <div class="nav-container">
                <a href="../../index.html" class="logo">
                    <img src="../../assets/icons/app_icon.png" alt="AstroAura Logo" width="40" height="40">
                    AstroAura
                </a>
                <ul class="nav-links">
                    <li><a href="../../index.html">Home</a></li>
                    <li><a href="../../features.html">Features</a></li>
                    <li><a href="../index.html" class="active">Blog</a></li>
                    <li><a href="../../about.html">About</a></li>
                    <li><a href="../../contact.html">Contact</a></li>
                </ul>
                <button class="mobile-menu-btn" aria-expanded="false" aria-label="Toggle navigation">
                    <i class="fas fa-bars"></i>
                </button>
            </div>
        </nav>
    </header>
    
    <!-- Main Content -->
    <main class="blog-post">
        <article class="post-container">
            <!-- Breadcrumbs -->
            <nav class="breadcrumbs" aria-label="Breadcrumb navigation">
                <a href="../../index.html">Home</a> > 
                <a href="../index.html">Blog</a> > 
                <span>{post_data['title'][:50]}...</span>
            </nav>
            

            
            <!-- Post Content -->
            <div class="post-content">
                <div class="post-body blog-content trending-astrology">'''
        
        # Prefer API-enriched HTML content if available
        api_html = post_data.get('api_article_html')
        if api_html:
            html_content += api_html
        else:
            # Add content sections with enhanced storytelling
            for section in post_data['content_sections']:
                html_content += f'''
                        <section class="content-section">
                            <h2>{section['title']}</h2>
                            <p>{section['content']}</p>
                        </section>'''
        
        # Add call-to-action section
        html_content += f'''
                    
                    <section class="cta-section trending-cta">
                        <h2>Discover Your Personal Cosmic Connection</h2>
                        <p>While understanding how {post_data['astro_angle']} influences {post_data['trending_topic']} helps everyone, your personal birth chart reveals how these cosmic forces uniquely affect your life journey.</p>
                        
                        <div class="astroaura-features">
                            <h3>🌟 Get Personalized Insights with AstroAura</h3>
                            <ul class="feature-list">
                                <li><strong>Trending Topic Analysis:</strong> See how current trends align with your personal astrology</li>
                                <li><strong>Real-Time Cosmic Updates:</strong> Stay ahead of astrological influences on trending topics</li>
                                <li><strong>AI-Enhanced Guidance:</strong> Get precise insights tailored to your unique chart</li>
                                <li><strong>Multilingual Wisdom:</strong> Access cosmic guidance in your preferred language</li>
                            </ul>
                        </div>
                        
                        <div class="download-buttons">
                            <a href="https://apps.apple.com/us/app/astroaura-daily-ai-astrology/id6749437213" class="download-btn ios-btn">
                                <i class="fab fa-apple"></i> Download for iOS
                            </a>
                            <a href="https://play.google.com/store/apps/details?id=com.astroaura.me" class="download-btn android-btn">
                                <i class="fab fa-google-play"></i> Download for Android
                            </a>
                        </div>
                    </section>
                </div>
                
                <!-- AI Attribution -->
                <div class="ai-attribution">
                    <p><em>This content combines trending topic analysis with authentic astrological wisdom and current astronomical data.</em></p>
                </div>
            </div>
            
            <!-- Related Actions -->
            <section class="post-actions">
                <div class="share-buttons">
                    <h3>Share This Trending Cosmic Insight</h3>
                    <a href="https://twitter.com/intent/tweet?text={post_data['title']}&url=https://astroaura.me/blog/posts/{post_data['slug']}.html" target="_blank" class="share-btn twitter">
                        <i class="fab fa-twitter"></i> Tweet
                    </a>
                    <a href="https://www.facebook.com/sharer/sharer.php?u=https://astroaura.me/blog/posts/{post_data['slug']}.html" target="_blank" class="share-btn facebook">
                        <i class="fab fa-facebook"></i> Share
                    </a>
                </div>
            </section>
        </article>
        
        <!-- Sidebar -->
        <aside class="blog-sidebar">
            <div class="widget trending-topics">
                <h3>🔥 What's Trending</h3>
                <p>This post covers: <strong>{post_data['trending_topic']}</strong></p>
                <p>Astrological angle: <em>{post_data['astro_angle']}</em></p>
                <div class="engagement-score">
                    Trending Score: {post_data['engagement_score']}/100
                </div>
            </div>
            
            <div class="widget app-download">
                <h3>🌟 Get Personalized Insights</h3>
                <p>Discover how trending topics affect your personal astrology</p>
                <div class="download-buttons">
                    <a href="https://apps.apple.com/us/app/astroaura-daily-ai-astrology/id6749437213" class="btn-download ios">
                        <i class="fab fa-apple"></i> iOS App
                    </a>
                    <a href="https://play.google.com/store/apps/details?id=com.astroaura.me" class="btn-download android">
                        <i class="fab fa-google-play"></i> Android App
                    </a>
                </div>
            </div>
            
            <div class="widget cosmic-weather">
                <h3>Today's Cosmic Weather</h3>'''
        
        # Add cosmic weather data
        astro_data = post_data['astronomical_data']
        html_content += f'''
                <div class="weather-item">
                    <strong>Sun:</strong> {astro_data['sun_sign']}
                </div>
                <div class="weather-item">
                    <strong>Moon:</strong> {astro_data['moon_phase']}
                </div>
                <div class="weather-item">
                    <strong>Season:</strong> {astro_data['season']}
                </div>'''
        
        if astro_data.get('mercury_retrograde'):
            html_content += '''
                <div class="weather-item warning">
                    <strong>Mercury:</strong> Retrograde ⚠️
                </div>'''
        
        if astro_data.get('notable_transits'):
            html_content += f'''
                <div class="weather-item">
                    <strong>Key Transit:</strong> {astro_data['notable_transits'][0]}
                </div>'''
        
        html_content += '''
            </div>
        </aside>
    </main>
    
    <!-- Footer -->
    <footer class="blog-footer">
        <div class="footer-content">
            <div class="footer-section">
                <h4>AstroAura</h4>
                <p>Where trending topics meet cosmic wisdom</p>
                <div class="social-links">
                    <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
                    <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                    <a href="#" aria-label="Facebook"><i class="fab fa-facebook"></i></a>
                </div>
            </div>
            <div class="footer-section">
                <h4>Quick Links</h4>
                <ul>
                    <li><a href="../../features.html">App Features</a></li>
                    <li><a href="../index.html">Blog</a></li>
                    <li><a href="../../privacy.html">Privacy Policy</a></li>
                    <li><a href="../../contact.html">Contact Us</a></li>
                </ul>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2025 AstroAura. All rights reserved. | <a href="../../privacy.html">Privacy</a> | <a href="../../contact.html">Terms</a></p>
        </div>
    </footer>
    
    <!-- JavaScript -->
    <script src="../js/blog.js"></script>
</body>
</html>'''
        
        return html_content
    
    def update_indexes(self, posts: List[Dict[str, Any]]):
        """Update posts index, atom feed, and JSON feed"""
        
        # Update posts_index.json
        posts_index_path = self.blog_dir / "posts_index.json"
        with open(posts_index_path, 'w') as f:
            json.dump({"posts": posts}, f, indent=2)
        
        # Update atom.xml
        self.update_atom_feed(posts)
        
        # Update feed.json
        self.update_json_feed(posts)

        # Update RSS (for wider reader compatibility)
        self.update_rss_feed(posts)

        # Update sitemap posts if exists
        try:
            self.update_sitemap(posts)
        except Exception:
            pass
    
    def update_atom_feed(self, posts: List[Dict[str, Any]]):
        """Update Atom XML feed"""
        
        atom_content = '''<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
<title>AstroAura Cosmic Insights Blog</title>
<subtitle>AI-powered astrology insights with trending topics and cosmic wisdom from the world's first multilingual astrology app.</subtitle>
<link href="https://astroaura.me/blog" rel="alternate" type="text/html" />
<link href="https://astroaura.me/blog/atom.xml" rel="self" type="application/atom+xml" />
<id>https://astroaura.me/blog</id>
<updated>''' + datetime.now(timezone.utc).isoformat() + '''</updated>
<author><name>AstroAura AI Cosmic Team</name><email>cosmic@astroaura.me</email></author>
<generator version="2.0">AstroAura Enhanced Blog System</generator>'''
        
        for post in posts:
            atom_content += f'''
<entry>
<title>{post['title']}</title>
<link href="https://astroaura.me/blog/posts/{post['slug']}.html" rel="alternate" type="text/html" />
<id>https://astroaura.me/blog/posts/{post['slug']}.html</id>
<published>{post['date']}</published>
<updated>{post['date']}</updated>
<summary type="text">{post['meta_description']}</summary>
<author><name>{post['author']}</name></author>'''
            
            for keyword in post['keywords']:
                atom_content += f'''
<category term="{keyword}" label="{keyword.replace('-', ' ').title()}" />'''
            
            atom_content += '''
</entry>'''
        
        atom_content += '''
</feed>'''
        
        atom_path = self.blog_dir / "atom.xml"
        with open(atom_path, 'w') as f:
            f.write(atom_content)
    
    def update_json_feed(self, posts: List[Dict[str, Any]]):
        """Update JSON feed"""
        
        feed_data = {
            "version": "https://jsonfeed.org/version/1.1",
            "title": "AstroAura Cosmic Insights Blog",
            "description": "AI-powered astrology insights with trending topics and cosmic wisdom from the world's first multilingual astrology app.",
            "home_page_url": "https://astroaura.me/blog",
            "feed_url": "https://astroaura.me/blog/feed.json",
            "language": "en-US",
            "authors": [
                {
                    "name": "AstroAura AI Cosmic Team",
                    "email": "cosmic@astroaura.me"
                }
            ],
            "items": []
        }
        
        for post in posts:
            feed_data["items"].append({
                "id": f"https://astroaura.me/blog/posts/{post['slug']}.html",
                "url": f"https://astroaura.me/blog/posts/{post['slug']}.html",
                "title": post['title'],
                "summary": post['meta_description'],
                "date_published": post['date'],
                "date_modified": post['date'],
                "authors": [{"name": post['author']}],
                "tags": post['keywords']
            })
        
        feed_path = self.blog_dir / "feed.json"
        with open(feed_path, 'w') as f:
            json.dump(feed_data, f, indent=2)

    def update_rss_feed(self, posts: List[Dict[str, Any]]):
        """Generate RSS 2.0 feed"""
        from xml.sax.saxutils import escape
        rss_items = []
        for post in posts:
            title = escape(post['title'])
            link = f"https://astroaura.me/blog/posts/{post['slug']}.html"
            description = escape(post['meta_description'])
            pub_date = post['date']
            rss_items.append(f"""
<item>
  <title>{title}</title>
  <link>{link}</link>
  <guid isPermaLink="true">{link}</guid>
  <description>{description}</description>
  <pubDate>{pub_date}</pubDate>
</item>""")
        rss = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>AstroAura Cosmic Insights Blog</title>
    <link>https://astroaura.me/blog</link>
    <description>AI-powered astrology insights with trending topics and cosmic wisdom.</description>
    {''.join(rss_items)}
  </channel>
</rss>"""
        with open(self.blog_dir / 'rss.xml', 'w') as f:
            f.write(rss)

    def update_sitemap(self, posts: List[Dict[str, Any]]):
        """Append latest blog posts into sitemap.xml if file exists"""
        sitemap_path = Path(self.blog_dir).parent / 'sitemap.xml'
        if not sitemap_path.exists():
            return
        try:
            # naive append – in production, parse and merge properly
            with open(sitemap_path, 'r') as f:
                content = f.read()
            # Insert simple urls block near end if not already present
            for post in posts:
                url = f"https://astroaura.me/blog/posts/{post['slug']}.html"
                if url not in content:
                    insert_before = '</urlset>'
                    url_entry = f"\n  <url><loc>{url}</loc><lastmod>{post['date']}</lastmod></url>\n"
                    content = content.replace(insert_before, url_entry + insert_before)
            with open(sitemap_path, 'w') as f:
                f.write(content)
        except Exception:
            pass
    
    def generate_trending_posts(self, num_posts: int = 2) -> List[Dict[str, Any]]:
        """Generate trending topic blog posts with enhanced storytelling"""
        
        posts = self.content_generator.generate_daily_posts(num_posts)
        
        for post in posts:
            # Attempt to enrich content using free APIs (Gemini/Cohere/Claude/HF)
            try:
                api_result = self.free_api_generator.generate_with_free_apis(
                    post.get('trending_topic', post['title']),
                    post.get('astronomical_data', {}),
                    extra_context=(post.get('storytelling_framework') or {}).get('hook')
                )
                if api_result and api_result.get('content'):
                    post['api_article_html'] = api_result['content']
                    if api_result.get('meta_description'):
                        post['meta_description'] = api_result['meta_description']
                    post['api_used'] = api_result.get('api_used')
            except Exception as e:
                print(f"Free API enrichment failed: {e}")
            
            # Generate HTML file
            html_content = self.generate_html_content(post)
            html_path = self.posts_dir / f"{post['slug']}.html"
            
            with open(html_path, 'w') as f:
                f.write(html_content)
        
        # Update all index files
        self.update_indexes(posts)
        
        return posts

def main():
    """Main execution function"""
    
    if len(sys.argv) > 1 and sys.argv[1] == "--generate":
        print("🌟 Generating Trending Topic Blog Posts...")
        
        # Use relative path from the automation directory
        blog_dir = "../blog"
        generator = EnhancedBlogGenerator(blog_dir)
        
        # Generate 2 trending posts
        posts = generator.generate_trending_posts(2)
        
        print(f"\n✅ Generated {len(posts)} trending topic blog posts:")
        for i, post in enumerate(posts, 1):
            print(f"\n{i}. {post['title']}")
            print(f"   📊 Trending Topic: {post['trending_topic']}")
            print(f"   ✨ Astro Angle: {post['astro_angle']}")
            print(f"   📈 Engagement Score: {post['engagement_score']}")
            print(f"   📄 File: {post['slug']}.html")
        
        print(f"\n📋 Updated:")
        print(f"   • posts_index.json")
        print(f"   • atom.xml")
        print(f"   • feed.json")
        
        return
    
    print("🌟 Enhanced AstroAura Blog Generator")
    print("Combines trending topics with astrological wisdom for engaging content.")
    print("\nRun with --generate to create new trending topic posts")

if __name__ == "__main__":
    main()