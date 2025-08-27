/**
 * Educational Astrological Visualizations
 * Interactive D3.js-based charts and animations for learning astrology
 */

class EducationalVisualizations {
    constructor() {
        this.currentVisualization = null;
        this.progressData = this.loadProgress();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadVisualizationModules();
    }

    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeVisualizations();
        });
    }

    loadVisualizationModules() {
        // Load D3.js if not already loaded
        if (typeof d3 === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://d3js.org/d3.v7.min.js';
            script.onload = () => this.initializeVisualizations();
            document.head.appendChild(script);
        } else {
            this.initializeVisualizations();
        }
    }

    initializeVisualizations() {
        this.createPlanetaryMovementChart();
        this.createAspectExplanationAnimation();
        this.createZodiacLearningWheel();
        this.createHouseSystemVisualization();
    }

    /**
     * Interactive Planetary Movement Chart
     */
    createPlanetaryMovementChart() {
        const container = document.getElementById('planetary-movement-chart');
        if (!container) return;

        const width = Math.min(600, container.clientWidth);
        const height = width;
        const radius = width / 2 - 40;

        // Clear existing content
        container.innerHTML = '';

        const svg = d3.select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('class', 'planetary-chart');

        const g = svg.append('g')
            .attr('transform', `translate(${width/2}, ${height/2})`);

        // Planetary data with orbital periods (simplified)
        const planets = [
            { name: 'Mercury', radius: 60, period: 88, color: '#FFA500', symbol: '☿' },
            { name: 'Venus', radius: 80, period: 225, color: '#FFB6C1', symbol: '♀' },
            { name: 'Earth', radius: 100, period: 365, color: '#4169E1', symbol: '⊕' },
            { name: 'Mars', radius: 120, period: 687, color: '#FF4500', symbol: '♂' },
            { name: 'Jupiter', radius: 160, period: 4333, color: '#DAA520', symbol: '♃' },
            { name: 'Saturn', radius: 200, period: 10759, color: '#B8860B', symbol: '♄' }
        ];

        // Draw orbital paths
        planets.forEach(planet => {
            g.append('circle')
                .attr('r', planet.radius)
                .attr('fill', 'none')
                .attr('stroke', 'rgba(240, 199, 94, 0.3)')
                .attr('stroke-width', 1)
                .attr('stroke-dasharray', '2,2');
        });

        // Draw Sun at center
        g.append('circle')
            .attr('r', 15)
            .attr('fill', '#FFD700')
            .attr('stroke', '#FFA500')
            .attr('stroke-width', 2);

        g.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .attr('fill', '#000')
            .attr('font-size', '20px')
            .text('☉');

        // Animate planets
        const startTime = Date.now();
        
        planets.forEach(planet => {
            const planetGroup = g.append('g')
                .attr('class', `planet-${planet.name.toLowerCase()}`);

            const planetCircle = planetGroup.append('circle')
                .attr('r', 8)
                .attr('fill', planet.color)
                .attr('stroke', '#fff')
                .attr('stroke-width', 1)
                .style('cursor', 'pointer');

            const planetLabel = planetGroup.append('text')
                .attr('text-anchor', 'middle')
                .attr('dy', '0.35em')
                .attr('fill', '#fff')
                .attr('font-size', '12px')
                .text(planet.symbol);

            // Add click interaction
            planetGroup.on('click', () => {
                this.showPlanetInfo(planet);
            });

            // Animation function
            function animate() {
                const elapsed = (Date.now() - startTime) / 1000;
                const angle = (elapsed / planet.period * 365) * 2 * Math.PI; // Normalize to Earth year
                
                const x = Math.cos(angle) * planet.radius;
                const y = Math.sin(angle) * planet.radius;
                
                planetGroup.attr('transform', `translate(${x}, ${y})`);
                
                requestAnimationFrame(animate);
            }
            
            animate();
        });

        // Add controls
        this.addPlanetaryControls(container);
    }

    /**
     * Aspect Explanation Animation
     */
    createAspectExplanationAnimation() {
        const container = document.getElementById('aspect-explanation');
        if (!container) return;

        const width = Math.min(500, container.clientWidth);
        const height = width;
        const radius = width / 2 - 60;

        container.innerHTML = '';

        const svg = d3.select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        const g = svg.append('g')
            .attr('transform', `translate(${width/2}, ${height/2})`);

        // Aspect definitions
        const aspects = [
            { name: 'Conjunction', angle: 0, color: '#FF6B9D', description: 'Planets in the same sign, blending energies' },
            { name: 'Sextile', angle: 60, color: '#4A90E2', description: 'Harmonious, supportive energy flow' },
            { name: 'Square', angle: 90, color: '#FF4500', description: 'Challenging, growth-oriented tension' },
            { name: 'Trine', angle: 120, color: '#32CD32', description: 'Easy, flowing, natural harmony' },
            { name: 'Opposition', angle: 180, color: '#8A2BE2', description: 'Balancing, complementary forces' }
        ];

        let currentAspectIndex = 0;

        // Draw zodiac circle
        g.append('circle')
            .attr('r', radius)
            .attr('fill', 'none')
            .attr('stroke', 'rgba(240, 199, 94, 0.5)')
            .attr('stroke-width', 2);

        // Create aspect visualization
        const aspectGroup = g.append('g').attr('class', 'aspect-group');
        
        function showAspect(aspectIndex) {
            const aspect = aspects[aspectIndex];
            
            // Clear previous aspect
            aspectGroup.selectAll('*').remove();
            
            // Draw aspect line
            const angle1 = 0;
            const angle2 = aspect.angle * Math.PI / 180;
            
            const x1 = Math.cos(angle1) * radius;
            const y1 = Math.sin(angle1) * radius;
            const x2 = Math.cos(angle2) * radius;
            const y2 = Math.sin(angle2) * radius;
            
            // Aspect line with animation
            const line = aspectGroup.append('line')
                .attr('x1', x1)
                .attr('y1', y1)
                .attr('x2', x1)
                .attr('y2', y1)
                .attr('stroke', aspect.color)
                .attr('stroke-width', 3)
                .attr('opacity', 0.8);
            
            line.transition()
                .duration(1000)
                .attr('x2', x2)
                .attr('y2', y2);
            
            // Planet positions
            aspectGroup.append('circle')
                .attr('cx', x1)
                .attr('cy', y1)
                .attr('r', 12)
                .attr('fill', '#FFD700')
                .attr('stroke', '#fff')
                .attr('stroke-width', 2);
            
            aspectGroup.append('circle')
                .attr('cx', x2)
                .attr('cy', y2)
                .attr('r', 12)
                .attr('fill', '#FF69B4')
                .attr('stroke', '#fff')
                .attr('stroke-width', 2);
            
            // Aspect arc
            const arc = d3.arc()
                .innerRadius(30)
                .outerRadius(40)
                .startAngle(0)
                .endAngle(angle2);
            
            aspectGroup.append('path')
                .datum(aspect)
                .attr('d', arc)
                .attr('fill', aspect.color)
                .attr('opacity', 0.3);
            
            // Update info panel
            this.updateAspectInfo(aspect);
        }
        
        // Auto-cycle through aspects
        showAspect(0);
        setInterval(() => {
            currentAspectIndex = (currentAspectIndex + 1) % aspects.length;
            showAspect(currentAspectIndex);
        }, 3000);

        // Add manual controls
        this.addAspectControls(container, aspects, showAspect);
    }

    /**
     * Interactive Zodiac Learning Wheel
     */
    createZodiacLearningWheel() {
        const container = document.getElementById('zodiac-learning-wheel');
        if (!container) return;

        const width = Math.min(600, container.clientWidth);
        const height = width;
        const outerRadius = width / 2 - 40;
        const innerRadius = outerRadius - 60;

        container.innerHTML = '';

        const svg = d3.select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        const g = svg.append('g')
            .attr('transform', `translate(${width/2}, ${height/2})`);

        // Zodiac signs data
        const zodiacSigns = [
            { name: 'Aries', symbol: '♈', element: 'Fire', quality: 'Cardinal', color: '#FF4500', angle: 0 },
            { name: 'Taurus', symbol: '♉', element: 'Earth', quality: 'Fixed', color: '#32CD32', angle: 30 },
            { name: 'Gemini', symbol: '♊', element: 'Air', quality: 'Mutable', color: '#FFD700', angle: 60 },
            { name: 'Cancer', symbol: '♋', element: 'Water', quality: 'Cardinal', color: '#87CEEB', angle: 90 },
            { name: 'Leo', symbol: '♌', element: 'Fire', quality: 'Fixed', color: '#FF6347', angle: 120 },
            { name: 'Virgo', symbol: '♍', element: 'Earth', quality: 'Mutable', color: '#9ACD32', angle: 150 },
            { name: 'Libra', symbol: '♎', element: 'Air', quality: 'Cardinal', color: '#FFB6C1', angle: 180 },
            { name: 'Scorpio', symbol: '♏', element: 'Water', quality: 'Fixed', color: '#8B0000', angle: 210 },
            { name: 'Sagittarius', symbol: '♐', element: 'Fire', quality: 'Mutable', color: '#FF8C00', angle: 240 },
            { name: 'Capricorn', symbol: '♑', element: 'Earth', quality: 'Cardinal', color: '#2F4F4F', angle: 270 },
            { name: 'Aquarius', symbol: '♒', element: 'Air', quality: 'Fixed', color: '#00CED1', angle: 300 },
            { name: 'Pisces', symbol: '♓', element: 'Water', quality: 'Mutable', color: '#9370DB', angle: 330 }
        ];

        // Create pie layout
        const pie = d3.pie()
            .value(1)
            .startAngle(0)
            .endAngle(2 * Math.PI);

        const arc = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);

        // Draw zodiac segments
        const segments = g.selectAll('.zodiac-segment')
            .data(pie(zodiacSigns))
            .enter()
            .append('g')
            .attr('class', 'zodiac-segment')
            .style('cursor', 'pointer');

        segments.append('path')
            .attr('d', arc)
            .attr('fill', d => d.data.color)
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .attr('opacity', 0.8)
            .on('mouseover', function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('opacity', 1)
                    .attr('transform', 'scale(1.05)');
            })
            .on('mouseout', function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('opacity', 0.8)
                    .attr('transform', 'scale(1)');
            })
            .on('click', (event, d) => {
                this.showZodiacDetails(d.data);
            });

        // Add zodiac symbols
        segments.append('text')
            .attr('transform', d => {
                const centroid = arc.centroid(d);
                return `translate(${centroid[0]}, ${centroid[1]})`;
            })
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .attr('fill', '#fff')
            .attr('font-size', '24px')
            .attr('font-weight', 'bold')
            .text(d => d.data.symbol)
            .style('pointer-events', 'none');

        // Add element indicators in center
        this.addElementIndicators(g, zodiacSigns);
    }

    /**
     * House System Visualization
     */
    createHouseSystemVisualization() {
        const container = document.getElementById('house-system-chart');
        if (!container) return;

        const width = Math.min(500, container.clientWidth);
        const height = width;
        const radius = width / 2 - 40;

        container.innerHTML = '';

        const svg = d3.select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        const g = svg.append('g')
            .attr('transform', `translate(${width/2}, ${height/2})`);

        // House data
        const houses = [
            { number: 1, name: 'Self & Identity', color: '#FF4500', angle: 0 },
            { number: 2, name: 'Values & Possessions', color: '#32CD32', angle: 30 },
            { number: 3, name: 'Communication', color: '#FFD700', angle: 60 },
            { number: 4, name: 'Home & Family', color: '#87CEEB', angle: 90 },
            { number: 5, name: 'Creativity & Romance', color: '#FF6347', angle: 120 },
            { number: 6, name: 'Health & Service', color: '#9ACD32', angle: 150 },
            { number: 7, name: 'Partnerships', color: '#FFB6C1', angle: 180 },
            { number: 8, name: 'Transformation', color: '#8B0000', angle: 210 },
            { number: 9, name: 'Philosophy & Travel', color: '#FF8C00', angle: 240 },
            { number: 10, name: 'Career & Reputation', color: '#2F4F4F', angle: 270 },
            { number: 11, name: 'Friends & Hopes', color: '#00CED1', angle: 300 },
            { number: 12, name: 'Spirituality & Subconscious', color: '#9370DB', angle: 330 }
        ];

        // Create house segments
        const pie = d3.pie()
            .value(1)
            .startAngle(0)
            .endAngle(2 * Math.PI);

        const arc = d3.arc()
            .innerRadius(radius * 0.3)
            .outerRadius(radius);

        const segments = g.selectAll('.house-segment')
            .data(pie(houses))
            .enter()
            .append('g')
            .attr('class', 'house-segment')
            .style('cursor', 'pointer');

        segments.append('path')
            .attr('d', arc)
            .attr('fill', d => d.data.color)
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .attr('opacity', 0.7)
            .on('mouseover', function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('opacity', 1);
                
                // Show house info
                showHouseTooltip(event, d.data);
            })
            .on('mouseout', function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('opacity', 0.7);
                
                hideHouseTooltip();
            });

        // Add house numbers
        segments.append('text')
            .attr('transform', d => {
                const centroid = arc.centroid(d);
                const factor = 0.8;
                return `translate(${centroid[0] * factor}, ${centroid[1] * factor})`;
            })
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .attr('fill', '#fff')
            .attr('font-size', '16px')
            .attr('font-weight', 'bold')
            .text(d => d.data.number)
            .style('pointer-events', 'none');

        // Tooltip functions
        function showHouseTooltip(event, house) {
            const tooltip = d3.select('body').append('div')
                .attr('class', 'house-tooltip')
                .style('position', 'absolute')
                .style('background', 'rgba(0, 0, 0, 0.9)')
                .style('color', '#fff')
                .style('padding', '10px')
                .style('border-radius', '5px')
                .style('pointer-events', 'none')
                .style('opacity', 0);

            tooltip.html(`
                <strong>House ${house.number}</strong><br>
                ${house.name}
            `)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px')
            .transition()
            .duration(200)
            .style('opacity', 1);
        }

        function hideHouseTooltip() {
            d3.selectAll('.house-tooltip').remove();
        }
    }

    /**
     * Helper Methods
     */
    addPlanetaryControls(container) {
        const controls = document.createElement('div');
        controls.className = 'visualization-controls';
        controls.innerHTML = `
            <div class="control-group">
                <button class="control-btn" data-action="play">▶️ Play</button>
                <button class="control-btn" data-action="pause">⏸️ Pause</button>
                <button class="control-btn" data-action="reset">🔄 Reset</button>
            </div>
            <div class="speed-control">
                <label>Speed: <input type="range" min="0.1" max="5" step="0.1" value="1" id="speed-slider"></label>
            </div>
        `;
        container.appendChild(controls);
    }

    addAspectControls(container, aspects, showAspectFn) {
        const controls = document.createElement('div');
        controls.className = 'aspect-controls';
        controls.innerHTML = `
            <div class="aspect-buttons">
                ${aspects.map((aspect, index) => 
                    `<button class="aspect-btn" data-index="${index}" style="border-color: ${aspect.color}">
                        ${aspect.name}
                    </button>`
                ).join('')}
            </div>
            <div class="aspect-info" id="aspect-info">
                <h4>Click an aspect to learn more</h4>
            </div>
        `;
        container.appendChild(controls);

        // Add event listeners
        controls.querySelectorAll('.aspect-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                showAspectFn(index);
                
                // Update active button
                controls.querySelectorAll('.aspect-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }

    addElementIndicators(g, zodiacSigns) {
        const elements = ['Fire', 'Earth', 'Air', 'Water'];
        const elementColors = {
            'Fire': '#FF4500',
            'Earth': '#8B4513',
            'Air': '#87CEEB',
            'Water': '#4169E1'
        };

        const elementGroup = g.append('g').attr('class', 'element-indicators');
        
        elements.forEach((element, index) => {
            const angle = (index * 90) * Math.PI / 180;
            const x = Math.cos(angle) * 30;
            const y = Math.sin(angle) * 30;
            
            elementGroup.append('circle')
                .attr('cx', x)
                .attr('cy', y)
                .attr('r', 8)
                .attr('fill', elementColors[element])
                .attr('stroke', '#fff')
                .attr('stroke-width', 1);
            
            elementGroup.append('text')
                .attr('x', x)
                .attr('y', y + 25)
                .attr('text-anchor', 'middle')
                .attr('fill', '#fff')
                .attr('font-size', '10px')
                .text(element);
        });
    }

    updateAspectInfo(aspect) {
        const infoPanel = document.getElementById('aspect-info');
        if (infoPanel) {
            infoPanel.innerHTML = `
                <h4 style="color: ${aspect.color}">${aspect.name} (${aspect.angle}°)</h4>
                <p>${aspect.description}</p>
            `;
        }
    }

    showPlanetInfo(planet) {
        // Create modal or info panel for planet details
        const modal = document.createElement('div');
        modal.className = 'planet-info-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>${planet.symbol} ${planet.name}</h3>
                <p><strong>Orbital Period:</strong> ${planet.period} days</p>
                <p><strong>Astrological Meaning:</strong> ${this.getPlanetMeaning(planet.name)}</p>
                <button class="btn-primary" onclick="this.parentElement.parentElement.remove()">Close</button>
            </div>
        `;
        document.body.appendChild(modal);

        // Close modal functionality
        modal.querySelector('.close-modal').onclick = () => modal.remove();
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
    }

    showZodiacDetails(sign) {
        const modal = document.createElement('div');
        modal.className = 'zodiac-info-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>${sign.symbol} ${sign.name}</h3>
                <p><strong>Element:</strong> ${sign.element}</p>
                <p><strong>Quality:</strong> ${sign.quality}</p>
                <p><strong>Traits:</strong> ${this.getZodiacTraits(sign.name)}</p>
                <button class="btn-primary" onclick="this.parentElement.parentElement.remove()">Close</button>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.close-modal').onclick = () => modal.remove();
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
    }

    getPlanetMeaning(planetName) {
        const meanings = {
            'Mercury': 'Communication, thinking, learning, and short journeys',
            'Venus': 'Love, beauty, harmony, and relationships',
            'Earth': 'Our home planet, representing grounding and material reality',
            'Mars': 'Action, energy, passion, and conflict',
            'Jupiter': 'Expansion, wisdom, luck, and higher learning',
            'Saturn': 'Structure, discipline, responsibility, and life lessons'
        };
        return meanings[planetName] || 'Planetary influence in astrology';
    }

    getZodiacTraits(signName) {
        const traits = {
            'Aries': 'Bold, pioneering, energetic, impulsive',
            'Taurus': 'Stable, practical, sensual, stubborn',
            'Gemini': 'Curious, adaptable, communicative, restless',
            'Cancer': 'Nurturing, emotional, intuitive, protective',
            'Leo': 'Confident, creative, generous, dramatic',
            'Virgo': 'Analytical, helpful, perfectionist, practical',
            'Libra': 'Harmonious, diplomatic, indecisive, charming',
            'Scorpio': 'Intense, mysterious, transformative, passionate',
            'Sagittarius': 'Adventurous, philosophical, optimistic, blunt',
            'Capricorn': 'Ambitious, disciplined, traditional, responsible',
            'Aquarius': 'Independent, innovative, humanitarian, detached',
            'Pisces': 'Compassionate, intuitive, artistic, escapist'
        };
        return traits[signName] || 'Unique astrological characteristics';
    }

    // Progress tracking
    loadProgress() {
        const saved = localStorage.getItem('astro-learning-progress');
        return saved ? JSON.parse(saved) : {
            completedModules: [],
            currentLevel: 'beginner',
            achievements: []
        };
    }

    saveProgress() {
        localStorage.setItem('astro-learning-progress', JSON.stringify(this.progressData));
    }

    markModuleComplete(moduleId) {
        if (!this.progressData.completedModules.includes(moduleId)) {
            this.progressData.completedModules.push(moduleId);
            this.saveProgress();
            this.checkAchievements();
        }
    }

    checkAchievements() {
        const completed = this.progressData.completedModules.length;
        
        if (completed >= 5 && !this.progressData.achievements.includes('first-steps')) {
            this.progressData.achievements.push('first-steps');
            this.showAchievement('First Steps', 'Completed 5 learning modules!');
        }
        
        if (completed >= 10 && !this.progressData.achievements.includes('cosmic-student')) {
            this.progressData.achievements.push('cosmic-student');
            this.showAchievement('Cosmic Student', 'Completed 10 learning modules!');
        }
    }

    showAchievement(title, description) {
        const achievement = document.createElement('div');
        achievement.className = 'achievement-notification';
        achievement.innerHTML = `
            <div class="achievement-content">
                <h4>🏆 Achievement Unlocked!</h4>
                <h5>${title}</h5>
                <p>${description}</p>
            </div>
        `;
        document.body.appendChild(achievement);

        setTimeout(() => achievement.remove(), 5000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.educationalVisualizations = new EducationalVisualizations();
});