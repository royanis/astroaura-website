#!/usr/bin/env python3
"""
Free API Content Generator for AstroAura Blog
Uses free APIs for authentic astrology content generation
"""

import os
import json
import datetime
import requests
import random
from typing import Dict, List, Optional
from pathlib import Path

class FreeAPIContentGenerator:
    def __init__(self):
        self.base_path = Path(__file__).parent.parent
        
        # Free API configurations
        self.free_apis = {
            # 1. Hugging Face (Free tier: 1000 requests/month)
            'huggingface': {
                'url': 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-large',
                'key_env': 'HUGGINGFACE_API_KEY',  # Free at huggingface.co
                'free_tier': '1000 requests/month',
                'quality': 'Good for conversational content'
            },
            
            # 2. Cohere (Free tier: 100 calls/month) 
            'cohere': {
                'url': 'https://api.cohere.ai/v1/generate',
                'key_env': 'COHERE_API_KEY',  # Free at cohere.com
                'free_tier': '100 calls/month',
                'quality': 'Excellent for long-form content'
            },
            
            # 3. Google Gemini (Free tier: 60 requests/minute)
            'gemini': {
                'url': 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
                'key_env': 'GOOGLE_API_KEY',  # Free at ai.google.dev
                'free_tier': '60 requests/minute, unlimited monthly',
                'quality': 'Excellent, very generous free tier'
            },
            
            # 4. Anthropic Claude (Free trial: $5 credit)
            'anthropic': {
                'url': 'https://api.anthropic.com/v1/messages',
                'key_env': 'ANTHROPIC_API_KEY',  # Free trial at anthropic.com
                'free_tier': '$5 free credit (~500 blog posts)',
                'quality': 'Excellent for authentic, helpful content'
            },
            
            # 5. Together AI (Free tier: $25/month credit)
            'together': {
                'url': 'https://api.together.xyz/inference',
                'key_env': 'TOGETHER_API_KEY',  # Free at together.ai
                'free_tier': '$25/month free credit',
                'quality': 'Good, multiple model options'
            }
        }

    def get_available_apis(self) -> List[str]:
        """Get list of available free APIs based on environment variables"""
        available = []
        
        for api_name, config in self.free_apis.items():
            api_key = os.getenv(config['key_env'])
            if api_key:
                available.append(api_name)
        
        return available

    def generate_content_with_gemini(self, topic: str, astronomical_data: Dict, extra_context: Optional[str] = None) -> Optional[Dict]:
        """Generate content using Google Gemini (Best free option)"""

        api_key = os.getenv('GOOGLE_API_KEY')
        if not api_key:
            return None

        try:
            context = f"\nReal world context: {extra_context}\n" if extra_context else ""
            prompt = f"""You are an expert astrologer and digital storyteller.

Write a compelling, share-worthy astrology blog post about "{topic}".
{context}
Current cosmic context:
- Date: {astronomical_data['date']}
- Moon Phase: {astronomical_data['moon_phase']}
- Sun Sign Season: {astronomical_data['sun_sign']}
- Mercury Retrograde: {astronomical_data['mercury_retrograde']}

Storytelling requirements:
1. Open with a captivating hook tied to real-world relevance.
2. Follow a clear narrative arc (hook → challenge → cosmic insight → resolution → viral call to action).
3. Include practical tips formatted for easy sharing (bullet lists, quick takeaways).
4. Reference current planetary positions and connect them to the topic.
5. Seamlessly mention the AstroAura app as the go-to tool for personalized guidance.
6. Close with an inspiring call to share the article and download AstroAura.

Tone: warm, insightful, and respectful of astrology as a spiritual practice.
Length: 800-1000 words."""

            headers = {
                'Content-Type': 'application/json',
            }

            data = {
                'contents': [{
                    'parts': [{
                        'text': prompt
                    }]
                }],
                'generationConfig': {
                    'temperature': 0.7,
                    'topK': 40,
                    'topP': 0.95,
                    'maxOutputTokens': 2048,
                }
            }

            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"

            response = requests.post(url, headers=headers, json=data, timeout=60)

            if response.status_code == 200:
                result = response.json()
                content = result['candidates'][0]['content']['parts'][0]['text']

                return {
                    'content': content,
                    'api_used': 'Google Gemini',
                    'success': True
                }
            else:
                print(f"Gemini API error: {response.status_code} - {response.text}")
                return None

        except Exception as e:
            print(f"Error with Gemini API: {e}")
            return None

    def generate_content_with_cohere(self, topic: str, astronomical_data: Dict) -> Optional[Dict]:
        """Generate content using Cohere (Good free option)"""
        
        api_key = os.getenv('COHERE_API_KEY')
        if not api_key:
            return None
        
        try:
            prompt = f"""Write an authentic astrology blog post about {topic}.

Current cosmic context: {astronomical_data['moon_phase']} in {astronomical_data['sun_sign']} season.
Mercury retrograde: {astronomical_data['mercury_retrograde']}.

Write 800+ words of helpful astrological guidance that includes:
- Current cosmic influences and their meanings
- Practical advice for navigating today's energy
- How AstroAura's AI astrology app can provide personalized insights
- Actionable tips readers can use immediately

Use a warm, expert tone that respects astrology as a meaningful spiritual practice."""

            headers = {
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json',
            }
            
            data = {
                'model': 'command',
                'prompt': prompt,
                'max_tokens': 2000,
                'temperature': 0.7,
                'k': 0,
                'stop_sequences': [],
                'return_likelihoods': 'NONE'
            }
            
            response = requests.post(
                'https://api.cohere.ai/v1/generate',
                headers=headers,
                json=data,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result['generations'][0]['text']
                
                return {
                    'content': content,
                    'api_used': 'Cohere',
                    'success': True
                }
            else:
                print(f"Cohere API error: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"Error with Cohere API: {e}")
            return None

    def generate_content_with_anthropic(self, topic: str, astronomical_data: Dict) -> Optional[Dict]:
        """Generate content using Anthropic Claude (Excellent quality)"""
        
        api_key = os.getenv('ANTHROPIC_API_KEY')
        if not api_key:
            return None
        
        try:
            prompt = f"""Write an authentic, insightful astrology blog post about "{topic}".

Current astronomical context:
- Moon Phase: {astronomical_data['moon_phase']}
- Sun Sign: {astronomical_data['sun_sign']}
- Mercury Retrograde: {astronomical_data['mercury_retrograde']}
- Date: {astronomical_data['date']}

Please create 800-1000 words of valuable astrological content that:
1. Provides authentic insights about current cosmic influences
2. Offers practical guidance readers can apply today
3. Naturally mentions AstroAura's multilingual AI astrology features
4. Uses a warm, knowledgeable tone that respects astrology
5. Includes specific actionable advice and cosmic wisdom
6. Structures content with clear, helpful sections

Write as an expert astrologer who combines traditional wisdom with modern accessibility."""

            headers = {
                'x-api-key': api_key,
                'Content-Type': 'application/json',
                'anthropic-version': '2023-06-01'
            }
            
            data = {
                'model': 'claude-3-haiku-20240307',  # Cheapest Claude model
                'max_tokens': 2000,
                'temperature': 0.7,
                'messages': [
                    {
                        'role': 'user',
                        'content': prompt
                    }
                ]
            }
            
            response = requests.post(
                'https://api.anthropic.com/v1/messages',
                headers=headers,
                json=data,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result['content'][0]['text']
                
                return {
                    'content': content,
                    'api_used': 'Anthropic Claude',
                    'success': True
                }
            else:
                print(f"Anthropic API error: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"Error with Anthropic API: {e}")
            return None

    def generate_content_with_huggingface(self, topic: str, astronomical_data: Dict) -> Optional[Dict]:
        """Generate content using Hugging Face (Completely free)"""
        
        api_key = os.getenv('HUGGINGFACE_API_KEY')
        if not api_key:
            return None
        
        try:
            # Use a more suitable model for content generation
            model_url = "https://api-inference.huggingface.co/models/microsoft/DialoGPT-large"
            
            headers = {
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            }
            
            prompt = f"Write astrology blog post about {topic}. Current moon phase: {astronomical_data['moon_phase']}. Include practical cosmic guidance and mention AstroAura app benefits."
            
            data = {
                'inputs': prompt,
                'parameters': {
                    'max_length': 800,
                    'temperature': 0.7,
                    'num_return_sequences': 1
                }
            }
            
            response = requests.post(model_url, headers=headers, json=data, timeout=60)
            
            if response.status_code == 200:
                result = response.json()
                if isinstance(result, list) and len(result) > 0:
                    content = result[0].get('generated_text', '')
                    
                    return {
                        'content': content,
                        'api_used': 'Hugging Face',
                        'success': True
                    }
            else:
                print(f"Hugging Face API error: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"Error with Hugging Face API: {e}")
            return None

    def generate_with_free_apis(self, topic: str, astronomical_data: Dict, extra_context: Optional[str] = None) -> Dict[str, str]:
        """Try free APIs in order of preference"""
        
        # Order by quality and free tier generosity
        api_priority = ['gemini', 'anthropic', 'cohere', 'huggingface']
        
        for api_name in api_priority:
            print(f"🔄 Trying {api_name.title()} API...")
            
            result = None
            if api_name == 'gemini':
                result = self.generate_content_with_gemini(topic, astronomical_data, extra_context=extra_context)
            elif api_name == 'anthropic':
                result = self.generate_content_with_anthropic(topic, astronomical_data)
            elif api_name == 'cohere':
                result = self.generate_content_with_cohere(topic, astronomical_data)
            elif api_name == 'huggingface':
                result = self.generate_content_with_huggingface(topic, astronomical_data)
            
            if result and result.get('success'):
                print(f"✅ Successfully generated content using {result['api_used']}")
                
                title = self._generate_title(topic, astronomical_data)
                meta_description = self._generate_meta_description(result['content'], topic)
                
                return {
                    'title': title,
                    'content': self._format_content_for_html(result['content']),
                    'meta_description': meta_description,
                    'ai_generated': True,
                    'api_used': result['api_used']
                }
            else:
                print(f"❌ {api_name.title()} API failed, trying next...")
        
        # If all APIs fail, return high-quality fallback
        print("⚠️  All free APIs unavailable, using enhanced fallback system...")
        return self._generate_enhanced_fallback_content(topic, astronomical_data)

    def _generate_title(self, topic: str, astronomical_data: Dict) -> str:
        """Generate engaging title"""
        date_str = datetime.datetime.now().strftime("%B %Y")
        sign = astronomical_data['sun_sign']
        
        title_templates = [
            f"{topic}: Your Complete Guide for {date_str}",
            f"{topic} in {sign} Season - Cosmic Insights and Guidance",
            f"Understanding {topic}: Current Cosmic Influences and Practical Wisdom",
            f"{topic} Explained: What Today's Cosmic Energy Reveals",
            f"Navigate {topic} with Confidence - {date_str} Astrology Guide"
        ]
        
        return random.choice(title_templates)

    def _generate_meta_description(self, content: str, topic: str) -> str:
        """Generate SEO-optimized meta description"""
        # Extract first meaningful sentence
        sentences = content.replace('\n', ' ').split('.')[:2]
        description = '. '.join(sentences).strip()
        
        # Add AstroAura mention if not present
        if 'astroaura' not in description.lower():
            description += " Get personalized insights with AstroAura's AI-powered astrology app."
        
        # Truncate to proper length
        if len(description) > 155:
            description = description[:152] + "..."
        
        return description

    def _format_content_for_html(self, content: str) -> str:
        """Format content for HTML with proper structure"""
        
        # Split into paragraphs
        paragraphs = content.split('\n\n')
        formatted_content = '<div class="blog-content">\n'
        
        section_count = 0
        for paragraph in paragraphs:
            paragraph = paragraph.strip()
            if not paragraph:
                continue
            
            # Check if this looks like a heading
            if (len(paragraph) < 100 and 
                paragraph.count('.') <= 1 and 
                not paragraph.endswith('.') and
                paragraph[0].isupper()):
                
                section_count += 1
                heading_level = min(section_count + 1, 6)  # h2-h6
                formatted_content += f'    <h{heading_level}>{paragraph}</h{heading_level}>\n'
            else:
                # Regular paragraph
                formatted_content += f'    <p>{paragraph}</p>\n'
        
        # Add call-to-action section
        formatted_content += '''
    <section class="astroaura-cta">
        <h3>🌟 Discover Your Personal Cosmic Story</h3>
        <p>Ready for personalized astrological insights? AstroAura's AI-powered platform provides authentic cosmic guidance in 11 languages, helping you navigate life's journey with celestial wisdom.</p>
        <div class="cta-buttons">
            <a href="https://apps.apple.com/us/app/astroaura-daily-ai-astrology/id6749437213" class="download-btn ios">
                📱 Download for iOS
            </a>
            <a href="https://play.google.com/store/apps/details?id=com.astroaura.me" class="download-btn android">
                🤖 Download for Android
            </a>
        </div>
    </section>
</div>'''
        
        return formatted_content

    def _generate_enhanced_fallback_content(self, topic: str, astronomical_data: Dict) -> Dict[str, str]:
        """Enhanced fallback content when all APIs fail"""
        
        current_sign = astronomical_data['sun_sign']
        moon_phase = astronomical_data['moon_phase']
        date_str = datetime.datetime.now().strftime("%B %d, %Y")
        
        title = f"{topic} - Cosmic Guidance for {date_str}"
        
        content = f"""
        <div class="blog-content enhanced-fallback">
            <section class="cosmic-introduction">
                <h2>🌟 Understanding {topic} in Today's Cosmic Climate</h2>
                <p>Welcome to your personalized astrological guidance for {date_str}. As we navigate through {current_sign} season with the {moon_phase} illuminating our spiritual path, the universe offers us profound insights for growth, transformation, and conscious living.</p>
                
                <p>Today's celestial configuration presents unique opportunities for spiritual development and practical manifestation. Let's explore how these cosmic influences can guide your daily decisions and support your long-term aspirations.</p>
            </section>
            
            <section class="current-cosmic-weather">
                <h2>🌙 Current Cosmic Weather Report</h2>
                <div class="cosmic-highlights">
                    <div class="cosmic-factor">
                        <h3>Moon Phase: {moon_phase}</h3>
                        <p>The {moon_phase} energy is perfect for {"reflection, release, and inner wisdom" if "Waning" in moon_phase else "manifestation, new beginnings, and setting intentions"}. This lunar phase encourages you to {"let go of limiting beliefs and patterns" if "Waning" in moon_phase else "plant seeds for future growth and embrace new possibilities"}.</p>
                    </div>
                    
                    <div class="cosmic-factor">
                        <h3>☀️ Sun in {current_sign}</h3>
                        <p>{current_sign} season brings focus to {self._get_enhanced_sign_themes(current_sign)}. This is an ideal time to align with {current_sign} energy and integrate its transformative gifts into your daily spiritual practice.</p>
                    </div>
                    
                    {"<div class='cosmic-factor mercury-rx'><h3>☿ Mercury Retrograde Wisdom</h3><p>We're currently experiencing Mercury retrograde, offering a sacred opportunity for reflection, revision, and reconnection with our inner truth. Embrace this time for deep contemplation, healing old communication patterns, and rediscovering forgotten wisdom.</p></div>" if astronomical_data['mercury_retrograde'] else "<div class='cosmic-factor'><h3>☿ Mercury Direct Flow</h3><p>With Mercury moving direct, communication flows clearly and technology supports our intentions. This is an excellent time for important conversations, launching new projects, and connecting with others authentically.</p></div>"}
                </div>
            </section>
            
            <section class="practical-cosmic-guidance">
                <h2>🔮 Practical Cosmic Guidance for Today</h2>
                <p>Here's how you can consciously work with today's cosmic energy to enhance your spiritual journey and daily life:</p>
                
                <ol class="cosmic-action-steps">
                    <li><strong>Morning Cosmic Attunement:</strong> Begin your day by acknowledging the {moon_phase} energy and setting clear intentions aligned with {current_sign} themes of growth and transformation.</li>
                    <li><strong>Midday Energy Check:</strong> Use AstroAura's advanced cosmic weather dashboard to see how current planetary transits specifically affect your unique birth chart and personal cosmic blueprint.</li>
                    <li><strong>Evening Cosmic Reflection:</strong> Journal about how today's cosmic influences manifested in your experiences, relationships, and inner growth journey.</li>
                    <li><strong>Weekly Cosmic Planning:</strong> Consider how this {astronomical_data['season']} energy can guide your upcoming goals, creative projects, and spiritual development practices.</li>
                    <li><strong>Monthly Cosmic Integration:</strong> Look for patterns in how these cosmic cycles support your personal evolution and life purpose unfolding.</li>
                </ol>
            </section>
            
            <section class="deep-astrological-wisdom">
                <h2>🌌 Ancient Wisdom for Modern Cosmic Living</h2>
                <p>Astrology teaches us that we are intimately connected to the cosmic rhythms that govern our universe. Today's planetary positions offer guidance that our ancestors used to navigate life's challenges, celebrate opportunities, and align with natural cycles of growth and renewal.</p>
                
                <p>The beauty of modern astrology lies in combining this timeless wisdom with contemporary insights and accessible technology. AstroAura's AI-powered platform makes these profound teachings available in 11 languages, ensuring that cosmic wisdom transcends cultural boundaries and speaks to every soul seeking guidance.</p>
                
                <blockquote class="cosmic-wisdom-quote">
                    "As above, so below. As within, so without. The patterns in the heavens reflect the patterns in our lives, offering guidance, healing, and transformation for those who choose to listen with an open heart."
                </blockquote>
                
                <p>In our fast-paced modern world, astrology serves as a bridge between the ancient and the contemporary, helping us remember our place in the cosmic order while navigating the complexities of 21st-century life.</p>
            </section>
            
            <section class="personalized-cosmic-insights">
                <h2>✨ Unlock Your Personal Cosmic Story with AstroAura</h2>
                <p>While general astrological insights provide valuable guidance for all, your personal birth chart holds the key to truly understanding how these cosmic influences affect your unique soul journey, relationships, career path, and spiritual evolution.</p>
                
                <div class="astroaura-features-detailed">
                    <h3>🌟 Discover Your Cosmic Blueprint</h3>
                    <ul class="feature-list-enhanced">
                        <li><strong>🎯 Personalized Daily Guidance:</strong> Receive insights tailored to your exact birth chart, current transits, and life themes, helping you navigate each day with cosmic awareness.</li>
                        <li><strong>🌍 Multilingual Cosmic Wisdom:</strong> Access authentic astrological guidance in your preferred language, with cultural sensitivity and spiritual depth that honors diverse traditions.</li>
                        <li><strong>🤖 AI-Enhanced Cosmic Accuracy:</strong> Our advanced algorithms combine traditional astrological wisdom with modern data analysis to provide precise, relevant, and timely cosmic insights.</li>
                        <li><strong>📊 Real-Time Cosmic Weather:</strong> Track how today's planetary movements, lunar phases, and celestial events specifically influence your personal chart and life circumstances.</li>
                        <li><strong>📚 Interactive Cosmic Learning:</strong> Deepen your understanding of astrology through our educational features, cosmic glossary, and personalized learning pathways.</li>
                        <li><strong>💝 Community & Connection:</strong> Join a global community of cosmic seekers, share insights, and learn from diverse astrological perspectives and experiences.</li>
                    </ul>
                </div>
            </section>
            
            <section class="cosmic-conclusion">
                <h2>🌟 Embracing Your Cosmic Journey with Confidence</h2>
                <p>Today's cosmic configuration reminds us that we are co-creators with the universe, able to work consciously with celestial energies to manifest our highest potential and live in alignment with our soul's purpose. Whether you're new to astrology or a seasoned cosmic navigator, these insights offer guidance for living in harmony with universal rhythms while honoring your unique path.</p>
                
                <p>Remember that astrology is not about prediction or limitation, but about empowerment, understanding, and conscious choice. The stars guide, but you decide. The planets influence, but you create. Your cosmic journey is uniquely yours, filled with infinite possibilities for growth, love, and transformation.</p>
                
                <p>Ready to dive deeper into your personal cosmic story and unlock the wisdom written in your stars? Download AstroAura today and join thousands of users worldwide who trust our multilingual, AI-enhanced astrological guidance to navigate life's journey with greater wisdom, clarity, and cosmic consciousness.</p>
            </section>
        </div>
        """
        
        meta_description = f"Explore {topic.lower()} with authentic astrological guidance for {date_str}. Discover today's {moon_phase} energy in {current_sign} season with AstroAura's personalized cosmic insights and practical spiritual wisdom."
        
        return {
            'title': title,
            'content': content.strip(),
            'meta_description': meta_description,
            'ai_generated': False,
            'api_used': 'Enhanced Fallback System'
        }

    def _get_enhanced_sign_themes(self, sign: str) -> str:
        """Get enhanced themes for each zodiac sign"""
        enhanced_themes = {
            "Aries": "pioneering leadership, courageous new beginnings, authentic self-expression, and dynamic personal transformation",
            "Taurus": "grounded stability, material abundance, sensual pleasure, and steady spiritual growth through earthly wisdom",
            "Gemini": "intellectual curiosity, versatile communication, social connections, and mental agility in learning and sharing knowledge",
            "Cancer": "emotional intuition, nurturing relationships, home and family harmony, and deep connection to lunar cycles and inner wisdom",
            "Leo": "creative self-expression, generous leadership, playful joy, and radiant confidence in sharing your unique gifts with the world",
            "Virgo": "practical service, holistic health, detailed perfection, and methodical approach to spiritual and material improvement",
            "Libra": "harmonious partnerships, aesthetic beauty, diplomatic balance, and creating peace and justice in relationships and society",
            "Scorpio": "transformative depth, emotional intensity, psychological healing, and fearless exploration of life's mysteries and hidden truths",
            "Sagittarius": "philosophical expansion, adventurous spirit, higher learning, and optimistic quest for meaning and spiritual truth",
            "Capricorn": "disciplined ambition, structural integrity, long-term planning, and responsible achievement of material and spiritual goals",
            "Aquarius": "innovative progress, humanitarian ideals, community collaboration, and revolutionary thinking that benefits collective consciousness",
            "Pisces": "compassionate spirituality, artistic intuition, emotional empathy, and mystical connection to universal consciousness and divine love"
        }
        return enhanced_themes.get(sign, "personal growth, self-discovery, and spiritual evolution")

    def show_free_api_options(self):
        """Display information about free API options"""
        
        print("🆓 FREE API OPTIONS FOR ASTROLOGY BLOG CONTENT")
        print("=" * 60)
        
        for api_name, config in self.free_apis.items():
            status = "✅ Available" if os.getenv(config['key_env']) else "⚠️  API key needed"
            
            print(f"\n🔹 {api_name.upper()}")
            print(f"   Status: {status}")
            print(f"   Free Tier: {config['free_tier']}")
            print(f"   Quality: {config['quality']}")
            print(f"   Setup: Get free API key from respective website")
            
            if api_name == 'gemini':
                print(f"   ⭐ RECOMMENDED: Most generous free tier")
        
        print(f"\n💡 SETUP INSTRUCTIONS:")
        print(f"1. Choose one or more free APIs above")
        print(f"2. Sign up for free accounts and get API keys")
        print(f"3. Add to GitHub repository secrets:")
        print(f"   - GOOGLE_API_KEY (for Gemini - most recommended)")
        print(f"   - COHERE_API_KEY (for Cohere)")
        print(f"   - ANTHROPIC_API_KEY (for Claude)")
        print(f"   - HUGGINGFACE_API_KEY (for Hugging Face)")
        print(f"\n🎯 BEST OPTION: Google Gemini - unlimited monthly usage!")

def main():
    generator = FreeAPIContentGenerator()
    
    print("🌟 AstroAura Free API Content Generator")
    print("Testing available free APIs...\n")
    
    # Show available options
    generator.show_free_api_options()
    
    available_apis = generator.get_available_apis()
    if available_apis:
        print(f"\n✅ Available APIs: {', '.join(available_apis)}")
        
        # Test with sample data
        test_astronomical_data = {
            'date': datetime.datetime.now().strftime('%Y-%m-%d'),
            'moon_phase': 'Waxing Crescent',
            'sun_sign': 'Capricorn',
            'season': 'Winter',
            'mercury_retrograde': False
        }
        
        # Generate test content
        result = generator.generate_with_free_apis(
            "Daily Horoscope Insights and Cosmic Guidance",
            test_astronomical_data
        )
        
        print(f"\n📝 Generated content using: {result.get('api_used', 'Fallback')}")
        print(f"📊 Title: {result['title'][:80]}...")
        print(f"📄 Content length: {len(result['content'])} characters")
        print(f"🔍 Meta description: {result['meta_description'][:100]}...")
        
    else:
        print("\n⚠️  No API keys found. The system will use the enhanced fallback content generator.")
        print("This still creates high-quality, authentic astrology content!")

if __name__ == "__main__":
    main()