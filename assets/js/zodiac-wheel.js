// Interactive Zodiac Wheel Component
// SVG-based zodiac wheel with planetary position indicators and hover interactions

(function() {
    'use strict';
    
    class ZodiacWheel {
        constructor(containerId) {
            this.container = document.getElementById(containerId);
            this.svg = null;
            this.wheelRadius = 180;
            this.centerX = 200;
            this.centerY = 200;
            this.planetPositions = {};
            this.tooltipElement = null;
            
            if (this.container) {
                this.init();
            }
        }
        
        init() {
            this.createSVG();
            this.createZodiacWheel();
            this.createPlanetaryIndicators();
            this.createTooltip();
            this.calculatePlanetaryPositions();
            this.updatePlanetaryPositions();
            this.addInteractions();
            
            // Update planetary positions every hour
            setInterval(() => {
                this.calculatePlanetaryPositions();
                this.updatePlanetaryPositions();
            }, 60 * 60 * 1000);
        }
        
        createSVG() {
            this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this.svg.setAttribute('width', '400');
            this.svg.setAttribute('height', '400');
            this.svg.setAttribute('viewBox', '0 0 400 400');
            this.svg.classList.add('zodiac-wheel-svg');
            
            // Add CSS styles
            const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
            style.textContent = `
                .zodiac-wheel-svg {
                    max-width: 100%;
                    height: auto;
                    filter: drop-shadow(0 0 20px rgba(240, 199, 94, 0.3));
                }
                .zodiac-sign {
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .zodiac-sign:hover {
                    filter: brightness(1.3);
                    transform-origin: center;
                }
                .planet-indicator {
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .planet-indicator:hover {
                    transform: scale(1.2);
                    filter: brightness(1.3);
                }
                .wheel-background {
                    fill: none;
                    stroke: rgba(240, 199, 94, 0.3);
                    stroke-width: 2;
                }
                .wheel-inner {
                    fill: none;
                    stroke: rgba(240, 199, 94, 0.2);
                    stroke-width: 1;
                }
                .zodiac-text {
                    fill: #F0C75E;
                    font-family: 'Georgia', serif;
                    font-size: 14px;
                    font-weight: bold;
                    text-anchor: middle;
                    dominant-baseline: central;
                    pointer-events: none;
                }
                .planet-text {
                    fill: #FFFFFF;
                    font-family: 'Inter', sans-serif;
                    font-size: 12px;
                    font-weight: 600;
                    text-anchor: middle;
                    dominant-baseline: central;
                    pointer-events: none;
                }
            `;
            this.svg.appendChild(style);
            
            this.container.appendChild(this.svg);
        }
        
        createZodiacWheel() {
            // Outer wheel circle
            const outerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            outerCircle.setAttribute('cx', this.centerX);
            outerCircle.setAttribute('cy', this.centerY);
            outerCircle.setAttribute('r', this.wheelRadius);
            outerCircle.classList.add('wheel-background');
            this.svg.appendChild(outerCircle);
            
            // Inner wheel circle
            const innerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            innerCircle.setAttribute('cx', this.centerX);
            innerCircle.setAttribute('cy', this.centerY);
            innerCircle.setAttribute('r', this.wheelRadius - 40);
            innerCircle.classList.add('wheel-inner');
            this.svg.appendChild(innerCircle);
            
            // Zodiac signs
            const zodiacSigns = [
                { name: 'Aries', symbol: '♈', angle: 0, element: 'fire', quality: 'cardinal' },
                { name: 'Taurus', symbol: '♉', angle: 30, element: 'earth', quality: 'fixed' },
                { name: 'Gemini', symbol: '♊', angle: 60, element: 'air', quality: 'mutable' },
                { name: 'Cancer', symbol: '♋', angle: 90, element: 'water', quality: 'cardinal' },
                { name: 'Leo', symbol: '♌', angle: 120, element: 'fire', quality: 'fixed' },
                { name: 'Virgo', symbol: '♍', angle: 150, element: 'earth', quality: 'mutable' },
                { name: 'Libra', symbol: '♎', angle: 180, element: 'air', quality: 'cardinal' },
                { name: 'Scorpio', symbol: '♏', angle: 210, element: 'water', quality: 'fixed' },
                { name: 'Sagittarius', symbol: '♐', angle: 240, element: 'fire', quality: 'mutable' },
                { name: 'Capricorn', symbol: '♑', angle: 270, element: 'earth', quality: 'cardinal' },
                { name: 'Aquarius', symbol: '♒', angle: 300, element: 'air', quality: 'fixed' },
                { name: 'Pisces', symbol: '♓', angle: 330, element: 'water', quality: 'mutable' }
            ];
            
            zodiacSigns.forEach((sign, index) => {
                this.createZodiacSign(sign, index);
            });
        }
        
        createZodiacSign(sign, index) {
            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.classList.add('zodiac-sign');
            group.setAttribute('data-sign', sign.name.toLowerCase());
            group.setAttribute('data-element', sign.element);
            group.setAttribute('data-quality', sign.quality);
            
            // Calculate position
            const angleRad = (sign.angle - 90) * Math.PI / 180; // -90 to start from top
            const radius = this.wheelRadius - 20;
            const x = this.centerX + Math.cos(angleRad) * radius;
            const y = this.centerY + Math.sin(angleRad) * radius;
            
            // Create sign sector (30-degree arc)
            const startAngle = sign.angle - 15;
            const endAngle = sign.angle + 15;
            const path = this.createArcPath(this.centerX, this.centerY, this.wheelRadius - 40, this.wheelRadius, startAngle, endAngle);
            
            const sector = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            sector.setAttribute('d', path);
            sector.setAttribute('fill', this.getElementColor(sign.element, 0.1));
            sector.setAttribute('stroke', this.getElementColor(sign.element, 0.3));
            sector.setAttribute('stroke-width', '1');
            group.appendChild(sector);
            
            // Sign symbol
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', x);
            text.setAttribute('y', y);
            text.classList.add('zodiac-text');
            text.textContent = sign.symbol;
            text.setAttribute('font-size', '18');
            group.appendChild(text);
            
            // Sign name (smaller text)
            const nameText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            const nameRadius = this.wheelRadius - 50;
            const nameX = this.centerX + Math.cos(angleRad) * nameRadius;
            const nameY = this.centerY + Math.sin(angleRad) * nameRadius;
            nameText.setAttribute('x', nameX);
            nameText.setAttribute('y', nameY + 15);
            nameText.classList.add('zodiac-text');
            nameText.textContent = sign.name;
            nameText.setAttribute('font-size', '10');
            nameText.setAttribute('opacity', '0.8');
            group.appendChild(nameText);
            
            this.svg.appendChild(group);
        }
        
        createArcPath(centerX, centerY, innerRadius, outerRadius, startAngle, endAngle) {
            const startAngleRad = (startAngle - 90) * Math.PI / 180;
            const endAngleRad = (endAngle - 90) * Math.PI / 180;
            
            const x1 = centerX + Math.cos(startAngleRad) * innerRadius;
            const y1 = centerY + Math.sin(startAngleRad) * innerRadius;
            const x2 = centerX + Math.cos(endAngleRad) * innerRadius;
            const y2 = centerY + Math.sin(endAngleRad) * innerRadius;
            
            const x3 = centerX + Math.cos(endAngleRad) * outerRadius;
            const y3 = centerY + Math.sin(endAngleRad) * outerRadius;
            const x4 = centerX + Math.cos(startAngleRad) * outerRadius;
            const y4 = centerY + Math.sin(startAngleRad) * outerRadius;
            
            const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
            
            return [
                "M", x1, y1,
                "A", innerRadius, innerRadius, 0, largeArcFlag, 1, x2, y2,
                "L", x3, y3,
                "A", outerRadius, outerRadius, 0, largeArcFlag, 0, x4, y4,
                "Z"
            ].join(" ");
        }
        
        getElementColor(element, opacity = 1) {
            const colors = {
                fire: `rgba(255, 107, 157, ${opacity})`, // Pink-red
                earth: `rgba(139, 195, 74, ${opacity})`, // Green
                air: `rgba(74, 144, 226, ${opacity})`, // Blue
                water: `rgba(156, 39, 176, ${opacity})` // Purple
            };
            return colors[element] || `rgba(240, 199, 94, ${opacity})`;
        }
        
        createPlanetaryIndicators() {
            // Create a group for planetary indicators
            this.planetGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            this.planetGroup.classList.add('planetary-indicators');
            this.svg.appendChild(this.planetGroup);
        }
        
        calculatePlanetaryPositions() {
            // Simplified planetary position calculation
            // In a real implementation, you would use Swiss Ephemeris or similar
            const now = new Date();
            const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
            
            // Approximate planetary positions (simplified for demo)
            this.planetPositions = {
                sun: this.calculateSunPosition(now),
                moon: this.calculateMoonPosition(now),
                mercury: (this.calculateSunPosition(now) + (dayOfYear * 4.1) % 360) % 360,
                venus: (this.calculateSunPosition(now) + (dayOfYear * 1.6) % 360) % 360,
                mars: (this.calculateSunPosition(now) + (dayOfYear * 0.5) % 360) % 360,
                jupiter: (this.calculateSunPosition(now) + (dayOfYear * 0.08) % 360) % 360,
                saturn: (this.calculateSunPosition(now) + (dayOfYear * 0.03) % 360) % 360
            };
        }
        
        calculateSunPosition(date) {
            // Simplified sun position calculation
            const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
            const sunLongitude = (280.459 + 0.98564736 * dayOfYear) % 360;
            return sunLongitude;
        }
        
        calculateMoonPosition(date) {
            // Simplified moon position calculation
            const daysSinceEpoch = Math.floor((date - new Date(2000, 0, 1)) / 86400000);
            const moonLongitude = (218.316 + 13.176396 * daysSinceEpoch) % 360;
            return moonLongitude;
        }
        
        updatePlanetaryPositions() {
            // Clear existing planetary indicators
            this.planetGroup.innerHTML = '';
            
            const planets = [
                { name: 'Sun', symbol: '☉', color: '#FFD700', size: 8 },
                { name: 'Moon', symbol: '☽', color: '#C0C0C0', size: 6 },
                { name: 'Mercury', symbol: '☿', color: '#FFA500', size: 4 },
                { name: 'Venus', symbol: '♀', color: '#FF69B4', size: 5 },
                { name: 'Mars', symbol: '♂', color: '#FF4500', size: 5 },
                { name: 'Jupiter', symbol: '♃', color: '#FF8C00', size: 7 },
                { name: 'Saturn', symbol: '♄', color: '#DAA520', size: 6 }
            ];
            
            planets.forEach(planet => {
                const position = this.planetPositions[planet.name.toLowerCase()];
                if (position !== undefined) {
                    this.createPlanetIndicator(planet, position);
                }
            });
        }
        
        createPlanetIndicator(planet, position) {
            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.classList.add('planet-indicator');
            group.setAttribute('data-planet', planet.name.toLowerCase());
            
            // Calculate position on the wheel
            const angleRad = (position - 90) * Math.PI / 180;
            const radius = this.wheelRadius - 60;
            const x = this.centerX + Math.cos(angleRad) * radius;
            const y = this.centerY + Math.sin(angleRad) * radius;
            
            // Planet circle
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
            circle.setAttribute('r', planet.size);
            circle.setAttribute('fill', planet.color);
            circle.setAttribute('stroke', '#FFFFFF');
            circle.setAttribute('stroke-width', '1');
            circle.setAttribute('filter', 'drop-shadow(0 0 4px rgba(0,0,0,0.5))');
            group.appendChild(circle);
            
            // Planet symbol
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', x);
            text.setAttribute('y', y);
            text.classList.add('planet-text');
            text.textContent = planet.symbol;
            text.setAttribute('font-size', '10');
            text.setAttribute('fill', '#000000');
            text.setAttribute('font-weight', 'bold');
            group.appendChild(text);
            
            this.planetGroup.appendChild(group);
        }
        
        createTooltip() {
            this.tooltipElement = document.createElement('div');
            this.tooltipElement.className = 'zodiac-tooltip';
            this.tooltipElement.style.cssText = `
                position: absolute;
                background: rgba(10, 10, 10, 0.95);
                color: #F0C75E;
                padding: 12px 16px;
                border-radius: 8px;
                font-size: 14px;
                font-family: 'Inter', sans-serif;
                border: 1px solid rgba(240, 199, 94, 0.3);
                backdrop-filter: blur(10px);
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.3s ease;
                z-index: 1000;
                max-width: 250px;
                line-height: 1.4;
            `;
            document.body.appendChild(this.tooltipElement);
        }
        
        addInteractions() {
            // Zodiac sign interactions
            this.svg.querySelectorAll('.zodiac-sign').forEach(sign => {
                // Mouse events
                sign.addEventListener('mouseenter', (e) => {
                    this.showZodiacTooltip(e, sign);
                });
                
                sign.addEventListener('mouseleave', () => {
                    this.hideTooltip();
                });
                
                sign.addEventListener('mousemove', (e) => {
                    this.updateTooltipPosition(e);
                });
                
                // Touch events
                sign.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    this.showZodiacTooltip(e.touches[0], sign);
                });
                
                sign.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    setTimeout(() => this.hideTooltip(), 3000); // Auto-hide after 3 seconds
                });
            });
            
            // Planet interactions
            this.svg.addEventListener('mouseenter', (e) => {
                if (e.target.closest('.planet-indicator')) {
                    this.showPlanetTooltip(e, e.target.closest('.planet-indicator'));
                }
            }, true);
            
            this.svg.addEventListener('mouseleave', (e) => {
                if (e.target.closest('.planet-indicator')) {
                    this.hideTooltip();
                }
            }, true);
            
            this.svg.addEventListener('mousemove', (e) => {
                if (e.target.closest('.planet-indicator')) {
                    this.updateTooltipPosition(e);
                }
            }, true);
            
            // Touch events for planets
            this.svg.addEventListener('touchstart', (e) => {
                if (e.target.closest('.planet-indicator')) {
                    e.preventDefault();
                    this.showPlanetTooltip(e.touches[0], e.target.closest('.planet-indicator'));
                }
            }, true);
            
            this.svg.addEventListener('touchend', (e) => {
                if (e.target.closest('.planet-indicator')) {
                    e.preventDefault();
                    setTimeout(() => this.hideTooltip(), 3000); // Auto-hide after 3 seconds
                }
            }, true);
        }
        
        showZodiacTooltip(event, signElement) {
            const signName = signElement.getAttribute('data-sign');
            const element = signElement.getAttribute('data-element');
            const quality = signElement.getAttribute('data-quality');
            
            const signData = this.getZodiacSignData(signName);
            
            this.tooltipElement.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 8px; color: #FFFFFF;">
                    ${signData.symbol} ${signData.name}
                </div>
                <div style="margin-bottom: 6px;">
                    <strong>Element:</strong> ${element.charAt(0).toUpperCase() + element.slice(1)}
                </div>
                <div style="margin-bottom: 6px;">
                    <strong>Quality:</strong> ${quality.charAt(0).toUpperCase() + quality.slice(1)}
                </div>
                <div style="margin-bottom: 6px;">
                    <strong>Dates:</strong> ${signData.dates}
                </div>
                <div style="font-size: 12px; opacity: 0.9;">
                    ${signData.description}
                </div>
            `;
            
            this.tooltipElement.style.opacity = '1';
            this.updateTooltipPosition(event);
        }
        
        showPlanetTooltip(event, planetElement) {
            const planetName = planetElement.getAttribute('data-planet');
            const planetData = this.getPlanetData(planetName);
            const position = this.planetPositions[planetName];
            const zodiacSign = this.getZodiacSignFromDegree(position);
            
            this.tooltipElement.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 8px; color: #FFFFFF;">
                    ${planetData.symbol} ${planetData.name}
                </div>
                <div style="margin-bottom: 6px;">
                    <strong>Position:</strong> ${Math.round(position)}° in ${zodiacSign}
                </div>
                <div style="margin-bottom: 6px;">
                    <strong>Influence:</strong> ${planetData.influence}
                </div>
                <div style="font-size: 12px; opacity: 0.9;">
                    ${planetData.description}
                </div>
            `;
            
            this.tooltipElement.style.opacity = '1';
            this.updateTooltipPosition(event);
        }
        
        hideTooltip() {
            this.tooltipElement.style.opacity = '0';
        }
        
        updateTooltipPosition(event) {
            const rect = this.container.getBoundingClientRect();
            const x = event.clientX - rect.left + 15;
            const y = event.clientY - rect.top - 10;
            
            this.tooltipElement.style.left = x + 'px';
            this.tooltipElement.style.top = y + 'px';
        }
        
        getZodiacSignData(signName) {
            const signs = {
                aries: { name: 'Aries', symbol: '♈', dates: 'Mar 21 - Apr 19', description: 'Bold, pioneering, and energetic. Natural leaders who embrace new challenges.' },
                taurus: { name: 'Taurus', symbol: '♉', dates: 'Apr 20 - May 20', description: 'Stable, practical, and determined. Values security and material comfort.' },
                gemini: { name: 'Gemini', symbol: '♊', dates: 'May 21 - Jun 20', description: 'Curious, adaptable, and communicative. Loves learning and social connections.' },
                cancer: { name: 'Cancer', symbol: '♋', dates: 'Jun 21 - Jul 22', description: 'Nurturing, intuitive, and protective. Deeply connected to home and family.' },
                leo: { name: 'Leo', symbol: '♌', dates: 'Jul 23 - Aug 22', description: 'Confident, creative, and generous. Natural performers who love to shine.' },
                virgo: { name: 'Virgo', symbol: '♍', dates: 'Aug 23 - Sep 22', description: 'Analytical, helpful, and perfectionist. Seeks to improve and serve others.' },
                libra: { name: 'Libra', symbol: '♎', dates: 'Sep 23 - Oct 22', description: 'Harmonious, diplomatic, and aesthetic. Seeks balance and beautiful relationships.' },
                scorpio: { name: 'Scorpio', symbol: '♏', dates: 'Oct 23 - Nov 21', description: 'Intense, transformative, and mysterious. Explores life\'s deeper meanings.' },
                sagittarius: { name: 'Sagittarius', symbol: '♐', dates: 'Nov 22 - Dec 21', description: 'Adventurous, philosophical, and optimistic. Seeks truth and new experiences.' },
                capricorn: { name: 'Capricorn', symbol: '♑', dates: 'Dec 22 - Jan 19', description: 'Ambitious, disciplined, and responsible. Builds lasting structures and achievements.' },
                aquarius: { name: 'Aquarius', symbol: '♒', dates: 'Jan 20 - Feb 18', description: 'Independent, innovative, and humanitarian. Envisions a better future for all.' },
                pisces: { name: 'Pisces', symbol: '♓', dates: 'Feb 19 - Mar 20', description: 'Compassionate, artistic, and intuitive. Deeply connected to emotions and spirituality.' }
            };
            return signs[signName] || { name: signName, symbol: '?', dates: 'Unknown', description: 'Mysterious cosmic influence.' };
        }
        
        getPlanetData(planetName) {
            const planets = {
                sun: { name: 'Sun', symbol: '☉', influence: 'Identity & Vitality', description: 'Represents your core self, ego, and life force energy.' },
                moon: { name: 'Moon', symbol: '☽', influence: 'Emotions & Intuition', description: 'Governs your emotional nature, instincts, and subconscious patterns.' },
                mercury: { name: 'Mercury', symbol: '☿', influence: 'Communication & Mind', description: 'Rules thinking, communication, and information processing.' },
                venus: { name: 'Venus', symbol: '♀', influence: 'Love & Beauty', description: 'Governs relationships, aesthetics, and what you value.' },
                mars: { name: 'Mars', symbol: '♂', influence: 'Action & Energy', description: 'Represents drive, ambition, and how you assert yourself.' },
                jupiter: { name: 'Jupiter', symbol: '♃', influence: 'Growth & Wisdom', description: 'Brings expansion, luck, and philosophical understanding.' },
                saturn: { name: 'Saturn', symbol: '♄', influence: 'Structure & Discipline', description: 'Teaches lessons through challenges and builds lasting foundations.' }
            };
            return planets[planetName] || { name: planetName, symbol: '?', influence: 'Unknown', description: 'Mysterious cosmic influence.' };
        }
        
        getZodiacSignFromDegree(degree) {
            const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
            const signIndex = Math.floor(degree / 30);
            return signs[signIndex] || 'Unknown';
        }
        
        destroy() {
            if (this.tooltipElement) {
                document.body.removeChild(this.tooltipElement);
            }
        }
    }
    
    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        const zodiacWheelContainer = document.getElementById('zodiac-wheel-container');
        if (zodiacWheelContainer) {
            window.zodiacWheel = new ZodiacWheel('zodiac-wheel-container');
        }
    });
    
    // Export for external use
    window.ZodiacWheel = ZodiacWheel;
    
})();