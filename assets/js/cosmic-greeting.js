// Cosmic Greeting System
// Provides personalized greetings based on current astrological conditions

(function() {
    'use strict';
    
    class CosmicGreetingSystem {
        constructor() {
            this.greetingElement = null;
            this.currentGreeting = null;
            this.updateInterval = null;
            this.init();
        }
        
        init() {
            this.greetingElement = document.getElementById('cosmic-greeting');
            if (this.greetingElement) {
                this.displayGreeting();
                // Update greeting every 30 minutes
                this.updateInterval = setInterval(() => {
                    this.displayGreeting();
                }, 30 * 60 * 1000);
            }
        }
        
        displayGreeting() {
            const greeting = this.generateGreeting();
            if (this.greetingElement && greeting !== this.currentGreeting) {
                this.animateGreetingChange(greeting);
                this.currentGreeting = greeting;
            }
        }
        
        generateGreeting() {
            const now = new Date();
            const timeOfDay = this.getTimeOfDay(now);
            const moonPhase = this.getMoonPhase(now);
            const season = this.getSeason(now);
            const dayOfWeek = this.getDayOfWeek(now);
            const cosmicCondition = this.getCosmicCondition(now);
            
            const greetingData = {
                timeOfDay,
                moonPhase,
                season,
                dayOfWeek,
                cosmicCondition,
                date: now
            };
            
            return this.selectGreetingTemplate(greetingData);
        }
        
        getTimeOfDay(date) {
            const hour = date.getHours();
            if (hour >= 5 && hour < 12) return 'morning';
            if (hour >= 12 && hour < 17) return 'afternoon';
            if (hour >= 17 && hour < 21) return 'evening';
            return 'night';
        }
        
        getMoonPhase(date) {
            // Simplified moon phase calculation
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            
            // Calculate days since known new moon (Jan 1, 2000)
            const knownNewMoon = new Date(2000, 0, 6);
            const daysSinceKnown = Math.floor((date - knownNewMoon) / (1000 * 60 * 60 * 24));
            const lunarCycle = 29.53058867; // Average lunar cycle in days
            const phase = (daysSinceKnown % lunarCycle) / lunarCycle;
            
            if (phase < 0.0625 || phase >= 0.9375) return 'new';
            if (phase >= 0.0625 && phase < 0.1875) return 'waxing-crescent';
            if (phase >= 0.1875 && phase < 0.3125) return 'first-quarter';
            if (phase >= 0.3125 && phase < 0.4375) return 'waxing-gibbous';
            if (phase >= 0.4375 && phase < 0.5625) return 'full';
            if (phase >= 0.5625 && phase < 0.6875) return 'waning-gibbous';
            if (phase >= 0.6875 && phase < 0.8125) return 'third-quarter';
            return 'waning-crescent';
        }
        
        getSeason(date) {
            const month = date.getMonth();
            const day = date.getDate();
            
            // Northern hemisphere seasons (approximate)
            if ((month === 2 && day >= 20) || month === 3 || month === 4 || (month === 5 && day < 21)) {
                return 'spring';
            }
            if ((month === 5 && day >= 21) || month === 6 || month === 7 || (month === 8 && day < 23)) {
                return 'summer';
            }
            if ((month === 8 && day >= 23) || month === 9 || month === 10 || (month === 11 && day < 21)) {
                return 'autumn';
            }
            return 'winter';
        }
        
        getDayOfWeek(date) {
            const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            return days[date.getDay()];
        }
        
        getCosmicCondition(date) {
            // Simplified cosmic condition based on date patterns
            const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
            const conditions = ['harmonious', 'transformative', 'reflective', 'energetic', 'mystical'];
            return conditions[dayOfYear % conditions.length];
        }
        
        selectGreetingTemplate(data) {
            const templates = this.getGreetingTemplates();
            const { timeOfDay, moonPhase, season, cosmicCondition } = data;
            
            // Priority: specific combinations > time-based > general
            const specificKey = `${timeOfDay}-${moonPhase}-${season}`;
            const timeKey = `${timeOfDay}-${moonPhase}`;
            const generalKey = timeOfDay;
            
            let selectedTemplate;
            if (templates.specific[specificKey]) {
                selectedTemplate = this.getRandomTemplate(templates.specific[specificKey]);
            } else if (templates.timeBased[timeKey]) {
                selectedTemplate = this.getRandomTemplate(templates.timeBased[timeKey]);
            } else {
                selectedTemplate = this.getRandomTemplate(templates.general[generalKey]);
            }
            
            return this.personalizeTemplate(selectedTemplate, data);
        }
        
        getRandomTemplate(templates) {
            return templates[Math.floor(Math.random() * templates.length)];
        }
        
        personalizeTemplate(template, data) {
            const { moonPhase, season, cosmicCondition, date } = data;
            
            return template
                .replace('{moonPhase}', this.getMoonPhaseDescription(moonPhase))
                .replace('{season}', season)
                .replace('{cosmicCondition}', cosmicCondition)
                .replace('{dayName}', this.getDayName(date))
                .replace('{monthName}', this.getMonthName(date));
        }
        
        getMoonPhaseDescription(phase) {
            const descriptions = {
                'new': 'New Moon',
                'waxing-crescent': 'Waxing Crescent Moon',
                'first-quarter': 'First Quarter Moon',
                'waxing-gibbous': 'Waxing Gibbous Moon',
                'full': 'Full Moon',
                'waning-gibbous': 'Waning Gibbous Moon',
                'third-quarter': 'Third Quarter Moon',
                'waning-crescent': 'Waning Crescent Moon'
            };
            return descriptions[phase] || 'Moon';
        }
        
        getDayName(date) {
            return date.toLocaleDateString('en-US', { weekday: 'long' });
        }
        
        getMonthName(date) {
            return date.toLocaleDateString('en-US', { month: 'long' });
        }
        
        getGreetingTemplates() {
            return {
                specific: {
                    'morning-new-spring': [
                        "🌱 Welcome to a fresh {dayName} morning! The {moonPhase} in {season} brings new beginnings and cosmic renewal.",
                        "✨ Good morning, cosmic soul! This {cosmicCondition} {dayName} under the {moonPhase} is perfect for planting seeds of intention."
                    ],
                    'evening-full-autumn': [
                        "🍂 Good evening! The {moonPhase} illuminates this {cosmicCondition} {season} night with wisdom and reflection.",
                        "🌕 Welcome to a magical {dayName} evening! The {moonPhase} in {season} invites deep cosmic contemplation."
                    ]
                },
                timeBased: {
                    'morning-new': [
                        "🌅 Good morning! The {moonPhase} brings fresh cosmic energy to start your {dayName}.",
                        "✨ Welcome to a new day! This {cosmicCondition} morning under the {moonPhase} is full of potential."
                    ],
                    'morning-full': [
                        "🌕 Good morning, starlight! The {moonPhase} illuminates your path this {cosmicCondition} {dayName}.",
                        "🌟 Welcome to a radiant morning! The {moonPhase} amplifies your cosmic energy today."
                    ],
                    'evening-new': [
                        "🌙 Good evening! The {moonPhase} whispers of new possibilities in this {cosmicCondition} twilight.",
                        "✨ Welcome to a mystical evening! The {moonPhase} invites quiet reflection and intention-setting."
                    ],
                    'evening-full': [
                        "🌕 Good evening, cosmic wanderer! The {moonPhase} bathes this {cosmicCondition} night in divine light.",
                        "🌟 Welcome to a luminous evening! The {moonPhase} reveals hidden truths and cosmic wisdom."
                    ],
                    'night-waning-crescent': [
                        "🌙 Good evening, night owl! The {moonPhase} encourages release and letting go this {cosmicCondition} night.",
                        "✨ Welcome to the mystical hours! The {moonPhase} supports deep healing and transformation."
                    ]
                },
                general: {
                    morning: [
                        "🌅 Good morning, beautiful soul! The cosmos awakens with you this {cosmicCondition} {dayName}.",
                        "✨ Welcome to a new day! The universe has aligned perfectly for your {dayName} journey.",
                        "🌟 Good morning! Your cosmic energy shines bright this {cosmicCondition} {dayName} in {monthName}.",
                        "🌱 Rise and shine! The stars have been waiting to guide you through this magical {dayName}."
                    ],
                    afternoon: [
                        "☀️ Good afternoon, cosmic soul! The universe is in perfect harmony this {cosmicCondition} {dayName}.",
                        "✨ Welcome back! The cosmic energies are flowing beautifully this {dayName} afternoon.",
                        "🌟 Good afternoon! Your spiritual journey continues under today's {cosmicCondition} influences.",
                        "🌞 The cosmos smiles upon you this {dayName} afternoon in {monthName}!"
                    ],
                    evening: [
                        "🌙 Good evening, stargazer! The cosmic veil grows thin this {cosmicCondition} {dayName} night.",
                        "✨ Welcome to the mystical hours! Tonight's {cosmicCondition} energy invites deep reflection.",
                        "🌟 Good evening! The universe whispers ancient wisdom this {dayName} in {monthName}.",
                        "🌙 As twilight embraces the earth, cosmic magic awakens this {cosmicCondition} evening."
                    ],
                    night: [
                        "🌙 Good evening, night wanderer! The cosmos reveals its secrets in these {cosmicCondition} hours.",
                        "✨ Welcome to the sacred night! The universe speaks in whispers and starlight.",
                        "🌟 Good evening, cosmic soul! Tonight's {cosmicCondition} energy supports deep spiritual work.",
                        "🌙 The mystical veil is thinnest now. Let the cosmos guide your {dayName} night journey."
                    ]
                }
            };
        }
        
        animateGreetingChange(newGreeting) {
            if (!this.greetingElement) return;
            
            // Fade out current greeting
            this.greetingElement.style.opacity = '0';
            this.greetingElement.style.transform = 'translateY(-10px)';
            
            setTimeout(() => {
                // Update content
                this.greetingElement.innerHTML = newGreeting;
                
                // Fade in new greeting
                this.greetingElement.style.opacity = '1';
                this.greetingElement.style.transform = 'translateY(0)';
            }, 300);
        }
        
        destroy() {
            if (this.updateInterval) {
                clearInterval(this.updateInterval);
            }
        }
    }
    
    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        window.cosmicGreeting = new CosmicGreetingSystem();
    });
    
    // Export for external use
    window.CosmicGreetingSystem = CosmicGreetingSystem;
    
})();