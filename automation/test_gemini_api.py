#!/usr/bin/env python3
"""
Test Gemini API integration for AstroAura blog generation
"""

import os
import requests
import json
import datetime

def test_gemini_api():
    """Test Gemini API with your key"""
    
    # Your Gemini API key
    api_key = "AIzaSyBYD419jOezf5R2LPeJGPIr7I2qL07tf00"
    
    print("🧪 Testing Gemini API for AstroAura Blog Generation")
    print("=" * 60)
    
    # Test astronomical data
    astronomical_data = {
        'date': datetime.datetime.now().strftime('%Y-%m-%d'),
        'moon_phase': 'Waxing Crescent',
        'sun_sign': 'Capricorn', 
        'season': 'Winter',
        'mercury_retrograde': False
    }
    
    topic = "Daily Horoscope Insights and Cosmic Guidance"
    
    prompt = f"""Write an authentic, helpful astrology blog post about "{topic}".

Current cosmic context:
- Date: {astronomical_data['date']}
- Moon Phase: {astronomical_data['moon_phase']}
- Sun Sign Season: {astronomical_data['sun_sign']}
- Mercury Retrograde: {astronomical_data['mercury_retrograde']}

Requirements:
1. Write 600-800 words of valuable, authentic astrology content
2. Include practical advice readers can apply today
3. Reference current planetary positions naturally
4. Mention AstroAura app (multilingual AI astrology app) organically
5. Use warm, knowledgeable tone respecting astrology as spiritual practice
6. Include specific cosmic guidance and actionable tips
7. Structure with clear sections and helpful information

Write as an expert astrologer combining ancient wisdom with modern insights."""

    try:
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
        
        print("🔄 Sending request to Gemini API...")
        response = requests.post(url, headers=headers, json=data, timeout=60)
        
        if response.status_code == 200:
            result = response.json()
            content = result['candidates'][0]['content']['parts'][0]['text']
            
            print("✅ SUCCESS! Gemini API is working perfectly!")
            print(f"📊 Generated content length: {len(content)} characters")
            print(f"📝 Word count: ~{len(content.split())} words")
            print("\n🎯 Sample content preview:")
            print("-" * 40)
            print(content[:300] + "..." if len(content) > 300 else content)
            print("-" * 40)
            
            return True
            
        else:
            print(f"❌ API Error: {response.status_code}")
            print(f"Error details: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing Gemini API: {e}")
        return False

def setup_environment_variable():
    """Guide user through setting up environment variable"""
    
    print("\n" + "=" * 60)
    print("🔧 NEXT STEPS - SECURE YOUR API KEY")
    print("=" * 60)
    
    print("""
⚠️  IMPORTANT SECURITY NOTICE:
Your API key should never be hardcoded in files or shared publicly.

🔐 TO SECURE YOUR API KEY:

1. For LOCAL TESTING:
   Add to your terminal session:
   export GOOGLE_API_KEY="AIzaSyBYD419jOezf5R2LPeJGPIr7I2qL07tf00"

2. For GITHUB ACTIONS (RECOMMENDED):
   a) Go to your GitHub repository
   b) Settings → Secrets and variables → Actions  
   c) Click "New repository secret"
   d) Name: GOOGLE_API_KEY
   e) Value: AIzaSyBYD419jOezf5R2LPeJGPIr7I2qL07tf00
   f) Click "Add secret"

3. For PRODUCTION:
   Never commit API keys to your repository!
   Always use environment variables or secrets management.

✅ Once you add the GitHub secret, your automated blog will:
   • Generate authentic astrology content daily using Gemini AI
   • Cost: $0 (completely free with unlimited usage!)
   • Quality: Excellent, contextual astrology insights
   • Automatic: Runs daily at 9:00 AM UTC
""")

if __name__ == "__main__":
    success = test_gemini_api()
    
    if success:
        setup_environment_variable()
        
        print("\n🌟 READY TO LAUNCH!")
        print("Your Gemini API key works perfectly for generating authentic astrology content!")
        print("\nNext: Add the API key as a GitHub secret to enable automated daily blogging.")
    else:
        print("\n❌ API test failed. Please check your API key and try again.")