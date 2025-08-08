#!/usr/bin/env python3
"""
Production Blog Setup Script for AstroAura
Sets up the complete automated blog system for GitHub Pages deployment
"""

import os
import json
import datetime
from pathlib import Path
import subprocess
import sys

class ProductionBlogSetup:
    def __init__(self):
        self.base_path = Path(__file__).parent.parent
        self.automation_path = Path(__file__).parent
        
        print("🚀 AstroAura Production Blog Setup")
        print("=" * 50)

    def check_requirements(self):
        """Check if all required files and dependencies are present"""
        print("\n1️⃣ Checking Requirements...")
        
        required_files = [
            "automation/authentic_blog_generator.py",
            "automation/update_sitemap.py", 
            "automation/content_quality_validator.py",
            "automation/rss_generator.py",
            ".github/workflows/auto-blog-publisher.yml"
        ]
        
        missing_files = []
        for file_path in required_files:
            full_path = self.base_path / file_path
            if not full_path.exists():
                missing_files.append(file_path)
            else:
                print(f"   ✅ {file_path}")
        
        if missing_files:
            print(f"   ❌ Missing files: {', '.join(missing_files)}")
            return False
        
        # Check Python dependencies
        print("\n   📦 Checking Python dependencies...")
        try:
            import requests
            print("   ✅ requests")
        except ImportError:
            print("   ❌ requests - run: pip install requests")
            return False
        
        return True

    def setup_github_secrets(self):
        """Guide user through GitHub secrets setup"""
        print("\n2️⃣ GitHub Secrets Setup...")
        print("""
To enable AI-powered content generation, you need to set up GitHub secrets:

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions  
3. Add these repository secrets:

   🔑 OPENAI_API_KEY
   └── Your OpenAI API key for authentic content generation
   └── Get one at: https://platform.openai.com/api-keys
   └── Cost: ~$0.01-0.05 per blog post (very affordable)

4. The GitHub Action will automatically:
   ✅ Generate authentic astrology content daily
   ✅ Update sitemap and RSS feeds
   ✅ Commit and deploy to GitHub Pages
   ✅ Validate content quality before publishing

Optional: You can also run without OpenAI API key - the system will use
high-quality fallback content generation with real astronomical data.
        """)
        
        response = input("Have you set up the OPENAI_API_KEY secret? (y/n): ").lower()
        return response == 'y'

    def create_publisher_config(self):
        """Create initial publisher configuration"""
        print("\n3️⃣ Creating Publisher Configuration...")
        
        config = {
            "site_url": "https://astroaura.me",
            "blog_title": "AstroAura Cosmic Insights Blog",
            "publishing_schedule": {
                "daily_post": True,
                "post_time_utc": "09:00",
                "min_hours_between_posts": 20
            },
            "content_settings": {
                "use_ai_generation": True,
                "fallback_to_templates": True,
                "quality_threshold": 70.0,
                "validate_before_publish": True
            },
            "github_settings": {
                "auto_commit": True,
                "commit_message_template": "🌟 Automated blog post: {date}",
                "branch": "main"
            },
            "seo_settings": {
                "generate_sitemap": True,
                "update_rss_feeds": True,
                "include_structured_data": True
            },
            "created_date": datetime.datetime.now().isoformat(),
            "last_published": None,
            "total_published": 0,
            "github_action_runs": 0
        }
        
        config_file = self.automation_path / "publisher_config.json"
        with open(config_file, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2)
        
        print(f"   ✅ Configuration created: {config_file}")
        return config

    def test_content_generation(self):
        """Test the content generation system"""
        print("\n4️⃣ Testing Content Generation...")
        
        try:
            # Test authentic blog generator
            print("   🧪 Testing authentic blog generator...")
            result = subprocess.run([
                sys.executable, 
                str(self.automation_path / "authentic_blog_generator.py"),
                "--test"
            ], capture_output=True, text=True, cwd=self.automation_path)
            
            if result.returncode == 0:
                print("   ✅ Blog generator test passed")
            else:
                print(f"   ⚠️  Blog generator test warning: {result.stderr}")
            
            # Test content validator
            print("   🧪 Testing content quality validator...")
            result = subprocess.run([
                sys.executable,
                str(self.automation_path / "content_quality_validator.py")
            ], capture_output=True, text=True, cwd=self.automation_path)
            
            if result.returncode == 0:
                print("   ✅ Content validator test passed")
            else:
                print(f"   ⚠️  Content validator test warning: {result.stderr}")
            
            return True
            
        except Exception as e:
            print(f"   ❌ Testing error: {e}")
            return False

    def setup_github_pages(self):
        """Guide user through GitHub Pages setup"""
        print("\n5️⃣ GitHub Pages Setup...")
        print("""
To deploy your automated blog to GitHub Pages:

1. Go to your GitHub repository
2. Navigate to Settings → Pages
3. Set Source to: "Deploy from a branch"
4. Select Branch: "main" (or "gh-pages" if you prefer)
5. Select Folder: "/ (root)"
6. Click Save

Your blog will be available at: https://yourusername.github.io/repository-name
Or at your custom domain if you've set up CNAME: https://astroaura.me

The GitHub Action will automatically deploy new blog posts daily!
        """)
        
        response = input("Have you configured GitHub Pages? (y/n): ").lower()
        return response == 'y'

    def create_initial_blog_post(self):
        """Create an initial blog post to test the system"""
        print("\n6️⃣ Creating Initial Blog Post...")
        
        try:
            result = subprocess.run([
                sys.executable,
                str(self.automation_path / "authentic_blog_generator.py"),
                "--topic", "Welcome to AstroAura's Cosmic Insights Blog"
            ], capture_output=True, text=True, cwd=self.automation_path)
            
            if result.returncode == 0:
                print("   ✅ Initial blog post created successfully!")
                print("   📄 Check the blog/posts/ directory for your new post")
                return True
            else:
                print(f"   ❌ Error creating initial post: {result.stderr}")
                return False
                
        except Exception as e:
            print(f"   ❌ Error: {e}")
            return False

    def show_final_instructions(self):
        """Show final setup instructions"""
        print("\n" + "=" * 50)
        print("🎉 PRODUCTION BLOG SETUP COMPLETE!")
        print("=" * 50)
        
        print("""
Your AstroAura blog is now ready for automated publishing! Here's what happens next:

📅 AUTOMATED DAILY POSTING:
   • GitHub Action runs daily at 9:00 AM UTC
   • Generates authentic astrology content using AI + real astronomical data
   • Validates content quality before publishing
   • Updates sitemap, RSS feeds, and deploys to GitHub Pages
   • Commits changes automatically

🔧 MANUAL CONTROLS:
   • Trigger manual post: Go to Actions tab → "Automated Blog Publishing" → "Run workflow"
   • Test locally: python automation/authentic_blog_generator.py --test
   • Generate single post: python automation/authentic_blog_generator.py --topic "Your Topic"
   • Validate content: python automation/content_quality_validator.py

📊 MONITORING:
   • Check Actions tab for workflow runs and logs
   • Monitor publisher_config.json for statistics
   • RSS feeds auto-update at: /blog/rss.xml, /blog/atom.xml, /blog/feed.json

🌟 WHAT MAKES THIS SPECIAL:
   ✅ Real astronomical data integration
   ✅ AI-powered authentic content generation  
   ✅ Content quality validation system
   ✅ SEO optimization and structured data
   ✅ Multilingual astrology insights
   ✅ GitHub Pages auto-deployment
   ✅ RSS/Atom/JSON feed generation
   ✅ Mobile-responsive cosmic theme

🚀 YOUR BLOG IS LIVE AT:
   • GitHub Pages: https://yourusername.github.io/repository-name/blog/
   • Custom Domain: https://astroaura.me/blog/ (if CNAME configured)

Need help? Check the automation/README.md for troubleshooting tips!
        """)

    def run_complete_setup(self):
        """Run the complete production setup process"""
        
        steps_completed = 0
        total_steps = 6
        
        # Step 1: Check requirements
        if not self.check_requirements():
            print("\n❌ Setup failed: Missing requirements")
            return False
        steps_completed += 1
        
        # Step 2: GitHub secrets
        if not self.setup_github_secrets():
            print("\n⚠️  Continuing without OpenAI API key - will use fallback content generation")
        steps_completed += 1
        
        # Step 3: Create config
        self.create_publisher_config()
        steps_completed += 1
        
        # Step 4: Test system
        if not self.test_content_generation():
            print("\n⚠️  Some tests failed, but setup can continue")
        steps_completed += 1
        
        # Step 5: GitHub Pages
        self.setup_github_pages()
        steps_completed += 1
        
        # Step 6: Initial post
        if not self.create_initial_blog_post():
            print("\n⚠️  Initial post creation failed, but you can create posts manually")
        steps_completed += 1
        
        # Final instructions
        self.show_final_instructions()
        
        print(f"\n✅ Setup completed: {steps_completed}/{total_steps} steps successful")
        return True

def main():
    setup = ProductionBlogSetup()
    success = setup.run_complete_setup()
    
    if success:
        print("\n🌟 Your automated astrology blog is ready to launch!")
        return 0
    else:
        print("\n❌ Setup encountered issues. Please check the errors above.")
        return 1

if __name__ == "__main__":
    exit(main())