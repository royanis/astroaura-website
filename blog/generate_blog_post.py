#!/usr/bin/env python3
"""
Blog Post Generation System for AstroAura
Automatically updates posts_index.json, sitemap.xml, and rss.xml
"""

import json
import datetime
import re
from pathlib import Path
from typing import Dict, List, Optional
import xml.etree.ElementTree as ET

class BlogPostGenerator:
    def __init__(self, blog_root: str = "./"):
        self.blog_root = Path(blog_root)
        self.posts_dir = self.blog_root / "posts"
        self.posts_index_file = self.blog_root / "posts_index.json"
        self.sitemap_file = self.blog_root.parent / "sitemap.xml"
        self.rss_file = self.blog_root / "rss.xml"
        
    def load_posts_index(self) -> Dict:
        """Load the current posts index"""
        if self.posts_index_file.exists():
            with open(self.posts_index_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {"posts": [], "metadata": {"last_updated": "", "total_posts": 0, "version": "2.0"}}
    
    def save_posts_index(self, index_data: Dict):
        """Save the updated posts index"""
        # Ensure structure exists even if older files lack metadata
        index_data.setdefault("posts", [])
        metadata = index_data.setdefault("metadata", {})
        metadata.setdefault("version", "2.0")
        metadata["last_updated"] = datetime.datetime.utcnow().isoformat() + "Z"
        metadata["total_posts"] = len(index_data["posts"])
        
        with open(self.posts_index_file, 'w', encoding='utf-8') as f:
            json.dump(index_data, f, indent=2, ensure_ascii=False)
    
    def extract_metadata_from_html(self, html_content: str, slug: str) -> Dict:
        """Extract metadata from HTML content"""
        # Extract title
        title_match = re.search(r'<title>(.*?)</title>', html_content, re.DOTALL)
        title = title_match.group(1).split(' | ')[0].strip() if title_match else "Untitled"
        
        # Extract meta description
        desc_match = re.search(r'<meta name="description" content="(.*?)"', html_content)
        meta_description = desc_match.group(1) if desc_match else ""
        
        # Extract keywords
        keywords_match = re.search(r'<meta name="keywords" content="(.*?)"', html_content)
        keywords = [k.strip() for k in keywords_match.group(1).split(',')] if keywords_match else []
        
        # Extract post date from datetime attribute
        date_match = re.search(r'datetime="(.*?)"', html_content)
        post_date = date_match.group(1) if date_match else datetime.datetime.utcnow().isoformat() + "+00:00"
        
        return {
            "title": title,
            "slug": slug,
            "date": post_date,
            "meta_description": meta_description,
            "keywords": keywords,
            "author": "AstroAura AI Cosmic Team",
            "ai_generated": True
        }
    
    def add_post_to_index(self, html_file_path: str, post_metadata: Dict):
        """Add a new post to the posts index"""
        index_data = self.load_posts_index()
        
        # Check if post already exists
        existing_post = next((p for p in index_data["posts"] if p["slug"] == post_metadata["slug"]), None)
        if existing_post:
            # Update existing post
            existing_post.update(post_metadata)
        else:
            # Add new post at the beginning (most recent first)
            index_data["posts"].insert(0, post_metadata)
        
        self.save_posts_index(index_data)
        print(f"✓ Updated posts_index.json with post: {post_metadata['title']}")
    
    def update_sitemap(self, post_metadata: Dict):
        """Add post to sitemap.xml"""
        try:
            tree = ET.parse(self.sitemap_file)
            root = tree.getroot()
            
            # Check if post URL already exists
            post_url = f"https://astroaura.me/blog/posts/{post_metadata['slug']}.html"
            existing_url = root.find(f".//{{http://www.sitemaps.org/schemas/sitemap/0.9}}url[{{http://www.sitemaps.org/schemas/sitemap/0.9}}loc='{post_url}']")
            
            if not existing_url:
                # Create new URL element
                url_elem = ET.SubElement(root, "{http://www.sitemaps.org/schemas/sitemap/0.9}url")
                
                loc_elem = ET.SubElement(url_elem, "{http://www.sitemaps.org/schemas/sitemap/0.9}loc")
                loc_elem.text = post_url
                
                lastmod_elem = ET.SubElement(url_elem, "{http://www.sitemaps.org/schemas/sitemap/0.9}lastmod")
                lastmod_elem.text = post_metadata['date'][:10]  # Just the date part
                
                changefreq_elem = ET.SubElement(url_elem, "{http://www.sitemaps.org/schemas/sitemap/0.9}changefreq")
                changefreq_elem.text = "monthly"
                
                priority_elem = ET.SubElement(url_elem, "{http://www.sitemaps.org/schemas/sitemap/0.9}priority")
                priority_elem.text = "0.7"
                
                tree.write(self.sitemap_file, encoding='utf-8', xml_declaration=True)
                print(f"✓ Added to sitemap.xml: {post_metadata['title']}")
        except Exception as e:
            print(f"⚠ Warning: Could not update sitemap.xml: {e}")
    
    def update_rss(self, post_metadata: Dict):
        """Add post to RSS feed"""
        try:
            tree = ET.parse(self.rss_file)
            root = tree.getroot()
            channel = root.find('channel')
            
            # Check if item already exists
            post_link = f"https://astroaura.me/blog/posts/{post_metadata['slug']}.html"
            existing_item = channel.find(f".//item[link='{post_link}']")
            
            if not existing_item:
                # Create new item element
                item = ET.SubElement(channel, 'item')
                
                title_elem = ET.SubElement(item, 'title')
                title_elem.text = post_metadata['title']
                
                link_elem = ET.SubElement(item, 'link')
                link_elem.text = post_link
                
                guid_elem = ET.SubElement(item, 'guid')
                guid_elem.set('isPermaLink', 'true')
                guid_elem.text = post_link
                
                desc_elem = ET.SubElement(item, 'description')
                desc_elem.text = post_metadata['meta_description'][:200] + "..." if len(post_metadata['meta_description']) > 200 else post_metadata['meta_description']
                
                pubdate_elem = ET.SubElement(item, 'pubDate')
                # Convert ISO date to RSS date format
                try:
                    dt = datetime.datetime.fromisoformat(post_metadata['date'].replace('Z', '+00:00'))
                    pubdate_elem.text = dt.strftime('%a, %d %b %Y %H:%M:%S %z')
                except:
                    pubdate_elem.text = datetime.datetime.utcnow().strftime('%a, %d %b %Y %H:%M:%S GMT')
                
                # Update lastBuildDate
                lastbuild = channel.find('lastBuildDate')
                if lastbuild is not None:
                    lastbuild.text = datetime.datetime.utcnow().strftime('%a, %d %b %Y %H:%M:%S GMT')
                
                tree.write(self.rss_file, encoding='utf-8', xml_declaration=True)
                print(f"✓ Added to RSS feed: {post_metadata['title']}")
        except Exception as e:
            print(f"⚠ Warning: Could not update RSS feed: {e}")
    
    def register_new_post(self, html_file_path: str):
        """Register a new blog post and update all tracking files"""
        html_path = Path(html_file_path)
        if not html_path.exists():
            print(f"❌ File not found: {html_file_path}")
            return False
        
        # Extract slug from filename
        slug = html_path.stem
        
        # Read HTML content
        with open(html_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        # Extract metadata
        post_metadata = self.extract_metadata_from_html(html_content, slug)
        
        # Update all tracking files
        self.add_post_to_index(html_file_path, post_metadata)
        self.update_sitemap(post_metadata)
        self.update_rss(post_metadata)
        
        print(f"🎉 Successfully registered new blog post: {post_metadata['title']}")
        return True
    
    def scan_and_sync_all_posts(self):
        """Scan all HTML files in posts directory and sync with index"""
        if not self.posts_dir.exists():
            print(f"❌ Posts directory not found: {self.posts_dir}")
            return
        
        html_files = list(self.posts_dir.glob("*.html"))
        print(f"📝 Found {len(html_files)} blog post files")
        
        for html_file in html_files:
            print(f"Processing: {html_file.name}")
            self.register_new_post(str(html_file))
        
        print(f"✅ Sync complete! Processed {len(html_files)} blog posts")

def main():
    """Command line interface"""
    import sys
    
    generator = BlogPostGenerator()
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        if command == "register" and len(sys.argv) > 2:
            # Register a specific post
            html_file = sys.argv[2]
            generator.register_new_post(html_file)
        elif command == "sync":
            # Sync all posts
            generator.scan_and_sync_all_posts()
        else:
            print("Usage:")
            print("  python generate_blog_post.py register <html_file>")
            print("  python generate_blog_post.py sync")
    else:
        print("Usage:")
        print("  python generate_blog_post.py register <html_file>")
        print("  python generate_blog_post.py sync")

if __name__ == "__main__":
    main()