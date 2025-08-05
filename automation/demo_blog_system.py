#!/usr/bin/env python3
"""
AstroAura Blog System Demo
Demonstrates the automated blog publishing system
"""

import sys
import os
from pathlib import Path

# Add current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from blog_generator import AstroAuraBlogGenerator
from auto_publisher import AutoBlogPublisher
from rss_generator import RSSFeedGenerator

def demo_blog_system():
    """Run a complete demonstration of the blog system"""
    
    print("🌟 AstroAura Blog System Demonstration")
    print("=" * 60)
    
    # Initialize components
    print("\n1️⃣ Initializing Blog System Components...")
    generator = AstroAuraBlogGenerator()
    publisher = AutoBlogPublisher()
    rss_gen = RSSFeedGenerator()
    
    print("✅ Blog Generator initialized")
    print("✅ Auto Publisher initialized") 
    print("✅ RSS Generator initialized")
    
    # Generate sample posts
    print("\n2️⃣ Generating Sample Blog Posts...")
    
    sample_topics = [
        "Daily Horoscope Insights",
        "Mercury Retrograde Guide", 
        "Full Moon Spiritual Meanings",
        "Birth Chart Interpretation"
    ]
    
    generated_posts = []
    
    for i, topic in enumerate(sample_topics, 1):
        print(f"\n  📝 Generating post {i}: {topic}")
        try:
            post_filename = generator.generate_and_publish_post(topic)
            generated_posts.append(post_filename)
            print(f"    ✅ Generated: {post_filename}")
        except Exception as e:
            print(f"    ❌ Error: {e}")
    
    # Generate RSS feeds
    print("\n3️⃣ Generating RSS Feeds...")
    try:
        feeds = rss_gen.generate_all_feeds()
        print(f"✅ Generated {len(feeds)} feed formats")
        
        # Update blog index with feed links
        rss_gen.update_blog_index_with_feeds()
        print("✅ Updated blog index with RSS links")
        
    except Exception as e:
        print(f"❌ RSS generation error: {e}")
    
    # Show system statistics
    print("\n4️⃣ System Statistics...")
    try:
        stats = publisher.get_statistics()
        print(f"📊 Total posts published: {stats.get('total_posts_published', 0)}")
        print(f"📅 Last published: {stats.get('last_published', 'Never')}")
        print(f"🤖 Scheduler status: {stats.get('scheduler_status', 'Unknown')}")
    except Exception as e:
        print(f"❌ Stats error: {e}")
    
    # Generate content calendar
    print("\n5️⃣ Generating Content Calendar...")
    try:
        calendar = publisher.generate_content_calendar(7)  # 7 days
        print("📅 7-day content calendar generated:")
        for item in calendar[:3]:  # Show first 3 days
            print(f"  • {item['date']}: {item['topic']}")
        print(f"  ... and {len(calendar)-3} more days")
    except Exception as e:
        print(f"❌ Calendar error: {e}")
    
    # Show file structure
    print("\n6️⃣ Generated File Structure...")
    base_path = Path(__file__).parent.parent
    blog_path = base_path / "blog"
    
    if blog_path.exists():
        print(f"📁 Blog directory: {blog_path}")
        
        # List blog posts
        posts_path = blog_path / "posts"
        if posts_path.exists():
            post_files = list(posts_path.glob("*.html"))
            print(f"📄 Blog posts ({len(post_files)} files):")
            for post_file in post_files[:3]:  # Show first 3
                print(f"  • {post_file.name}")
            if len(post_files) > 3:
                print(f"  ... and {len(post_files)-3} more posts")
        
        # List feed files
        feed_files = list(blog_path.glob("*.xml")) + list(blog_path.glob("*.json"))
        if feed_files:
            print(f"📡 RSS feeds ({len(feed_files)} files):")
            for feed_file in feed_files:
                print(f"  • {feed_file.name}")
    
    # Show next steps
    print("\n" + "=" * 60)
    print("🎉 Blog System Demo Complete!")
    print("\n📋 What was created:")
    print("  ✅ Sample blog posts with full SEO optimization")
    print("  ✅ RSS/Atom/JSON feeds")
    print("  ✅ Blog index page with dynamic loading")
    print("  ✅ Content calendar for future posts")
    print("  ✅ Publisher configuration")
    
    print("\n🚀 Next Steps:")
    print("  1. Visit the blog: open blog/index.html in your browser")
    print("  2. Setup automated publishing: python auto_publisher.py --schedule")
    print("  3. Customize topics in blog_generator.py")
    print("  4. Configure RSS feeds and notifications")
    print("  5. Deploy to your web server")
    
    print(f"\n📂 Files location: {blog_path}")
    print(f"🛠️  Configuration: {Path(__file__).parent}/publisher_config.json")
    
    return {
        "posts_generated": len(generated_posts),
        "feeds_generated": len(feeds) if 'feeds' in locals() else 0,
        "blog_path": str(blog_path)
    }

def test_individual_components():
    """Test individual components separately"""
    
    print("\n🔧 Testing Individual Components")
    print("-" * 40)
    
    # Test blog generator
    print("\n📝 Testing Blog Generator...")
    try:
        generator = AstroAuraBlogGenerator()
        post_data = generator.generate_blog_post_content("Test Topic", ["test", "astrology"])
        print("✅ Blog content generation: PASS")
        print(f"  Generated title: {post_data['title'][:50]}...")
    except Exception as e:
        print(f"❌ Blog content generation: FAIL ({e})")
    
    # Test RSS generator
    print("\n📡 Testing RSS Generator...")
    try:
        rss_gen = RSSFeedGenerator()
        posts = rss_gen.load_posts_index()
        print(f"✅ RSS feed loading: PASS ({len(posts)} posts found)")
    except Exception as e:
        print(f"❌ RSS feed loading: FAIL ({e})")
    
    # Test publisher config
    print("\n⚙️  Testing Publisher Config...")
    try:
        publisher = AutoBlogPublisher()
        config = publisher.config
        print("✅ Publisher configuration: PASS")
        print(f"  Daily posting: {config.get('publishing_schedule', {}).get('daily_post', False)}")
    except Exception as e:
        print(f"❌ Publisher configuration: FAIL ({e})")

def main():
    """Main demonstration function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='AstroAura Blog System Demo')
    parser.add_argument('--full', action='store_true', help='Run full demonstration')
    parser.add_argument('--test', action='store_true', help='Test individual components')
    parser.add_argument('--quick', action='store_true', help='Quick demo with one post')
    
    args = parser.parse_args()
    
    if args.full or not any(vars(args).values()):
        demo_blog_system()
    
    if args.test:
        test_individual_components()
    
    if args.quick:
        print("🌟 Quick Blog System Demo")
        generator = AstroAuraBlogGenerator()
        post_file = generator.generate_and_publish_post("Quick Demo Post")
        print(f"✅ Quick demo complete! Generated: {post_file}")

if __name__ == "__main__":
    main()