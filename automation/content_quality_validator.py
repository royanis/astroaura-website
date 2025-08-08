#!/usr/bin/env python3
"""
Content Quality Validator for AstroAura Blog
Validates blog content for quality, authenticity, and SEO optimization
"""

import re
import json
import datetime
from typing import Dict, List, Tuple
from pathlib import Path
from dataclasses import dataclass

@dataclass
class ValidationResult:
    score: float
    issues: List[str]
    warnings: List[str]
    suggestions: List[str]
    passed: bool

class ContentQualityValidator:
    def __init__(self):
        # Quality thresholds
        self.min_word_count = 500
        self.max_word_count = 2500
        self.min_paragraph_count = 5
        self.min_heading_count = 2
        self.max_heading_count = 10
        
        # SEO requirements
        self.min_meta_description_length = 120
        self.max_meta_description_length = 160
        self.min_title_length = 30
        self.max_title_length = 70
        
        # Astrology-specific terms for authenticity check  
        self.astrology_terms = {
            'essential': [
                'astrology', 'horoscope', 'zodiac', 'planet', 'sign', 'chart',
                'moon', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn',
                'cosmic', 'celestial', 'natal', 'birth', 'transit'
            ],
            'advanced': [
                'retrograde', 'conjunction', 'opposition', 'trine', 'square', 'sextile',
                'ascendant', 'descendant', 'midheaven', 'houses', 'aspects',
                'ephemeris', 'orb', 'cusp', 'stellium'
            ],
            'spiritual': [
                'energy', 'intuition', 'spiritual', 'manifestation', 'consciousness',
                'alignment', 'harmony', 'wisdom', 'guidance', 'awakening'
            ]
        }
        
        # Content quality indicators
        self.quality_indicators = [
            'practical advice', 'actionable insights', 'specific dates',
            'personal application', 'real examples', 'current events'
        ]
        
        # Red flags (content to avoid)
        self.red_flags = [
            'generic', 'vague', 'template', 'placeholder', 'lorem ipsum',
            'fake', 'artificial', 'automated', 'low quality'
        ]

    def validate_blog_post(self, title: str, content: str, meta_description: str, 
                          astronomical_data: Dict = None) -> ValidationResult:
        """Validate a complete blog post for quality and authenticity"""
        
        issues = []
        warnings = []
        suggestions = []
        score = 100.0
        
        # Validate title
        title_issues, title_score = self._validate_title(title)
        issues.extend(title_issues)
        score += title_score
        
        # Validate meta description
        meta_issues, meta_score = self._validate_meta_description(meta_description)
        issues.extend(meta_issues)
        score += meta_score
        
        # Validate content structure
        content_issues, content_warnings, content_score = self._validate_content_structure(content)
        issues.extend(content_issues)
        warnings.extend(content_warnings)
        score += content_score
        
        # Validate astrology authenticity
        auth_issues, auth_warnings, auth_score = self._validate_astrology_authenticity(content)
        issues.extend(auth_issues)
        warnings.extend(auth_warnings)
        score += auth_score
        
        # Validate SEO optimization
        seo_warnings, seo_suggestions, seo_score = self._validate_seo_optimization(
            title, content, meta_description
        )
        warnings.extend(seo_warnings)
        suggestions.extend(seo_suggestions)
        score += seo_score
        
        # Validate current relevance
        if astronomical_data:
            relevance_warnings, relevance_score = self._validate_current_relevance(
                content, astronomical_data
            )
            warnings.extend(relevance_warnings)
            score += relevance_score
        
        # Cap score at 100
        score = min(score, 100.0)
        
        # Determine if passed (score >= 70 and no critical issues)
        critical_issues = [issue for issue in issues if 'critical' in issue.lower()]
        passed = score >= 70.0 and len(critical_issues) == 0
        
        return ValidationResult(
            score=score,
            issues=issues,
            warnings=warnings,
            suggestions=suggestions,
            passed=passed
        )

    def _validate_title(self, title: str) -> Tuple[List[str], float]:
        """Validate blog post title"""
        issues = []
        score_adjustment = 0
        
        if not title or not title.strip():
            issues.append("CRITICAL: Title is empty")
            return issues, -50
        
        title_length = len(title)
        
        if title_length < self.min_title_length:
            issues.append(f"Title too short ({title_length} chars, minimum {self.min_title_length})")
            score_adjustment -= 10
        elif title_length > self.max_title_length:
            issues.append(f"Title too long ({title_length} chars, maximum {self.max_title_length})")
            score_adjustment -= 5
        
        # Check for astrology relevance in title
        title_lower = title.lower()
        astro_terms_in_title = sum(1 for term in self.astrology_terms['essential'] 
                                  if term in title_lower)
        
        if astro_terms_in_title == 0:
            issues.append("Title lacks astrology-specific terms")
            score_adjustment -= 10
        elif astro_terms_in_title >= 2:
            score_adjustment += 5
        
        # Check for current date relevance
        current_year = datetime.datetime.now().year
        if str(current_year) in title or any(month in title_lower for month in 
            ['january', 'february', 'march', 'april', 'may', 'june',
             'july', 'august', 'september', 'october', 'november', 'december']):
            score_adjustment += 5
        
        return issues, score_adjustment

    def _validate_meta_description(self, meta_description: str) -> Tuple[List[str], float]:
        """Validate meta description"""
        issues = []
        score_adjustment = 0
        
        if not meta_description or not meta_description.strip():
            issues.append("CRITICAL: Meta description is empty")
            return issues, -30
        
        desc_length = len(meta_description)
        
        if desc_length < self.min_meta_description_length:
            issues.append(f"Meta description too short ({desc_length} chars, minimum {self.min_meta_description_length})")
            score_adjustment -= 10
        elif desc_length > self.max_meta_description_length:
            issues.append(f"Meta description too long ({desc_length} chars, maximum {self.max_meta_description_length})")
            score_adjustment -= 5
        else:
            score_adjustment += 5
        
        # Check for AstroAura mention
        if 'astroaura' in meta_description.lower():
            score_adjustment += 3
        
        return issues, score_adjustment

    def _validate_content_structure(self, content: str) -> Tuple[List[str], List[str], float]:
        """Validate content structure and organization"""
        issues = []
        warnings = []
        score_adjustment = 0
        
        if not content or not content.strip():
            issues.append("CRITICAL: Content is empty")
            return issues, warnings, -50
        
        # Remove HTML tags for word count
        clean_content = re.sub(r'<[^>]+>', ' ', content)
        words = clean_content.split()
        word_count = len(words)
        
        # Validate word count
        if word_count < self.min_word_count:
            issues.append(f"Content too short ({word_count} words, minimum {self.min_word_count})")
            score_adjustment -= 15
        elif word_count > self.max_word_count:
            warnings.append(f"Content might be too long ({word_count} words, recommended maximum {self.max_word_count})")
            score_adjustment -= 5
        else:
            score_adjustment += 10
        
        # Count headings
        heading_count = len(re.findall(r'<h[1-6][^>]*>', content))
        if heading_count < self.min_heading_count:
            issues.append(f"Too few headings ({heading_count}, minimum {self.min_heading_count})")
            score_adjustment -= 10
        elif heading_count > self.max_heading_count:
            warnings.append(f"Many headings ({heading_count}, recommended maximum {self.max_heading_count})")
        else:
            score_adjustment += 5
        
        # Count paragraphs
        paragraph_count = len(re.findall(r'<p[^>]*>', content))
        if paragraph_count < self.min_paragraph_count:
            warnings.append(f"Few paragraphs ({paragraph_count}, recommended minimum {self.min_paragraph_count})")
            score_adjustment -= 5
        
        # Check for lists
        list_count = len(re.findall(r'<[ou]l[^>]*>', content))
        if list_count > 0:
            score_adjustment += 3
        
        # Check for sections
        section_count = len(re.findall(r'<section[^>]*>', content))
        if section_count >= 3:
            score_adjustment += 5
        
        return issues, warnings, score_adjustment

    def _validate_astrology_authenticity(self, content: str) -> Tuple[List[str], List[str], float]:
        """Validate astrology-specific content authenticity"""
        issues = []
        warnings = []
        score_adjustment = 0
        
        content_lower = content.lower()
        
        # Count astrology terms
        essential_terms = sum(1 for term in self.astrology_terms['essential'] 
                             if term in content_lower)
        advanced_terms = sum(1 for term in self.astrology_terms['advanced'] 
                            if term in content_lower)
        spiritual_terms = sum(1 for term in self.astrology_terms['spiritual'] 
                             if term in content_lower)
        
        # Validate essential astrology terms
        if essential_terms < 5:
            issues.append(f"Lacks essential astrology terms ({essential_terms} found, need at least 5)")
            score_adjustment -= 15
        elif essential_terms >= 10:
            score_adjustment += 10
        else:
            score_adjustment += 5
        
        # Check for advanced terms (indicates depth)
        if advanced_terms >= 3:
            score_adjustment += 10
        elif advanced_terms == 0:
            warnings.append("No advanced astrology terms found - content might be too basic")
            score_adjustment -= 3
        
        # Check for spiritual balance
        if spiritual_terms >= 3:
            score_adjustment += 5
        
        # Check for practical application
        practical_indicators = ['today', 'this week', 'current', 'now', 'practice', 'apply']
        practical_count = sum(1 for indicator in practical_indicators 
                             if indicator in content_lower)
        
        if practical_count >= 3:
            score_adjustment += 8
        elif practical_count == 0:
            warnings.append("Content lacks practical, current application")
            score_adjustment -= 5
        
        # Check for red flags
        red_flag_count = sum(1 for flag in self.red_flags if flag in content_lower)
        if red_flag_count > 0:
            issues.append(f"Content contains quality red flags: {red_flag_count} found")
            score_adjustment -= red_flag_count * 5
        
        return issues, warnings, score_adjustment

    def _validate_seo_optimization(self, title: str, content: str, meta_description: str) -> Tuple[List[str], List[str], float]:
        """Validate SEO optimization"""
        warnings = []
        suggestions = []
        score_adjustment = 0
        
        content_lower = content.lower()
        title_lower = title.lower()
        meta_lower = meta_description.lower()
        
        # Check for primary keyword consistency
        primary_keywords = ['astrology', 'horoscope', 'astroaura']
        keyword_consistency = 0
        
        for keyword in primary_keywords:
            if keyword in title_lower and keyword in meta_lower and keyword in content_lower:
                keyword_consistency += 1
        
        if keyword_consistency >= 2:
            score_adjustment += 8
        elif keyword_consistency == 1:
            score_adjustment += 3
        else:
            warnings.append("Low keyword consistency across title, meta, and content")
            score_adjustment -= 5
        
        # Check for internal linking
        internal_links = len(re.findall(r'href="[^"]*\.html"', content))
        if internal_links >= 2:
            score_adjustment += 5
        elif internal_links == 0:
            suggestions.append("Add internal links to improve SEO and user navigation")
        
        # Check for app download links
        app_links = content_lower.count('download') + content_lower.count('app store') + content_lower.count('google play')
        if app_links >= 2:
            score_adjustment += 5
        elif app_links == 0:
            suggestions.append("Include app download calls-to-action")
        
        # Check for structured data indicators
        if 'schema' in content_lower or 'structured' in content_lower:
            score_adjustment += 3
        
        return warnings, suggestions, score_adjustment

    def _validate_current_relevance(self, content: str, astronomical_data: Dict) -> Tuple[List[str], float]:
        """Validate current astronomical relevance"""
        warnings = []
        score_adjustment = 0
        
        content_lower = content.lower()
        
        # Check for current sun sign mention
        current_sign = astronomical_data.get('sun_sign', '').lower()
        if current_sign and current_sign in content_lower:
            score_adjustment += 5
        
        # Check for current moon phase mention
        moon_phase = astronomical_data.get('moon_phase', '').lower()
        if moon_phase and moon_phase in content_lower:
            score_adjustment += 5
        
        # Check for Mercury retrograde relevance
        if astronomical_data.get('mercury_retrograde') and 'retrograde' in content_lower:
            score_adjustment += 8
        elif not astronomical_data.get('mercury_retrograde') and 'retrograde' in content_lower:
            warnings.append("Content mentions retrograde but Mercury is not currently retrograde")
            score_adjustment -= 3
        
        # Check for seasonal relevance
        current_season = astronomical_data.get('season', '').lower()
        if current_season and current_season in content_lower:
            score_adjustment += 3
        
        # Check for current date relevance
        current_date = datetime.datetime.now()
        current_month = current_date.strftime('%B').lower()
        current_year = str(current_date.year)
        
        if current_month in content_lower or current_year in content_lower:
            score_adjustment += 5
        
        return warnings, score_adjustment

    def generate_quality_report(self, validation_result: ValidationResult) -> str:
        """Generate a formatted quality report"""
        
        report = f"""
🔍 CONTENT QUALITY VALIDATION REPORT
{'='*50}

📊 OVERALL SCORE: {validation_result.score:.1f}/100
✅ STATUS: {'PASSED' if validation_result.passed else 'FAILED - NEEDS IMPROVEMENT'}

"""
        
        if validation_result.issues:
            report += "❌ CRITICAL ISSUES:\n"
            for issue in validation_result.issues:
                report += f"   • {issue}\n"
            report += "\n"
        
        if validation_result.warnings:
            report += "⚠️  WARNINGS:\n"
            for warning in validation_result.warnings:
                report += f"   • {warning}\n"
            report += "\n"
        
        if validation_result.suggestions:
            report += "💡 SUGGESTIONS:\n"
            for suggestion in validation_result.suggestions:
                report += f"   • {suggestion}\n"
            report += "\n"
        
        # Quality grade
        if validation_result.score >= 90:
            grade = "A+ (Excellent)"
        elif validation_result.score >= 80:
            grade = "A (Very Good)"
        elif validation_result.score >= 70:
            grade = "B (Good)"
        elif validation_result.score >= 60:
            grade = "C (Acceptable)"
        else:
            grade = "D/F (Needs Improvement)"
        
        report += f"🏆 QUALITY GRADE: {grade}\n"
        
        return report

def main():
    """Test the validator with sample content"""
    validator = ContentQualityValidator()
    
    # Sample test data
    test_title = "Mercury Retrograde in Gemini: Your Complete Survival Guide for May 2025"
    test_meta = "Navigate Mercury retrograde in Gemini with AstroAura's expert guidance. Get personalized insights, practical tips, and cosmic wisdom for this challenging planetary transit."
    test_content = """
    <section class="introduction">
        <h2>Understanding Mercury Retrograde in Gemini</h2>
        <p>Mercury retrograde is one of the most talked-about astrological phenomena, and when it occurs in Gemini, its effects on communication and technology are amplified. This comprehensive guide will help you navigate this challenging period with wisdom and practical strategies.</p>
    </section>
    
    <section class="cosmic-effects">
        <h2>Current Cosmic Effects</h2>
        <p>During this Mercury retrograde period in Gemini, we can expect heightened confusion in communication, technology glitches, and misunderstandings. However, this is also an excellent time for reflection, revision, and reconnecting with old friends.</p>
        
        <ul>
            <li>Communication challenges and misunderstandings</li>
            <li>Technology and electronic device malfunctions</li>
            <li>Travel delays and transportation issues</li>
            <li>Opportunities for revision and reflection</li>
        </ul>
    </section>
    
    <section class="practical-guidance">
        <h2>Practical Survival Strategies</h2>
        <p>Here are actionable steps you can take today to work with Mercury retrograde energy rather than against it:</p>
        
        <ol>
            <li>Double-check all communications before sending</li>
            <li>Backup important files and data</li>
            <li>Allow extra time for travel and appointments</li>
            <li>Use this time for planning and strategizing</li>
            <li>Practice patience and mindfulness</li>
        </ol>
    </section>
    
    <section class="astroaura-insights">
        <h2>Get Personalized Guidance with AstroAura</h2>
        <p>While general Mercury retrograde advice is helpful, your personal birth chart reveals exactly how this transit affects you. AstroAura's AI-powered platform provides personalized insights based on your unique astrological profile.</p>
        
        <p>Download AstroAura today to discover how Mercury retrograde in Gemini specifically impacts your communication style, relationships, and daily routines.</p>
    </section>
    """
    
    test_astronomical_data = {
        'sun_sign': 'Gemini',
        'moon_phase': 'Waning Gibbous',
        'mercury_retrograde': True,
        'season': 'Spring'
    }
    
    # Run validation
    result = validator.validate_blog_post(
        test_title, test_content, test_meta, test_astronomical_data
    )
    
    # Print report
    report = validator.generate_quality_report(result)
    print(report)

if __name__ == "__main__":
    main()