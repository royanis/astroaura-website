#!/usr/bin/env python3
"""
AstroAura Blog Automation Setup Script
Sets up the automated blog publishing system
"""

import os
import sys
import json
import subprocess
from pathlib import Path

class BlogAutomationSetup:
    def __init__(self):
        self.base_path = Path(__file__).parent.parent
        self.automation_path = Path(__file__).parent
        
    def install_requirements(self):
        """Install required Python packages"""
        print("📦 Installing Python requirements...")
        
        requirements_file = self.automation_path / "requirements.txt"
        
        try:
            subprocess.check_call([
                sys.executable, "-m", "pip", "install", "-r", str(requirements_file)
            ])
            print("✅ Requirements installed successfully")
            return True
        except subprocess.CalledProcessError as e:
            print(f"❌ Error installing requirements: {e}")
            return False
    
    def create_blog_directories(self):
        """Create necessary blog directories"""
        print("📁 Creating blog directory structure...")
        
        directories = [
            self.base_path / "blog",
            self.base_path / "blog" / "posts",
            self.base_path / "blog" / "js",
            self.base_path / "styles",
            self.base_path / "assets" / "images" / "blog"
        ]
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
            print(f"  Created: {directory}")
        
        print("✅ Blog directories created")
    
    def setup_cron_job(self):
        """Setup cron job for automated publishing (Linux/Mac)"""
        print("⏰ Setting up automated scheduling...")
        
        if os.name == 'nt':  # Windows
            print("🚧 Windows Task Scheduler setup requires manual configuration")
            print("   Please use the Windows Task Scheduler to run:")
            print(f"   python {self.automation_path / 'auto_publisher.py'} --publish-now")
            return
        
        # Unix-like systems (Linux/Mac)
        cron_command = f"0 9 * * * cd {self.automation_path} && python auto_publisher.py --publish-now"
        
        print("To setup automated daily publishing, add this to your crontab:")
        print(f"  {cron_command}")
        print("\nRun 'crontab -e' and add the above line to publish daily at 9 AM")
    
    def create_sample_config(self):
        """Create sample configuration files"""
        print("⚙️ Creating sample configuration...")
        
        # Blog publisher config
        config = {
            "publishing_schedule": {
                "daily_post": True,
                "post_time": "09:00",
                "timezone": "UTC"
            },
            "content_settings": {
                "posts_per_week": 7,
                "topics_rotation": True,
                "seo_optimization": True
            },
            "notification_settings": {
                "email_notifications": False,
                "webhook_url": None
            },
            "ai_settings": {
                "use_ai_generation": False,
                "ai_provider": "openai",  # or "anthropic"
                "api_key": None
            }
        }
        
        config_file = self.automation_path / "publisher_config.json"
        with open(config_file, 'w') as f:
            json.dump(config, f, indent=2)
        
        print(f"✅ Configuration saved to: {config_file}")
    
    def generate_sample_post(self):
        """Generate a sample blog post to test the system"""
        print("📝 Generating sample blog post...")
        
        try:
            from blog_generator import AstroAuraBlogGenerator
            
            generator = AstroAuraBlogGenerator(str(self.base_path))
            post_filename = generator.generate_and_publish_post("Daily Horoscope Insights")
            
            print(f"✅ Sample post generated: {post_filename}")
            print(f"   View at: {self.base_path}/blog/posts/{post_filename}")
            
        except Exception as e:
            print(f"❌ Error generating sample post: {e}")
    
    def update_main_navigation(self):
        """Update main website navigation to include blog link"""
        print("🔗 Updating website navigation...")
        
        nav_files = [
            self.base_path / "index.html",
            self.base_path / "features.html",
            self.base_path / "about.html",
            self.base_path / "contact.html",
            self.base_path / "privacy.html"
        ]
        
        updated_count = 0
        
        for nav_file in nav_files:
            if nav_file.exists():
                try:
                    with open(nav_file, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # Check if blog link already exists
                    if 'href="blog/' in content or 'href="blog/index.html"' in content:
                        continue
                    
                    # Add blog link after Features
                    if '<a href="features.html">Features</a>' in content:
                        content = content.replace(
                            '<a href="features.html">Features</a>',
                            '<a href="features.html">Features</a></li>\n                    <li><a href="blog/index.html">Blog</a>'
                        )
                        
                        with open(nav_file, 'w', encoding='utf-8') as f:
                            f.write(content)
                        
                        updated_count += 1
                        print(f"  Updated: {nav_file.name}")
                
                except Exception as e:
                    print(f"  Error updating {nav_file.name}: {e}")
        
        if updated_count > 0:
            print(f"✅ Updated navigation in {updated_count} files")
        else:
            print("ℹ️  Navigation already includes blog links")
    
    def run_setup(self):
        """Run the complete setup process"""
        print("🌟 AstroAura Blog Automation Setup")
        print("=" * 50)
        
        steps = [
            ("Installing requirements", self.install_requirements),
            ("Creating directories", self.create_blog_directories),
            ("Creating configuration", self.create_sample_config),
            ("Generating sample post", self.generate_sample_post),
            ("Updating navigation", self.update_main_navigation),
            ("Setting up scheduling", self.setup_cron_job)
        ]
        
        for step_name, step_func in steps:
            print(f"\n{step_name}...")
            try:
                step_func()
            except Exception as e:
                print(f"❌ Error in {step_name}: {e}")
        
        print("\n" + "=" * 50)
        print("🎉 Blog automation setup complete!")
        print("\nNext steps:")
        print("1. Review configuration in automation/publisher_config.json")
        print("2. Test publishing: python automation/auto_publisher.py --publish-now")
        print("3. Setup cron job for automated publishing")
        print("4. Customize blog templates and styling")
        print("5. Configure AI API keys for enhanced content generation")
        
        print(f"\n📂 Blog files location: {self.base_path}/blog/")
        print(f"🤖 Automation scripts: {self.automation_path}/")

def main():
    setup = BlogAutomationSetup()
    setup.run_setup()

if __name__ == "__main__":
    main()