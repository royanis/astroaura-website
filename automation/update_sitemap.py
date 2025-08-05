#!/usr/bin/env python3
"""
Sitemap Update Script for AstroAura Blog
Automatically updates sitemap.xml with new blog posts
"""

import os
import json
import datetime
from pathlib import Path
from xml.etree.ElementTree import Element, SubElement, tostring
from xml.dom import minidom

class SitemapUpdater:
    def __init__(self, base_path: str = None):
        self.base_path = Path(base_path) if base_path else Path(__file__).parent.parent
        self.sitemap_path = self.base_path / "sitemap.xml"
        self.blog_path = self.base_path / "blog"
        self.posts_index_path = self.blog_path / "posts_index.json"
        
        self.site_url = "https://astroaura.me"
        
        # Static pages with their priorities and change frequencies
        self.static_pages = {
            "": {"priority": "1.0", "changefreq": "daily"},
            "features.html": {"priority": "0.9", "changefreq": "weekly"},
            "about.html": {"priority": "0.8", "changefreq": "monthly"},
            "contact.html": {"priority": "0.7", "changefreq": "monthly"},
            "privacy.html": {"priority": "0.6", "changefreq": "yearly"},
            "cosmic-insights.html": {"priority": "0.8", "changefreq": "weekly"},
            "blog/": {"priority": "0.9", "changefreq": "daily"},
        }

    def load_blog_posts(self):
        """Load blog posts from index"""
        if not self.posts_index_path.exists():
            return []
        
        try:
            with open(self.posts_index_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data.get('posts', [])
        except Exception as e:
            print(f"Error loading blog posts: {e}")
            return []

    def generate_sitemap(self):
        """Generate complete sitemap with all pages and blog posts"""
        
        # Create root element
        urlset = Element('urlset')
        urlset.set('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')
        urlset.set('xmlns:image', 'http://www.google.com/schemas/sitemap-image/1.1')
        
        # Add static pages
        for page, config in self.static_pages.items():
            url = SubElement(urlset, 'url')
            
            loc = SubElement(url, 'loc')
            loc.text = f"{self.site_url}/{page}"
            
            lastmod = SubElement(url, 'lastmod')
            lastmod.text = datetime.datetime.now().strftime('%Y-%m-%d')
            
            changefreq = SubElement(url, 'changefreq')
            changefreq.text = config['changefreq']
            
            priority = SubElement(url, 'priority')
            priority.text = config['priority']
            
            # Add image for main pages
            if page in ["", "features.html"]:
                image = SubElement(url, 'image:image')
                image_loc = SubElement(image, 'image:loc')
                image_loc.text = f"{self.site_url}/assets/icons/app_icon.png"
                image_caption = SubElement(image, 'image:caption')
                image_caption.text = "AstroAura - AI-Powered Astrology App"
        
        # Add blog posts
        blog_posts = self.load_blog_posts()
        for post in blog_posts:
            url = SubElement(urlset, 'url')
            
            loc = SubElement(url, 'loc')
            loc.text = f"{self.site_url}/blog/posts/{post['slug']}.html"
            
            lastmod = SubElement(url, 'lastmod')
            # Parse ISO date and format for sitemap
            try:
                post_date = datetime.datetime.fromisoformat(post['date'].replace('Z', '+00:00'))
                lastmod.text = post_date.strftime('%Y-%m-%d')
            except:
                lastmod.text = datetime.datetime.now().strftime('%Y-%m-%d')
            
            changefreq = SubElement(url, 'changefreq')
            changefreq.text = 'monthly'
            
            priority = SubElement(url, 'priority')
            priority.text = '0.7'
            
            # Add blog post image
            image = SubElement(url, 'image:image')
            image_loc = SubElement(image, 'image:loc')
            image_loc.text = f"{self.site_url}/assets/images/blog/cosmic-insights-og.jpg"
            image_caption = SubElement(image, 'image:caption')
            image_caption.text = post['title'][:100]  # Truncate long titles
        
        return urlset

    def save_sitemap(self, urlset):
        """Save sitemap to file with pretty formatting"""
        
        # Convert to string with pretty formatting
        rough_string = tostring(urlset, 'utf-8')
        reparsed = minidom.parseString(rough_string)
        pretty_xml = reparsed.toprettyxml(indent="  ")
        
        # Remove empty lines and fix formatting
        lines = [line for line in pretty_xml.split('\n') if line.strip()]
        pretty_xml = '\n'.join(lines)
        
        # Write to file
        with open(self.sitemap_path, 'w', encoding='utf-8') as f:
            f.write(pretty_xml)
        
        print(f"✅ Sitemap updated: {self.sitemap_path}")
        
        # Also update robots.txt to reference sitemap
        self.update_robots_txt()

    def update_robots_txt(self):
        """Update robots.txt with sitemap reference"""
        
        robots_path = self.base_path / "robots.txt"
        
        robots_content = f"""# AstroAura Website Robots.txt
# Optimized for search engines and AI crawlers

User-agent: *
Allow: /

# Allow AI crawlers and search bots
User-agent: ChatGPT-User
Allow: /

User-agent: GPTBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: CCBot
Allow: /

User-agent: Claude-Web
Allow: /

# Disallow sensitive areas
Disallow: /automation/
Disallow: /.github/
Disallow: /backup/

# Sitemap location
Sitemap: {self.site_url}/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1
"""
        
        with open(robots_path, 'w', encoding='utf-8') as f:
            f.write(robots_content.strip())
        
        print(f"✅ Robots.txt updated: {robots_path}")

    def generate_and_save(self):
        """Generate and save complete sitemap"""
        
        print("🗺️  Updating sitemap with latest blog posts...")
        
        urlset = self.generate_sitemap()
        self.save_sitemap(urlset)
        
        # Count entries
        blog_posts = self.load_blog_posts()
        total_urls = len(self.static_pages) + len(blog_posts)
        
        print(f"📊 Sitemap statistics:")
        print(f"   • Static pages: {len(self.static_pages)}")
        print(f"   • Blog posts: {len(blog_posts)}")
        print(f"   • Total URLs: {total_urls}")
        print(f"🌐 Sitemap URL: {self.site_url}/sitemap.xml")

def main():
    updater = SitemapUpdater()
    updater.generate_and_save()

if __name__ == "__main__":
    main()