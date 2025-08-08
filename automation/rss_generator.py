#!/usr/bin/env python3
"""
AstroAura RSS Feed Generator
Generates RSS/Atom feeds for the blog posts
"""

import json
import xml.etree.ElementTree as ET
from datetime import datetime
from pathlib import Path
from urllib.parse import quote
import re

class RSSFeedGenerator:
    def __init__(self, base_path: str = None):
        self.base_path = Path(base_path) if base_path else Path(__file__).parent.parent
        self.blog_path = self.base_path / "blog"
        self.posts_path = self.blog_path / "posts"
        
        # RSS Configuration
        self.config = {
            "site_url": "https://astroaura.me",
            "blog_url": "https://astroaura.me/blog",
            "feed_title": "AstroAura Cosmic Insights Blog",
            "feed_description": "AI-powered astrology insights, cosmic weather updates, and spiritual guidance from the world's first multilingual astrology app.",
            "feed_language": "en-US",
            "feed_author": "AstroAura AI Cosmic Team",
            "feed_email": "cosmic@astroaura.me",
            "feed_category": "Lifestyle/Spirituality",
            "max_posts": 50
        }
    
    def load_posts_index(self):
        """Load the posts index"""
        index_file = self.blog_path / "posts_index.json"
        
        if index_file.exists():
            with open(index_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data.get("posts", [])
        return []
    
    def clean_html(self, text):
        """Remove HTML tags from text"""
        clean = re.compile('<.*?>')
        return re.sub(clean, '', text)
    
    def generate_rss_feed(self):
        """Generate RSS 2.0 feed"""
        posts = self.load_posts_index()[:self.config["max_posts"]]
        
        # Create RSS structure
        rss = ET.Element("rss", version="2.0")
        rss.set("xmlns:atom", "http://www.w3.org/2005/Atom")
        rss.set("xmlns:content", "http://purl.org/rss/1.0/modules/content/")
        
        channel = ET.SubElement(rss, "channel")
        
        # Channel information
        ET.SubElement(channel, "title").text = self.config["feed_title"]
        ET.SubElement(channel, "link").text = self.config["blog_url"]
        ET.SubElement(channel, "description").text = self.config["feed_description"]
        ET.SubElement(channel, "language").text = self.config["feed_language"]
        ET.SubElement(channel, "lastBuildDate").text = datetime.now().strftime("%a, %d %b %Y %H:%M:%S %z")
        ET.SubElement(channel, "generator").text = "AstroAura Blog Automation System"
        ET.SubElement(channel, "category").text = self.config["feed_category"]
        
        # Self-referencing atom link
        atom_link = ET.SubElement(channel, "atom:link")
        atom_link.set("href", f"{self.config['site_url']}/blog/feed.xml")
        atom_link.set("rel", "self")
        atom_link.set("type", "application/rss+xml")
        
        # Add posts as items
        for post in posts:
            item = ET.SubElement(channel, "item")
            
            ET.SubElement(item, "title").text = post.get("title", "")
            ET.SubElement(item, "link").text = f"{self.config['blog_url']}/posts/{post.get('slug', '')}.html"
            ET.SubElement(item, "description").text = post.get("meta_description", "")
            ET.SubElement(item, "author").text = f"{self.config['feed_email']} ({post.get('author', self.config['feed_author'])})"
            
            # Format publication date
            pub_date = datetime.fromisoformat(post.get("date", datetime.now().isoformat()))
            ET.SubElement(item, "pubDate").text = pub_date.strftime("%a, %d %b %Y %H:%M:%S %z")
            
            # GUID
            guid = ET.SubElement(item, "guid")
            guid.text = f"{self.config['blog_url']}/posts/{post.get('slug', '')}.html"
            guid.set("isPermaLink", "true")
            
            # Categories (keywords as categories)
            for keyword in post.get("keywords", [])[:5]:
                category = ET.SubElement(item, "category")
                category.text = keyword
        
        return rss
    
    def generate_atom_feed(self):
        """Generate Atom 1.0 feed"""
        posts = self.load_posts_index()[:self.config["max_posts"]]
        
        # Create Atom structure
        feed = ET.Element("feed")
        feed.set("xmlns", "http://www.w3.org/2005/Atom")
        
        # Feed information
        ET.SubElement(feed, "title").text = self.config["feed_title"]
        ET.SubElement(feed, "subtitle").text = self.config["feed_description"]
        
        # Links
        link_alternate = ET.SubElement(feed, "link")
        link_alternate.set("href", self.config["blog_url"])
        link_alternate.set("rel", "alternate")
        link_alternate.set("type", "text/html")
        
        link_self = ET.SubElement(feed, "link")
        link_self.set("href", f"{self.config['site_url']}/blog/atom.xml")
        link_self.set("rel", "self")
        link_self.set("type", "application/atom+xml")
        
        ET.SubElement(feed, "id").text = self.config["blog_url"]
        ET.SubElement(feed, "updated").text = datetime.now().isoformat() + "Z"
        
        # Author
        author = ET.SubElement(feed, "author")
        ET.SubElement(author, "name").text = self.config["feed_author"]
        ET.SubElement(author, "email").text = self.config["feed_email"]
        
        # Generator
        generator = ET.SubElement(feed, "generator")
        generator.text = "AstroAura Blog Automation System"
        generator.set("version", "1.0")
        
        # Add posts as entries
        for post in posts:
            entry = ET.SubElement(feed, "entry")
            
            ET.SubElement(entry, "title").text = post.get("title", "")
            
            # Links
            entry_link = ET.SubElement(entry, "link")
            entry_link.set("href", f"{self.config['blog_url']}/posts/{post.get('slug', '')}.html")
            entry_link.set("rel", "alternate")
            entry_link.set("type", "text/html")
            
            ET.SubElement(entry, "id").text = f"{self.config['blog_url']}/posts/{post.get('slug', '')}.html"
            
            # Dates
            pub_date = datetime.fromisoformat(post.get("date", datetime.now().isoformat()))
            ET.SubElement(entry, "published").text = pub_date.isoformat() + "Z"
            ET.SubElement(entry, "updated").text = pub_date.isoformat() + "Z"
            
            # Summary
            summary = ET.SubElement(entry, "summary")
            summary.text = post.get("meta_description", "")
            summary.set("type", "text")
            
            # Author
            entry_author = ET.SubElement(entry, "author")
            ET.SubElement(entry_author, "name").text = post.get("author", self.config["feed_author"])
            
            # Categories
            for keyword in post.get("keywords", [])[:5]:
                category = ET.SubElement(entry, "category")
                category.set("term", keyword)
                category.set("label", keyword.title())
        
        return feed
    
    def save_feed(self, feed_element, filename):
        """Save feed to file with proper formatting"""
        # Create XML declaration and pretty format
        xml_str = ET.tostring(feed_element, encoding='unicode', method='xml')
        
        # Add XML declaration
        xml_declaration = '<?xml version="1.0" encoding="UTF-8"?>\n'
        formatted_xml = xml_declaration + xml_str
        
        # Save to file
        feed_path = self.blog_path / filename
        with open(feed_path, 'w', encoding='utf-8') as f:
            f.write(formatted_xml)
        
        return feed_path
    
    def generate_json_feed(self):
        """Generate JSON Feed 1.1"""
        posts = self.load_posts_index()[:self.config["max_posts"]]
        
        json_feed = {
            "version": "https://jsonfeed.org/version/1.1",
            "title": self.config["feed_title"],
            "description": self.config["feed_description"],
            "home_page_url": self.config["blog_url"],
            "feed_url": f"{self.config['site_url']}/blog/feed.json",
            "language": self.config["feed_language"],
            "authors": [
                {
                    "name": self.config["feed_author"],
                    "email": self.config["feed_email"]
                }
            ],
            "items": []
        }
        
        for post in posts:
            pub_date = datetime.fromisoformat(post.get("date", datetime.now().isoformat()))
            
            item = {
                "id": f"{self.config['blog_url']}/posts/{post.get('slug', '')}.html",
                "url": f"{self.config['blog_url']}/posts/{post.get('slug', '')}.html",
                "title": post.get("title", ""),
                "summary": post.get("meta_description", ""),
                "date_published": pub_date.isoformat() + "Z",
                "date_modified": pub_date.isoformat() + "Z",
                "authors": [
                    {
                        "name": post.get("author", self.config["feed_author"])
                    }
                ],
                "tags": post.get("keywords", [])[:5]
            }
            
            json_feed["items"].append(item)
        
        return json_feed
    
    def save_json_feed(self, json_feed, filename):
        """Save JSON feed to file"""
        feed_path = self.blog_path / filename
        with open(feed_path, 'w', encoding='utf-8') as f:
            json.dump(json_feed, f, indent=2, ensure_ascii=False)
        
        return feed_path
    
    def generate_all_feeds(self):
        """Generate all feed formats"""
        results = []
        
        try:
            # Generate RSS feed
            rss_feed = self.generate_rss_feed()
            rss_path = self.save_feed(rss_feed, "feed.xml")
            results.append(("RSS", rss_path))
            
            # Generate Atom feed
            atom_feed = self.generate_atom_feed()
            atom_path = self.save_feed(atom_feed, "atom.xml")
            results.append(("Atom", atom_path))
            
            # Generate JSON feed
            json_feed = self.generate_json_feed()
            json_path = self.save_json_feed(json_feed, "feed.json")
            results.append(("JSON", json_path))
            
            print("✅ RSS feeds generated successfully:")
            for feed_type, path in results:
                print(f"  {feed_type}: {path}")
            
            return results
            
        except Exception as e:
            print(f"❌ Error generating feeds: {e}")
            return []
    
    def update_blog_index_with_feeds(self):
        """Update blog index.html to include feed links"""
        index_file = self.blog_path / "index.html"
        
        if not index_file.exists():
            return
        
        try:
            with open(index_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Feed link elements to add
            feed_links = '''    <!-- RSS/Atom Feeds -->
    <link rel="alternate" type="application/rss+xml" title="AstroAura Blog RSS Feed" href="feed.xml">
    <link rel="alternate" type="application/atom+xml" title="AstroAura Blog Atom Feed" href="atom.xml">
    <link rel="alternate" type="application/json" title="AstroAura Blog JSON Feed" href="feed.json">'''
            
            # Check if feed links already exist
            if 'application/rss+xml' in content:
                return
            
            # Insert feed links in head section
            if '</head>' in content:
                content = content.replace('</head>', f'{feed_links}\n</head>')
                
                with open(index_file, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                print("✅ Updated blog index with feed links")
            
        except Exception as e:
            print(f"❌ Error updating blog index: {e}")

def main():
    """Main function for command line usage"""
    import argparse
    
    parser = argparse.ArgumentParser(description='AstroAura RSS Feed Generator')
    parser.add_argument('--generate', action='store_true', help='Generate all feed formats')
    parser.add_argument('--update-index', action='store_true', help='Update blog index with feed links')
    
    args = parser.parse_args()
    
    generator = RSSFeedGenerator()
    
    if args.generate or not any(vars(args).values()):
        generator.generate_all_feeds()
    
    if args.update_index:
        generator.update_blog_index_with_feeds()

if __name__ == "__main__":
    main()