/**
 * Chart Interpretation System
 * Provides rule-based interpretations for birth chart elements
 */

class ChartInterpretationEngine {
  constructor() {
    this.interpretations = {
      planets: this.initializePlanetInterpretations(),
      signs: this.initializeSignInterpretations(),
      houses: this.initializeHouseInterpretations(),
      aspects: this.initializeAspectInterpretations()
    };
  }

  // Generate comprehensive interpretation for a birth chart
  generateChartInterpretation(chartData) {
    const interpretation = {
      overview: this.generateOverview(chartData),
      personality: this.generatePersonalityInsights(chartData),
      relationships: this.generateRelationshipInsights(chartData),
      career: this.generateCareerInsights(chartData),
      spirituality: this.generateSpiritualInsights(chartData),
      planetaryInsights: this.generatePlanetaryInsights(chartData.planets),
      aspectInsights: this.generateAspectInsights(chartData.aspects)
    };

    return interpretation;
  }

  generateOverview(chartData) {
    const sunSign = this.getPlanetSign(chartData.planets, 'Sun');
    const moonSign = this.getPlanetSign(chartData.planets, 'Moon');
    const ascendant = this.getAscendantSign(chartData.houses);

    const elementAnalysis = this.analyzeElements(chartData.planets);
    const modalityAnalysis = this.analyzeModalities(chartData.planets);

    return {
      title: "Your Cosmic Blueprint",
      summary: `You are a ${sunSign} Sun with ${moonSign} Moon and ${ascendant} Rising. This unique combination creates your distinctive personality and life path.`,
      keyThemes: this.identifyKeyThemes(chartData),
      dominantElements: elementAnalysis,
      dominantModalities: modalityAnalysis,
      chartPattern: this.identifyChartPattern(chartData.planets),
      personalityInsights: this.generateElementModalityInsights(elementAnalysis, modalityAnalysis)
    };
  }

  generatePersonalityInsights(chartData) {
    const sun = this.findPlanet(chartData.planets, 'Sun');
    const moon = this.findPlanet(chartData.planets, 'Moon');
    const mercury = this.findPlanet(chartData.planets, 'Mercury');

    return {
      title: "Core Personality",
      coreIdentity: this.interpretPlanetInSign(sun, 'personality'),
      emotionalNature: this.interpretPlanetInSign(moon, 'emotions'),
      communicationStyle: this.interpretPlanetInSign(mercury, 'communication'),
      strengths: this.identifyStrengths(chartData),
      challenges: this.identifyChallenges(chartData)
    };
  }

  generateRelationshipInsights(chartData) {
    const venus = this.findPlanet(chartData.planets, 'Venus');
    const mars = this.findPlanet(chartData.planets, 'Mars');
    const seventhHouse = chartData.houses[6]; // 7th house (index 6)

    return {
      title: "Love & Relationships",
      loveStyle: this.interpretPlanetInSign(venus, 'love'),
      attractionStyle: this.interpretPlanetInSign(mars, 'attraction'),
      partnershipNeeds: this.interpretHouseCusp(seventhHouse),
      relationshipPatterns: this.analyzeRelationshipAspects(chartData.aspects),
      compatibility: this.generateCompatibilityGuidance(venus, mars)
    };
  }

  generateCareerInsights(chartData) {
    const midheaven = chartData.houses[9]; // 10th house (index 9)
    const saturn = this.findPlanet(chartData.planets, 'Saturn');
    const jupiter = this.findPlanet(chartData.planets, 'Jupiter');

    return {
      title: "Career & Life Purpose",
      careerPath: this.interpretHouseCusp(midheaven),
      workStyle: this.interpretPlanetInSign(saturn, 'work'),
      growthOpportunities: this.interpretPlanetInSign(jupiter, 'growth'),
      talents: this.identifyTalents(chartData),
      careerChallenges: this.identifyCareerChallenges(chartData)
    };
  }

  generateSpiritualInsights(chartData) {
    const neptune = this.findPlanet(chartData.planets, 'Neptune');
    const pluto = this.findPlanet(chartData.planets, 'Pluto');
    const ninthHouse = chartData.houses[8]; // 9th house (index 8)

    return {
      title: "Spiritual Path & Growth",
      spiritualNature: this.interpretPlanetInSign(neptune, 'spirituality'),
      transformation: this.interpretPlanetInSign(pluto, 'transformation'),
      higherLearning: this.interpretHouseCusp(ninthHouse),
      lifePhilosophy: this.generateLifePhilosophy(chartData),
      spiritualGifts: this.identifySpiritualGifts(chartData)
    };
  }

  generatePlanetaryInsights(planets) {
    return planets.map(planet => ({
      planet: planet.name,
      symbol: planet.symbol,
      sign: planet.sign,
      house: planet.house,
      interpretation: this.interpretPlanetInSign(planet, 'general'),
      houseInterpretation: this.interpretPlanetInHouse(planet),
      combinedInterpretation: this.generateCombinedPlanetInterpretation(planet),
      beginnerExplanation: this.getBeginnerExplanation(planet.name),
      keywords: this.getPlanetKeywords(planet.name),
      practicalAdvice: this.generatePracticalAdvice(planet)
    }));
  }

  generateAspectInsights(aspects) {
    return aspects.map(aspect => ({
      ...aspect,
      interpretation: this.interpretAspect(aspect),
      beginnerExplanation: this.getAspectBeginnerExplanation(aspect.aspect),
      influence: this.getAspectInfluence(aspect.aspect),
      advice: this.getAspectAdvice(aspect)
    }));
  }

  // Helper methods for interpretations
  interpretPlanetInSign(planet, context) {
    const planetKey = planet.name.toLowerCase();
    const signKey = planet.sign.toLowerCase();
    
    if (this.interpretations.planets[planetKey] && 
        this.interpretations.planets[planetKey].signs[signKey]) {
      const interpretation = this.interpretations.planets[planetKey].signs[signKey];
      return interpretation[context] || interpretation.general || "This placement brings unique energy to your chart.";
    }
    
    return `${planet.name} in ${planet.sign} brings distinctive qualities to your personality.`;
  }

  interpretAspect(aspect) {
    const aspectKey = aspect.aspect.toLowerCase();
    const planet1Key = aspect.planet1.toLowerCase();
    const planet2Key = aspect.planet2.toLowerCase();
    
    if (this.interpretations.aspects[aspectKey]) {
      const aspectInfo = this.interpretations.aspects[aspectKey];
      const combinationKey = `${planet1Key}_${planet2Key}`;
      const reverseKey = `${planet2Key}_${planet1Key}`;
      
      if (aspectInfo.combinations[combinationKey]) {
        return aspectInfo.combinations[combinationKey];
      } else if (aspectInfo.combinations[reverseKey]) {
        return aspectInfo.combinations[reverseKey];
      } else {
        return `${aspect.planet1} ${aspectInfo.general} ${aspect.planet2}, creating ${aspectInfo.influence} energy in your life.`;
      }
    }
    
    return `The ${aspect.aspect} between ${aspect.planet1} and ${aspect.planet2} creates a significant dynamic in your chart.`;
  }

  getBeginnerExplanation(planetName) {
    const explanations = {
      'Sun': 'Your Sun sign represents your core identity, ego, and the essence of who you are. It\'s your main personality and how you shine in the world.',
      'Moon': 'Your Moon sign reveals your emotional nature, instincts, and subconscious patterns. It shows how you process feelings and what makes you feel secure.',
      'Mercury': 'Mercury governs communication, thinking, and learning. It shows how you process information and express your thoughts.',
      'Venus': 'Venus rules love, beauty, and values. It reveals what you find attractive and how you express affection.',
      'Mars': 'Mars represents action, energy, and desire. It shows how you assert yourself and pursue your goals.',
      'Jupiter': 'Jupiter is the planet of expansion, luck, and wisdom. It shows where you find growth and opportunities.',
      'Saturn': 'Saturn represents discipline, responsibility, and life lessons. It shows where you need to work hard and grow.',
      'Uranus': 'Uranus brings innovation, rebellion, and sudden changes. It shows where you break free from convention.',
      'Neptune': 'Neptune governs dreams, spirituality, and intuition. It shows your connection to the mystical and creative.',
      'Pluto': 'Pluto represents transformation, power, and regeneration. It shows where you experience deep change.'
    };
    
    return explanations[planetName] || `${planetName} brings unique influences to your astrological profile.`;
  }

  getAspectBeginnerExplanation(aspectName) {
    const explanations = {
      'Conjunction': 'A conjunction occurs when planets are close together, blending their energies intensely.',
      'Opposition': 'An opposition creates tension between planets, requiring balance and integration.',
      'Trine': 'A trine is a harmonious aspect that brings ease and natural talent.',
      'Square': 'A square creates dynamic tension that motivates growth through challenges.',
      'Sextile': 'A sextile offers opportunities and supportive energy between planets.'
    };
    
    return explanations[aspectName] || `This aspect creates a unique relationship between the planets involved.`;
  }

  // Initialize interpretation databases
  initializePlanetInterpretations() {
    return {
      sun: {
        signs: {
          aries: {
            general: "You have a pioneering spirit and natural leadership abilities.",
            personality: "Bold, energetic, and always ready to take initiative.",
            career: "You thrive in leadership roles and competitive environments."
          },
          taurus: {
            general: "You value stability, comfort, and the finer things in life.",
            personality: "Reliable, practical, and deeply sensual.",
            career: "You excel in fields related to finance, art, or luxury goods."
          },
          gemini: {
            general: "You are curious, adaptable, and love to communicate.",
            personality: "Quick-witted, versatile, and socially engaging.",
            career: "You shine in communication, media, or education fields."
          },
          cancer: {
            general: "You are nurturing, intuitive, and deeply emotional.",
            personality: "Caring, protective, and family-oriented.",
            career: "You excel in caregiving, hospitality, or creative fields."
          },
          leo: {
            general: "You have a natural flair for drama and love to be center stage.",
            personality: "Confident, generous, and naturally charismatic.",
            career: "You thrive in entertainment, leadership, or creative industries."
          },
          virgo: {
            general: "You are detail-oriented, practical, and service-minded.",
            personality: "Analytical, helpful, and perfectionist by nature.",
            career: "You excel in healthcare, analysis, or organizational roles."
          },
          libra: {
            general: "You seek harmony, beauty, and balanced relationships.",
            personality: "Diplomatic, charming, and aesthetically minded.",
            career: "You thrive in law, arts, or relationship-focused fields."
          },
          scorpio: {
            general: "You are intense, transformative, and deeply passionate.",
            personality: "Mysterious, powerful, and emotionally profound.",
            career: "You excel in psychology, research, or transformative work."
          },
          sagittarius: {
            general: "You are adventurous, philosophical, and freedom-loving.",
            personality: "Optimistic, honest, and always seeking truth.",
            career: "You thrive in education, travel, or publishing fields."
          },
          capricorn: {
            general: "You are ambitious, disciplined, and goal-oriented.",
            personality: "Responsible, practical, and naturally authoritative.",
            career: "You excel in business, management, or traditional fields."
          },
          aquarius: {
            general: "You are innovative, humanitarian, and unconventional.",
            personality: "Independent, progressive, and intellectually oriented.",
            career: "You thrive in technology, social causes, or innovative fields."
          },
          pisces: {
            general: "You are compassionate, intuitive, and deeply spiritual.",
            personality: "Empathetic, artistic, and emotionally sensitive.",
            career: "You excel in healing, arts, or spiritual guidance."
          }
        }
      },
      moon: {
        signs: {
          aries: {
            emotions: "You have quick, fiery emotions and need independence.",
            general: "Your emotional nature is direct and spontaneous."
          },
          taurus: {
            emotions: "You need emotional security and comfort to feel stable.",
            general: "Your emotional nature is steady and sensual."
          },
          gemini: {
            emotions: "You process emotions through communication and variety.",
            general: "Your emotional nature is curious and changeable."
          },
          cancer: {
            emotions: "You are deeply nurturing and emotionally intuitive.",
            general: "Your emotional nature is protective and caring."
          },
          leo: {
            emotions: "You need appreciation and creative expression emotionally.",
            general: "Your emotional nature is warm and dramatic."
          },
          virgo: {
            emotions: "You process emotions through analysis and service.",
            general: "Your emotional nature is practical and helpful."
          },
          libra: {
            emotions: "You need harmony and partnership for emotional balance.",
            general: "Your emotional nature is diplomatic and relationship-focused."
          },
          scorpio: {
            emotions: "You experience emotions intensely and transformatively.",
            general: "Your emotional nature is deep and powerful."
          },
          sagittarius: {
            emotions: "You need freedom and adventure for emotional fulfillment.",
            general: "Your emotional nature is optimistic and philosophical."
          },
          capricorn: {
            emotions: "You approach emotions with caution and responsibility.",
            general: "Your emotional nature is disciplined and goal-oriented."
          },
          aquarius: {
            emotions: "You intellectualize emotions and value independence.",
            general: "Your emotional nature is detached and humanitarian."
          },
          pisces: {
            emotions: "You are deeply empathetic and emotionally intuitive.",
            general: "Your emotional nature is compassionate and spiritual."
          }
        }
      },
      mercury: {
        signs: {
          aries: {
            general: "You communicate with directness and enthusiasm.",
            communication: "Your thoughts are quick, impulsive, and pioneering.",
            career: "You excel in fast-paced communication and leadership roles."
          },
          taurus: {
            general: "You think methodically and communicate with practical wisdom.",
            communication: "Your thoughts are deliberate, thorough, and grounded.",
            career: "You thrive in fields requiring steady, practical communication."
          },
          gemini: {
            general: "You have a quick wit and love to learn and share information.",
            communication: "Your thoughts are versatile, curious, and rapidly changing.",
            career: "You excel in media, education, or any communication-heavy field."
          },
          cancer: {
            general: "You communicate with emotional sensitivity and intuition.",
            communication: "Your thoughts are influenced by feelings and memories.",
            career: "You shine in nurturing professions or emotional counseling."
          },
          leo: {
            general: "You express yourself with confidence and dramatic flair.",
            communication: "Your thoughts are creative, generous, and attention-seeking.",
            career: "You thrive in entertainment, public speaking, or creative fields."
          },
          virgo: {
            general: "You communicate with precision and attention to detail.",
            communication: "Your thoughts are analytical, critical, and service-oriented.",
            career: "You excel in research, analysis, or health-related fields."
          },
          libra: {
            general: "You seek harmony and balance in all communications.",
            communication: "Your thoughts are diplomatic, fair, and relationship-focused.",
            career: "You thrive in law, mediation, or aesthetic fields."
          },
          scorpio: {
            general: "You communicate with intensity and psychological depth.",
            communication: "Your thoughts are penetrating, secretive, and transformative.",
            career: "You excel in psychology, investigation, or healing work."
          },
          sagittarius: {
            general: "You express yourself with philosophical enthusiasm.",
            communication: "Your thoughts are expansive, optimistic, and truth-seeking.",
            career: "You thrive in education, publishing, or international work."
          },
          capricorn: {
            general: "You communicate with authority and practical purpose.",
            communication: "Your thoughts are structured, ambitious, and goal-oriented.",
            career: "You excel in business, management, or traditional fields."
          },
          aquarius: {
            general: "You think innovatively and communicate unique perspectives.",
            communication: "Your thoughts are independent, progressive, and humanitarian.",
            career: "You thrive in technology, social causes, or innovative fields."
          },
          pisces: {
            general: "You communicate with empathy and artistic sensitivity.",
            communication: "Your thoughts are intuitive, compassionate, and dreamy.",
            career: "You excel in healing arts, spirituality, or creative expression."
          }
        }
      },
      venus: {
        signs: {
          aries: {
            general: "You love with passion and seek excitement in relationships.",
            love: "Your love style is direct, enthusiastic, and sometimes impulsive.",
            career: "You bring pioneering energy to artistic or beauty-related work."
          },
          taurus: {
            general: "You value stability, sensuality, and material comfort in love.",
            love: "Your love style is steady, sensual, and deeply loyal.",
            career: "You excel in luxury goods, finance, or artistic crafts."
          },
          gemini: {
            general: "You are attracted to intelligence and variety in relationships.",
            love: "Your love style is curious, communicative, and mentally stimulating.",
            career: "You thrive in media, communication, or diverse creative fields."
          },
          cancer: {
            general: "You seek emotional security and nurturing in love.",
            love: "Your love style is caring, protective, and deeply emotional.",
            career: "You excel in hospitality, caregiving, or home-related industries."
          },
          leo: {
            general: "You love dramatically and enjoy being admired and appreciated.",
            love: "Your love style is generous, romantic, and theatrical.",
            career: "You thrive in entertainment, luxury, or creative leadership roles."
          },
          virgo: {
            general: "You express love through acts of service and practical care.",
            love: "Your love style is helpful, modest, and detail-oriented.",
            career: "You excel in health, service, or precision craft industries."
          },
          libra: {
            general: "You seek harmony, beauty, and partnership in all relationships.",
            love: "Your love style is charming, diplomatic, and aesthetically focused.",
            career: "You thrive in law, arts, fashion, or relationship counseling."
          },
          scorpio: {
            general: "You love intensely and seek deep, transformative connections.",
            love: "Your love style is passionate, loyal, and psychologically profound.",
            career: "You excel in psychology, investigation, or transformative work."
          },
          sagittarius: {
            general: "You are attracted to freedom, adventure, and philosophical minds.",
            love: "Your love style is adventurous, optimistic, and freedom-loving.",
            career: "You thrive in travel, education, or international business."
          },
          capricorn: {
            general: "You approach love with seriousness and long-term commitment.",
            love: "Your love style is responsible, ambitious, and traditional.",
            career: "You excel in business, real estate, or traditional luxury fields."
          },
          aquarius: {
            general: "You value friendship, independence, and unique connections.",
            love: "Your love style is unconventional, friendly, and intellectually focused.",
            career: "You thrive in technology, social causes, or innovative arts."
          },
          pisces: {
            general: "You love with compassion and seek spiritual connection.",
            love: "Your love style is empathetic, romantic, and spiritually oriented.",
            career: "You excel in healing arts, music, or spiritual guidance."
          }
        }
      },
      mars: {
        signs: {
          aries: {
            general: "You act with direct energy and competitive drive.",
            attraction: "You're attracted to strong, independent, and confident people.",
            career: "You excel in leadership, sports, or high-energy professions."
          },
          taurus: {
            general: "You act with steady determination and practical persistence.",
            attraction: "You're attracted to stable, sensual, and reliable people.",
            career: "You thrive in finance, construction, or hands-on crafts."
          },
          gemini: {
            general: "You act with mental agility and communicate your desires.",
            attraction: "You're attracted to intelligent, witty, and versatile people.",
            career: "You excel in communication, sales, or diverse skill-based work."
          },
          cancer: {
            general: "You act protectively and with emotional motivation.",
            attraction: "You're attracted to nurturing, emotional, and family-oriented people.",
            career: "You thrive in caregiving, real estate, or protective services."
          },
          leo: {
            general: "You act with confidence and dramatic self-expression.",
            attraction: "You're attracted to creative, confident, and admiring people.",
            career: "You excel in entertainment, leadership, or creative industries."
          },
          virgo: {
            general: "You act with precision and focus on improvement.",
            attraction: "You're attracted to competent, helpful, and detail-oriented people.",
            career: "You thrive in health, service, or analytical professions."
          },
          libra: {
            general: "You act diplomatically and seek balanced cooperation.",
            attraction: "You're attracted to charming, balanced, and aesthetically pleasing people.",
            career: "You excel in law, arts, or partnership-based work."
          },
          scorpio: {
            general: "You act with intensity and transformative power.",
            attraction: "You're attracted to deep, mysterious, and powerful people.",
            career: "You thrive in psychology, investigation, or crisis management."
          },
          sagittarius: {
            general: "You act with enthusiasm and philosophical purpose.",
            attraction: "You're attracted to adventurous, optimistic, and wise people.",
            career: "You excel in education, travel, or international business."
          },
          capricorn: {
            general: "You act with discipline and long-term strategic thinking.",
            attraction: "You're attracted to successful, ambitious, and responsible people.",
            career: "You thrive in business, management, or traditional authority roles."
          },
          aquarius: {
            general: "You act independently with humanitarian and innovative goals.",
            attraction: "You're attracted to unique, independent, and progressive people.",
            career: "You excel in technology, social causes, or innovative fields."
          },
          pisces: {
            general: "You act with compassion and intuitive understanding.",
            attraction: "You're attracted to sensitive, artistic, and spiritual people.",
            career: "You thrive in healing, arts, or spiritual guidance professions."
          }
        }
      },
      jupiter: {
        signs: {
          aries: {
            general: "You grow through leadership, pioneering, and taking bold action.",
            growth: "Your expansion comes through courage and independent initiative.",
            career: "You find success in entrepreneurship and competitive fields."
          },
          taurus: {
            general: "You grow through building security and appreciating life's pleasures.",
            growth: "Your expansion comes through patience and material abundance.",
            career: "You find success in finance, agriculture, or luxury industries."
          },
          gemini: {
            general: "You grow through learning, communicating, and versatile experiences.",
            growth: "Your expansion comes through education and diverse connections.",
            career: "You find success in media, education, or communication fields."
          },
          cancer: {
            general: "You grow through nurturing others and following your intuition.",
            growth: "Your expansion comes through emotional wisdom and caregiving.",
            career: "You find success in hospitality, caregiving, or family businesses."
          },
          leo: {
            general: "You grow through creative self-expression and generous leadership.",
            growth: "Your expansion comes through confidence and creative pursuits.",
            career: "You find success in entertainment, arts, or leadership roles."
          },
          virgo: {
            general: "You grow through service, attention to detail, and practical improvement.",
            growth: "Your expansion comes through helping others and perfecting skills.",
            career: "You find success in healthcare, analysis, or service industries."
          },
          libra: {
            general: "You grow through relationships, justice, and creating harmony.",
            growth: "Your expansion comes through partnership and aesthetic appreciation.",
            career: "You find success in law, arts, or relationship-focused work."
          },
          scorpio: {
            general: "You grow through transformation, depth, and uncovering truth.",
            growth: "Your expansion comes through psychological insight and rebirth.",
            career: "You find success in psychology, research, or transformative work."
          },
          sagittarius: {
            general: "You grow through travel, philosophy, and expanding your horizons.",
            growth: "Your expansion comes through adventure and higher learning.",
            career: "You find success in education, travel, or international business."
          },
          capricorn: {
            general: "You grow through discipline, responsibility, and achieving recognition.",
            growth: "Your expansion comes through hard work and traditional success.",
            career: "You find success in business, government, or traditional institutions."
          },
          aquarius: {
            general: "You grow through innovation, friendship, and humanitarian causes.",
            growth: "Your expansion comes through progressive ideals and group work.",
            career: "You find success in technology, social causes, or innovative fields."
          },
          pisces: {
            general: "You grow through compassion, spirituality, and artistic expression.",
            growth: "Your expansion comes through intuition and universal love.",
            career: "You find success in healing arts, spirituality, or creative expression."
          }
        }
      },
      saturn: {
        signs: {
          aries: {
            general: "You learn discipline through developing patience and strategic action.",
            work: "Your work style requires learning to channel impulsive energy constructively.",
            career: "You master leadership through overcoming impatience and recklessness."
          },
          taurus: {
            general: "You learn discipline through building lasting security and resisting change.",
            work: "Your work style is methodical but may resist necessary adaptations.",
            career: "You master stability through learning when to adapt and when to persist."
          },
          gemini: {
            general: "You learn discipline through focusing scattered mental energy.",
            work: "Your work style requires learning to complete tasks and communicate clearly.",
            career: "You master communication through developing depth and follow-through."
          },
          cancer: {
            general: "You learn discipline through emotional maturity and self-protection.",
            work: "Your work style involves learning to balance caring with professional boundaries.",
            career: "You master nurturing through developing emotional resilience."
          },
          leo: {
            general: "You learn discipline through tempering ego and developing authentic confidence.",
            work: "Your work style requires learning to lead through service rather than ego.",
            career: "You master creative expression through humble dedication to craft."
          },
          virgo: {
            general: "You learn discipline through perfectionism and critical self-assessment.",
            work: "Your work style involves learning when good enough is sufficient.",
            career: "You master service through balancing criticism with compassion."
          },
          libra: {
            general: "You learn discipline through making decisions and committing to choices.",
            work: "Your work style requires learning to act decisively in partnerships.",
            career: "You master balance through developing personal conviction."
          },
          scorpio: {
            general: "You learn discipline through emotional control and transformative work.",
            work: "Your work style involves learning to use power responsibly.",
            career: "You master transformation through patient, methodical change."
          },
          sagittarius: {
            general: "You learn discipline through focusing expansive energy on concrete goals.",
            work: "Your work style requires learning to complete what you start.",
            career: "You master wisdom through practical application of knowledge."
          },
          capricorn: {
            general: "You learn discipline through responsibility and long-term achievement.",
            work: "Your work style naturally embodies discipline and systematic progress.",
            career: "You master authority through patient, persistent effort."
          },
          aquarius: {
            general: "You learn discipline through consistent application of innovative ideas.",
            work: "Your work style requires learning to implement visionary concepts practically.",
            career: "You master originality through systematic development of unique talents."
          },
          pisces: {
            general: "You learn discipline through grounding spiritual insights in reality.",
            work: "Your work style involves learning to structure intuitive gifts.",
            career: "You master compassion through practical service to others."
          }
        }
      },
      uranus: {
        signs: {
          aries: {
            general: "You revolutionize through pioneering action and bold independence.",
            transformation: "Your changes come suddenly through courageous innovation.",
            career: "You bring breakthrough energy to leadership and competitive fields."
          },
          taurus: {
            general: "You revolutionize material values and challenge traditional security.",
            transformation: "Your changes involve restructuring resources and values.",
            career: "You innovate in finance, agriculture, or sustainable practices."
          },
          gemini: {
            general: "You revolutionize communication and challenge conventional thinking.",
            transformation: "Your changes come through new ideas and communication methods.",
            career: "You innovate in media, technology, or educational systems."
          },
          cancer: {
            general: "You revolutionize home, family, and emotional expression.",
            transformation: "Your changes involve breaking from family traditions and emotional patterns.",
            career: "You innovate in caregiving, real estate, or family-related fields."
          },
          leo: {
            general: "You revolutionize creative expression and challenge traditional authority.",
            transformation: "Your changes involve unique self-expression and creative breakthroughs.",
            career: "You innovate in entertainment, arts, or leadership styles."
          },
          virgo: {
            general: "You revolutionize work methods and health practices.",
            transformation: "Your changes involve improving systems and analytical methods.",
            career: "You innovate in health, technology, or analytical processes."
          },
          libra: {
            general: "You revolutionize relationships and challenge social conventions.",
            transformation: "Your changes involve new approaches to partnership and justice.",
            career: "You innovate in law, arts, or social reform movements."
          },
          scorpio: {
            general: "You revolutionize power structures and psychological understanding.",
            transformation: "Your changes involve deep, transformative insights into human nature.",
            career: "You innovate in psychology, investigation, or healing practices."
          },
          sagittarius: {
            general: "You revolutionize philosophy, education, and belief systems.",
            transformation: "Your changes involve expanding consciousness and challenging dogma.",
            career: "You innovate in education, religion, or international relations."
          },
          capricorn: {
            general: "You revolutionize authority structures and traditional institutions.",
            transformation: "Your changes involve restructuring established systems.",
            career: "You innovate in business, government, or institutional reform."
          },
          aquarius: {
            general: "You revolutionize through humanitarian ideals and technological innovation.",
            transformation: "Your changes involve progressive social reform and group consciousness.",
            career: "You innovate in technology, social causes, or collective endeavors."
          },
          pisces: {
            general: "You revolutionize spirituality and challenge material limitations.",
            transformation: "Your changes involve transcending boundaries and expanding compassion.",
            career: "You innovate in healing arts, spirituality, or artistic expression."
          }
        }
      },
      neptune: {
        signs: {
          aries: {
            general: "You channel spiritual energy through pioneering action and leadership.",
            spirituality: "Your spiritual path involves inspired action and courageous faith.",
            transformation: "You dissolve barriers through bold spiritual initiative."
          },
          taurus: {
            general: "You channel spiritual energy through appreciation of natural beauty.",
            spirituality: "Your spiritual path involves finding the sacred in material world.",
            transformation: "You dissolve materialism through spiritual abundance."
          },
          gemini: {
            general: "You channel spiritual energy through communication and learning.",
            spirituality: "Your spiritual path involves sharing wisdom and diverse spiritual practices.",
            transformation: "You dissolve mental barriers through expansive thinking."
          },
          cancer: {
            general: "You channel spiritual energy through nurturing and emotional healing.",
            spirituality: "Your spiritual path involves compassionate caregiving and intuitive wisdom.",
            transformation: "You dissolve emotional wounds through universal love."
          },
          leo: {
            general: "You channel spiritual energy through creative self-expression.",
            spirituality: "Your spiritual path involves inspiring others through creative gifts.",
            transformation: "You dissolve ego through generous service to others."
          },
          virgo: {
            general: "You channel spiritual energy through practical service and healing.",
            spirituality: "Your spiritual path involves humble service and attention to detail.",
            transformation: "You dissolve perfectionism through accepting divine imperfection."
          },
          libra: {
            general: "You channel spiritual energy through relationships and artistic beauty.",
            spirituality: "Your spiritual path involves finding balance and creating harmony.",
            transformation: "You dissolve conflict through understanding and cooperation."
          },
          scorpio: {
            general: "You channel spiritual energy through deep transformation and healing.",
            spirituality: "Your spiritual path involves confronting darkness to find light.",
            transformation: "You dissolve fear through embracing life's mysteries."
          },
          sagittarius: {
            general: "You channel spiritual energy through teaching and expanding consciousness.",
            spirituality: "Your spiritual path involves seeking truth and sharing wisdom.",
            transformation: "You dissolve limitations through faith and higher understanding."
          },
          capricorn: {
            general: "You channel spiritual energy through disciplined spiritual practice.",
            spirituality: "Your spiritual path involves structured meditation and responsible service.",
            transformation: "You dissolve materialism through spiritual achievement."
          },
          aquarius: {
            general: "You channel spiritual energy through humanitarian service and innovation.",
            spirituality: "Your spiritual path involves serving humanity and progressive ideals.",
            transformation: "You dissolve separation through universal brotherhood."
          },
          pisces: {
            general: "You channel spiritual energy through compassion and artistic inspiration.",
            spirituality: "Your spiritual path involves transcendence and universal love.",
            transformation: "You dissolve boundaries through mystical union with the divine."
          }
        }
      },
      pluto: {
        signs: {
          aries: {
            general: "You transform through bold action and pioneering new approaches to power.",
            transformation: "Your regeneration comes through courageous self-assertion and leadership.",
            career: "You revolutionize through dynamic leadership and competitive innovation."
          },
          taurus: {
            general: "You transform through revolutionizing values and material security.",
            transformation: "Your regeneration comes through changing relationship with resources.",
            career: "You revolutionize finance, agriculture, or sustainable practices."
          },
          gemini: {
            general: "You transform through revolutionizing communication and mental processes.",
            transformation: "Your regeneration comes through new ways of thinking and expressing.",
            career: "You revolutionize media, education, or information systems."
          },
          cancer: {
            general: "You transform through healing family patterns and emotional depths.",
            transformation: "Your regeneration comes through emotional healing and nurturing.",
            career: "You revolutionize caregiving, family systems, or emotional healing."
          },
          leo: {
            general: "You transform through revolutionizing creative expression and personal power.",
            transformation: "Your regeneration comes through authentic self-expression and leadership.",
            career: "You revolutionize entertainment, arts, or leadership approaches."
          },
          virgo: {
            general: "You transform through revolutionizing work, health, and service methods.",
            transformation: "Your regeneration comes through perfecting skills and serving others.",
            career: "You revolutionize healthcare, analysis, or service industries."
          },
          libra: {
            general: "You transform through revolutionizing relationships and social justice.",
            transformation: "Your regeneration comes through balanced partnerships and fair cooperation.",
            career: "You revolutionize law, arts, or social reform movements."
          },
          scorpio: {
            general: "You transform through deep psychological insight and power dynamics.",
            transformation: "Your regeneration comes through confronting and healing shadow aspects.",
            career: "You revolutionize psychology, investigation, or transformative healing."
          },
          sagittarius: {
            general: "You transform through revolutionizing belief systems and higher learning.",
            transformation: "Your regeneration comes through expanding consciousness and seeking truth.",
            career: "You revolutionize education, philosophy, or international understanding."
          },
          capricorn: {
            general: "You transform through revolutionizing authority structures and institutions.",
            transformation: "Your regeneration comes through responsible use of power and achievement.",
            career: "You revolutionize business, government, or traditional institutions."
          },
          aquarius: {
            general: "You transform through revolutionizing social systems and group consciousness.",
            transformation: "Your regeneration comes through humanitarian service and innovation.",
            career: "You revolutionize technology, social causes, or collective endeavors."
          },
          pisces: {
            general: "You transform through spiritual transcendence and universal compassion.",
            transformation: "Your regeneration comes through surrendering ego and embracing unity.",
            career: "You revolutionize healing arts, spirituality, or artistic expression."
          }
        }
      }
    };
  }

  initializeSignInterpretations() {
    return {
      aries: {
        element: 'Fire',
        quality: 'Cardinal',
        keywords: ['pioneering', 'energetic', 'independent', 'courageous'],
        description: 'The first sign of the zodiac, representing new beginnings and leadership.'
      },
      taurus: {
        element: 'Earth',
        quality: 'Fixed',
        keywords: ['stable', 'practical', 'sensual', 'determined'],
        description: 'The sign of stability and material security, valuing comfort and beauty.'
      }
      // Additional signs would be added here...
    };
  }

  initializeHouseInterpretations() {
    return {
      1: { 
        theme: 'Identity & Appearance', 
        description: 'How you present yourself to the world',
        planetInterpretations: {
          sun: "You have a strong, confident presence and natural leadership abilities. Your identity is clearly defined and you're comfortable being the center of attention. You approach life with vitality and express your ego openly.",
          moon: "You wear your emotions on your sleeve and have a nurturing, protective demeanor. Your mood changes are visible to others, and you instinctively respond to your environment. You appear caring and emotionally available.",
          mercury: "You come across as intelligent, communicative, and mentally agile. You're always ready with a quick response and enjoy intellectual discussions. Your curiosity and wit are immediately apparent to others.",
          venus: "You have natural charm, grace, and aesthetic appeal. Others find you attractive and pleasant to be around. You value harmony and beauty, and this shows in your appearance and mannerisms.",
          mars: "You project energy, courage, and assertiveness. You appear dynamic and action-oriented, sometimes coming across as impatient or aggressive. You're naturally competitive and don't back down from challenges.",
          jupiter: "You have an optimistic, generous presence that inspires others. You appear wise, jovial, and larger-than-life. People are drawn to your positive energy and philosophical outlook on life.",
          saturn: "You appear serious, responsible, and mature beyond your years. Others see you as reliable and disciplined, though sometimes cold or distant. You project authority and self-control.",
          uranus: "You have a unique, unconventional presence that sets you apart. You appear innovative, eccentric, and unpredictable. Others see you as original and ahead of your time.",
          neptune: "You have a mysterious, ethereal quality that others find intriguing. You may appear dreamy, artistic, or spiritually inclined. Sometimes you seem elusive or hard to pin down.",
          pluto: "You have an intense, magnetic presence that others find compelling yet intimidating. You project power and depth, and people sense there's more to you than meets the eye."
        }
      },
      2: { 
        theme: 'Values & Resources', 
        description: 'Your relationship with money and possessions',
        planetInterpretations: {
          sun: "Your sense of self-worth is tied to material security and possessions. You take pride in what you own and work hard to build financial stability. You value quality over quantity.",
          moon: "Your emotional security depends on material comfort and financial stability. You have strong attachments to possessions, especially those with sentimental value. You're intuitive about money matters.",
          mercury: "You think constantly about money and resources. You're good at financial planning and may earn through communication, writing, or intellectual work. You value information and education.",
          venus: "You love luxury and beautiful things, sometimes overspending on items that bring pleasure. You have good taste and may earn through artistic or beauty-related work. You value harmony and comfort.",
          mars: "You're aggressive about earning money and building resources. You're willing to work hard and take risks for financial gain. You may be impulsive with spending or competitive about wealth.",
          jupiter: "You have an optimistic approach to money and tend to be generous with resources. You believe in abundance and may experience cycles of wealth and loss. You value growth and expansion.",
          saturn: "You're cautious and disciplined with money, preferring to save rather than spend. You work methodically to build long-term security. You value stability and traditional investments.",
          uranus: "Your income may be irregular or come from unusual sources. You have innovative ideas about money and may invest in technology or humanitarian causes. You value independence over security.",
          neptune: "You may be unrealistic about money or prone to financial confusion. You're generous to a fault and may sacrifice material gain for spiritual values. You value compassion over wealth.",
          pluto: "You have intense feelings about money and power. You're capable of complete financial transformation and may deal with shared resources or investments. You value control and regeneration."
        }
      },
      3: { 
        theme: 'Communication & Learning', 
        description: 'How you think and communicate',
        planetInterpretations: {
          sun: "You express yourself with confidence and authority. You're a natural teacher or speaker and enjoy being heard. Your communication style reflects your core identity and values.",
          moon: "Your communication is emotional and intuitive. You speak from the heart and are sensitive to others' words. Your thinking is influenced by moods and feelings.",
          mercury: "This is Mercury's natural house, amplifying your communication skills. You're articulate, quick-witted, and love learning. You may work in fields requiring strong communication abilities.",
          venus: "You communicate with charm and diplomacy. You have a pleasant speaking voice and are skilled at maintaining harmony in conversations. You think about relationships and aesthetics.",
          mars: "Your communication is direct, forceful, and sometimes aggressive. You speak quickly and decisively, but may be impatient with others. You think in terms of action and competition.",
          jupiter: "You're an inspiring speaker with a philosophical bent. You love sharing knowledge and may exaggerate for effect. Your thinking is broad and optimistic.",
          saturn: "You communicate seriously and with authority. You're careful with words and prefer facts to speculation. Your thinking is structured, practical, and methodical.",
          uranus: "Your communication style is unique and unconventional. You have original ideas and may shock others with your perspectives. You think in innovative, progressive ways.",
          neptune: "You communicate with imagination and sensitivity. You may be poetic or artistic in expression but sometimes unclear. Your thinking is intuitive and spiritual.",
          pluto: "Your words carry power and intensity. You communicate about deep, transformative topics and may have persuasive abilities. Your thinking penetrates beneath the surface."
        }
      },
      4: { 
        theme: 'Home & Family', 
        description: 'Your roots and emotional foundation',
        planetInterpretations: {
          sun: "Your identity is strongly connected to your family and home. You take pride in your roots and may be the central figure in family matters. You need a strong home base to shine.",
          moon: "This is the Moon's natural house, emphasizing your deep connection to home and family. You're nurturing and protective of loved ones and need emotional security at home.",
          mercury: "You think and communicate about family matters frequently. Your home may be a center of learning or communication. You're curious about your ancestry and family history.",
          venus: "You create a beautiful, harmonious home environment. Family relationships are important to you, and you may be the peacemaker. You value comfort and aesthetics in your living space.",
          mars: "You're protective and sometimes aggressive about family matters. You may have conflicts with family or be the fighter for family causes. You're energetic about home improvement.",
          jupiter: "You come from an optimistic, generous family background. Your home may be large or welcoming to many people. You find wisdom and growth through family connections.",
          saturn: "You may have a serious or restrictive family background. You learn discipline through family responsibilities and may become the family authority figure. You value traditional family structures.",
          uranus: "Your family background is unique or unconventional. You may break from family traditions or have an unusual home situation. You value independence from family expectations.",
          neptune: "Your family background may be unclear or idealized. You're emotionally sensitive to family dynamics and may sacrifice for family members. You value spiritual or artistic family traditions.",
          pluto: "Your family has experienced deep transformations or power struggles. You may uncover family secrets or be the agent of family change. You value emotional intensity and truth in family relationships."
        }
      },
      5: { 
        theme: 'Creativity & Romance', 
        description: 'Self-expression and pleasure',
        planetInterpretations: {
          sun: "You shine through creative self-expression and romantic pursuits. You're naturally dramatic and enjoy being appreciated for your talents. You approach pleasure with confidence and generosity.",
          moon: "Your emotions find expression through creativity and romance. You're protective of your creative works and romantic partners. You need emotional fulfillment through self-expression.",
          mercury: "You think creatively and communicate about artistic matters. You may write, teach, or speak about creative subjects. You're playful and witty in romantic situations.",
          venus: "This is a natural placement for Venus, enhancing your romantic and artistic nature. You're charming in love and have refined creative tastes. You seek pleasure and beauty in life.",
          mars: "You pursue romance and creative projects with passion and energy. You're competitive in love and may be attracted to dramatic relationships. You're bold in self-expression.",
          jupiter: "You approach creativity and romance with optimism and expansion. You're generous in love and may have multiple creative interests. You find joy and meaning through self-expression.",
          saturn: "You're serious about creative work and may face restrictions in romance. You develop artistic skills through discipline and may prefer mature romantic partners. You value commitment in love.",
          uranus: "Your creative expression is unique and original. You're attracted to unusual romantic partners or unconventional relationships. You value freedom in both love and creativity.",
          neptune: "You're highly imaginative and romantic. Your creative work may be inspired or spiritual. You idealize romantic partners and may sacrifice for love. You value artistic and spiritual expression.",
          pluto: "Your creative expression is intense and transformative. You're passionate in romance and may experience powerful love affairs. You value depth and authenticity in self-expression."
        }
      },
      6: { 
        theme: 'Work & Health', 
        description: 'Daily routines and service to others',
        planetInterpretations: {
          sun: "You identify strongly with your work and daily routines. You take pride in being of service and maintaining good health. You shine through helping others and being reliable.",
          moon: "Your emotional well-being depends on having meaningful work and healthy routines. You're nurturing in service roles and may work in caregiving professions. You're sensitive to work environments.",
          mercury: "You think analytically about work and health matters. You're skilled at organizing and may work in fields requiring attention to detail. You communicate well with coworkers and about health.",
          venus: "You seek harmony and beauty in your work environment. You're diplomatic with coworkers and may work in artistic or service fields. You value pleasant working conditions and healthy pleasures.",
          mars: "You're energetic and assertive at work. You may be competitive with coworkers or work in physical professions. You're proactive about health and fitness, sometimes to excess.",
          jupiter: "You find growth and opportunity through service work. You're optimistic about health and may work in education, publishing, or international fields. You value meaningful, expansive work.",
          saturn: "You're disciplined and responsible in work matters. You may work in traditional fields or positions of authority. You take a serious approach to health and may have restrictions in these areas.",
          uranus: "You prefer unusual or innovative work environments. You may work in technology or humanitarian fields. You have unique approaches to health and may experience sudden health changes.",
          neptune: "You're drawn to service work that helps others spiritually or emotionally. You may work in healing, arts, or charitable fields. You need to be realistic about work and health matters.",
          pluto: "You're intensely focused on work and may deal with power dynamics in the workplace. You have strong healing abilities and may experience health transformations. You value meaningful, transformative work."
        }
      },
      7: { 
        theme: 'Partnerships', 
        description: 'One-on-one relationships and marriage',
        planetInterpretations: {
          sun: "Your identity is strongly connected to partnerships. You shine through one-on-one relationships and may be drawn to confident, leader-type partners. You take pride in your relationships.",
          moon: "Your emotional security depends on close partnerships. You're nurturing in relationships and may attract dependent or needy partners. You need emotional closeness and understanding.",
          mercury: "You think constantly about relationships and communicate well with partners. You may be attracted to intelligent, communicative partners. You need mental compatibility in relationships.",
          venus: "This is a natural placement for Venus, enhancing your partnership abilities. You're charming and diplomatic in relationships and attract loving, harmonious partnerships. You value beauty and balance in love.",
          mars: "You pursue relationships with passion and may be aggressive about finding partners. You may be attracted to energetic, assertive partners or experience conflict in relationships.",
          jupiter: "You're optimistic about relationships and may attract generous, wise partners. You find growth through partnerships and may have relationships with people from different backgrounds or cultures.",
          saturn: "You take relationships seriously and prefer committed, long-term partnerships. You may marry later in life or be attracted to older, more mature partners. You learn discipline through relationships.",
          uranus: "You're attracted to unusual, independent partners. Your relationships may be unconventional or experience sudden changes. You value freedom and equality in partnerships.",
          neptune: "You idealize partners and may be attracted to artistic, spiritual, or compassionate people. You may sacrifice for relationships or experience confusion about partnership needs.",
          pluto: "You experience intense, transformative relationships. You may attract powerful partners or relationships that involve joint resources. You value depth and authenticity in partnerships."
        }
      },
      8: { 
        theme: 'Transformation', 
        description: 'Shared resources and deep change',
        planetInterpretations: {
          sun: "Your identity involves dealing with shared resources and transformation. You may work in finance, psychology, or healing fields. You shine through helping others transform.",
          moon: "Your emotional security involves shared resources or deep psychological work. You're intuitive about others' motivations and may have psychic abilities. You need emotional depth and intensity.",
          mercury: "You think deeply about psychological matters and may be interested in research or investigation. You communicate about taboo subjects and are curious about hidden knowledge.",
          venus: "You're attracted to deep, intense relationships involving shared resources. You may benefit financially through partnerships or have artistic talents related to transformation themes.",
          mars: "You're aggressive about shared resources and may be competitive about money or power. You have strong desires and may be attracted to intense, sexual relationships.",
          jupiter: "You find growth through dealing with shared resources or crisis situations. You may be generous with others' money or benefit from inheritances, loans, or investments.",
          saturn: "You're disciplined about shared resources and may work in finance or insurance. You learn hard lessons through transformation and may fear deep change or intimacy.",
          uranus: "You experience sudden changes involving shared resources or transformation. You may have unique investment strategies or experience unexpected financial gains or losses.",
          neptune: "You may be unrealistic about shared resources or prone to financial deception. You're drawn to spiritual transformation and may have healing or psychic abilities.",
          pluto: "This is Pluto's natural house, intensifying themes of transformation and shared resources. You have powerful regenerative abilities and may work with other people's money or in healing fields."
        }
      },
      9: { 
        theme: 'Philosophy & Travel', 
        description: 'Higher learning and spiritual beliefs',
        planetInterpretations: {
          sun: "Your identity involves higher learning, travel, or spiritual pursuits. You shine through teaching, publishing, or sharing philosophical insights. You take pride in your beliefs and knowledge.",
          moon: "Your emotional security comes through higher learning or spiritual beliefs. You may be drawn to foreign cultures or have an emotional connection to travel and philosophy.",
          mercury: "You think philosophically and may be interested in higher education or foreign languages. You communicate about spiritual or educational matters and love learning new perspectives.",
          venus: "You're attracted to foreign cultures, higher learning, or spiritual pursuits. You may find love through travel or education and value philosophical compatibility in relationships.",
          mars: "You're aggressive about promoting your beliefs and may be competitive in academic or religious settings. You're energetic about travel and may be drawn to adventure or foreign countries.",
          jupiter: "This is Jupiter's natural house, enhancing your interest in higher learning, travel, and philosophy. You're naturally wise and may work in education, publishing, or international fields.",
          saturn: "You're serious about higher learning and may pursue advanced degrees. You have structured beliefs and may work in traditional educational or religious institutions.",
          uranus: "You have unique philosophical beliefs and may be drawn to alternative forms of higher learning. You're innovative in education or may have unusual experiences while traveling.",
          neptune: "You're drawn to spiritual or mystical beliefs. You may be idealistic about foreign cultures or have inspirational experiences through travel or higher learning.",
          pluto: "You experience deep transformation through higher learning or spiritual pursuits. Your beliefs may undergo complete changes, and you're drawn to profound philosophical or spiritual truths."
        }
      },
      10: { 
        theme: 'Career & Reputation', 
        description: 'Your public image and life direction',
        planetInterpretations: {
          sun: "Your career and public image are central to your identity. You're naturally drawn to leadership positions and want to be recognized for your achievements. You shine in your professional life.",
          moon: "Your emotional security depends on career success and public recognition. You may work in fields involving the public or women. Your reputation may fluctuate with your moods.",
          mercury: "You may work in communication, media, or education fields. You're known for your intelligence and communication skills. Your reputation is built on mental abilities and versatility.",
          venus: "You may work in artistic, beauty, or luxury fields. You're known for your charm and diplomatic abilities. You value harmony in your professional life and have a pleasant public image.",
          mars: "You're aggressive about career advancement and may work in competitive fields. You're known for your energy and drive. You may have conflicts with authority figures or public controversies.",
          jupiter: "You're optimistic about career success and may work in education, publishing, or international fields. You're known for your wisdom and generosity. Your reputation tends to be positive and expansive.",
          saturn: "You work hard and methodically toward career goals. You may be attracted to traditional professions or positions of authority. You build a solid, respectable reputation over time.",
          uranus: "Your career path may be unusual or involve frequent changes. You're known for your originality and may work in technology or humanitarian fields. Your reputation may be unconventional.",
          neptune: "You may work in artistic, spiritual, or charitable fields. Your public image may be idealized or unclear. You're known for your compassion and imagination, but may face reputation confusion.",
          pluto: "You're intensely focused on career success and may experience complete career transformations. You're known for your power and intensity. You may work in fields involving transformation or shared resources."
        }
      },
      11: { 
        theme: 'Friends & Groups', 
        description: 'Social networks and future goals',
        planetInterpretations: {
          sun: "Your identity involves group activities and social causes. You shine through friendships and may be a natural leader in group settings. You take pride in your social connections.",
          moon: "Your emotional security comes through friendships and group activities. You're nurturing within your social circle and may attract needy friends. You need emotional support from groups.",
          mercury: "You think about social issues and communicate well within groups. You may have many acquaintances and be involved in organizations focused on learning or communication.",
          venus: "You have charming friendships and may be attracted to artistic or social groups. You value harmony within your social circle and may find love through friendships or group activities.",
          mars: "You're energetic about group activities and may be competitive within social circles. You're drawn to activist groups or organizations focused on action and change.",
          jupiter: "You're optimistic about friendships and may have friends from diverse backgrounds. You find growth through group activities and may be involved in educational or international organizations.",
          saturn: "You're serious about friendships and may prefer smaller, more committed social circles. You work hard toward group goals and may take on responsibility within organizations.",
          uranus: "This is Uranus's natural house, enhancing your connection to progressive groups and humanitarian causes. You have unique friendships and may be involved in revolutionary or technological organizations.",
          neptune: "You're drawn to spiritual or charitable groups. You may idealize your friendships or be attracted to artistic or healing organizations. You're compassionate within your social circle.",
          pluto: "You experience intense friendships and may be involved in transformative group activities. You're drawn to powerful organizations or groups focused on deep change and regeneration."
        }
      },
      12: { 
        theme: 'Spirituality & Subconscious', 
        description: 'Hidden strengths and spiritual connection',
        planetInterpretations: {
          sun: "Your ego and identity may be hidden or sacrificed for spiritual purposes. You shine through behind-the-scenes work or spiritual service. You may struggle with self-expression.",
          moon: "Your emotions are deeply hidden and you may be psychically sensitive. You need solitude and may have strong dream life or intuitive abilities. You're drawn to water and quiet places.",
          mercury: "Your thinking may be intuitive or confused. You may have hidden knowledge or be drawn to mystical studies. You communicate better through writing or art than direct speech.",
          venus: "You may have secret loves or hidden artistic talents. You're drawn to spiritual or charitable work involving beauty or harmony. You may sacrifice for love or make financial donations anonymously.",
          mars: "Your assertiveness may be hidden or expressed through spiritual or charitable work. You may have hidden enemies or need to overcome self-defeating behaviors. You're drawn to solitary physical activities.",
          jupiter: "You find wisdom through spiritual practices or behind-the-scenes work. You may be generous in hidden ways or drawn to mystical studies. You find growth through solitude and reflection.",
          saturn: "You may face hidden restrictions or have fears related to spirituality. You learn discipline through solitude and may work in institutions or behind-the-scenes roles. You value spiritual structure.",
          uranus: "You may have unique spiritual insights or sudden intuitive revelations. You're drawn to progressive spiritual practices or may rebel against traditional religion. You value spiritual freedom.",
          neptune: "This is Neptune's natural house, enhancing your spiritual sensitivity and psychic abilities. You're drawn to mystical practices and may have strong artistic or healing gifts. You value transcendence.",
          pluto: "You experience deep spiritual transformation and may have powerful psychic abilities. You're drawn to hidden knowledge and may work with people in crisis or transformation. You value spiritual power."
        }
      }
    };
  }

  initializeAspectInterpretations() {
    return {
      conjunction: {
        general: 'blends intensely with',
        influence: 'powerful and focused',
        combinations: {
          sun_moon: 'Your conscious and unconscious minds work in perfect harmony, creating strong self-awareness and emotional integration.',
          sun_mercury: 'Your identity and communication style are closely linked, making you an authentic and confident speaker.',
          sun_venus: 'Your personality radiates charm and creativity, making you naturally attractive and artistic.',
          sun_mars: 'Your identity is powerfully expressed through action and leadership, giving you dynamic personal magnetism.',
          sun_jupiter: 'Your personality expands with optimism and wisdom, making you naturally inspiring and generous.',
          sun_saturn: 'Your identity is grounded in responsibility and achievement, giving you natural authority and discipline.',
          sun_uranus: 'Your personality is uniquely original and innovative, making you a natural revolutionary and inventor.',
          sun_neptune: 'Your identity is spiritually inspired and compassionate, giving you artistic and healing gifts.',
          sun_pluto: 'Your personality carries intense transformative power, making you a natural healer and regenerator.',
          moon_mercury: 'Your emotions and thoughts blend seamlessly, giving you intuitive communication abilities.',
          moon_venus: 'Your emotional nature is harmonious and loving, creating natural artistic and relationship gifts.',
          moon_mars: 'Your emotions drive your actions powerfully, giving you passionate and protective instincts.',
          moon_jupiter: 'Your emotional nature is optimistic and expansive, creating natural wisdom and generosity.',
          moon_saturn: 'Your emotions are disciplined and mature, giving you emotional stability and endurance.',
          moon_uranus: 'Your emotional nature is independent and innovative, creating unique intuitive insights.',
          moon_neptune: 'Your emotions are spiritually sensitive and compassionate, giving you psychic and artistic abilities.',
          moon_pluto: 'Your emotional nature is intensely transformative, creating powerful healing and regenerative abilities.',
          mercury_venus: 'Your communication is charming and diplomatic, giving you natural artistic and social abilities.',
          mercury_mars: 'Your thoughts translate directly into action, creating quick decision-making and assertive communication.',
          mercury_jupiter: 'Your mind is philosophical and expansive, giving you natural teaching and publishing abilities.',
          mercury_saturn: 'Your thinking is structured and disciplined, creating excellent analytical and organizational skills.',
          mercury_uranus: 'Your mind is innovative and original, giving you breakthrough insights and inventive abilities.',
          mercury_neptune: 'Your communication is intuitive and inspired, creating artistic and spiritual expression abilities.',
          mercury_pluto: 'Your thinking penetrates deeply into mysteries, giving you investigative and transformative communication.',
          venus_mars: 'Your love nature and passion are perfectly balanced, creating magnetic attraction and artistic drive.',
          venus_jupiter: 'Your love nature is generous and expansive, creating abundant relationships and artistic opportunities.',
          venus_saturn: 'Your love nature is committed and enduring, creating stable relationships and disciplined artistic work.',
          venus_uranus: 'Your love nature is independent and unconventional, creating unique relationships and innovative art.',
          venus_neptune: 'Your love nature is spiritually inspired and compassionate, creating transcendent relationships and art.',
          venus_pluto: 'Your love nature is intensely transformative, creating powerful relationships and profound artistic expression.',
          mars_jupiter: 'Your actions are guided by wisdom and optimism, creating successful leadership and adventurous spirit.',
          mars_saturn: 'Your actions are disciplined and strategic, creating persistent achievement and structured progress.',
          mars_uranus: 'Your actions are innovative and revolutionary, creating breakthrough leadership and sudden changes.',
          mars_neptune: 'Your actions are spiritually motivated and compassionate, creating inspired service and artistic action.',
          mars_pluto: 'Your actions carry transformative power, creating intense drive and regenerative capabilities.',
          jupiter_saturn: 'Your expansion is balanced with discipline, creating wise leadership and structured growth.',
          jupiter_uranus: 'Your expansion is innovative and revolutionary, creating progressive wisdom and humanitarian leadership.',
          jupiter_neptune: 'Your expansion is spiritually inspired, creating mystical wisdom and compassionate leadership.',
          jupiter_pluto: 'Your expansion is intensely transformative, creating powerful wisdom and regenerative leadership.',
          saturn_uranus: 'Your discipline is innovatively applied, creating structured revolution and systematic breakthroughs.',
          saturn_neptune: 'Your discipline is spiritually inspired, creating structured service and grounded mysticism.',
          saturn_pluto: 'Your discipline carries transformative power, creating systematic regeneration and structured transformation.',
          uranus_neptune: 'Your innovation is spiritually inspired, creating revolutionary compassion and inspired breakthroughs.',
          uranus_pluto: 'Your innovation is intensely transformative, creating revolutionary change and systematic regeneration.',
          neptune_pluto: 'Your spirituality is powerfully transformative, creating profound mysticism and regenerative compassion.'
        }
      },
      opposition: {
        general: 'creates tension with',
        influence: 'challenging but growth-oriented',
        combinations: {
          sun_moon: 'You may feel torn between your conscious desires and emotional needs, requiring balance and integration.',
          sun_mercury: 'Your identity and communication may clash, requiring you to align your words with your authentic self.',
          sun_venus: 'Your personal desires may conflict with your values, requiring balance between ego and love.',
          sun_mars: 'Your identity and actions may be at odds, requiring you to channel aggression constructively.',
          sun_jupiter: 'Your ego may conflict with your beliefs, requiring moderation and realistic optimism.',
          sun_saturn: 'There\'s tension between your self-expression and responsibilities, teaching discipline and patience.',
          sun_uranus: 'Your identity conflicts with your need for freedom, requiring authentic self-expression.',
          sun_neptune: 'Your ego may dissolve into confusion, requiring clear boundaries and spiritual grounding.',
          sun_pluto: 'Power struggles challenge your identity, requiring transformation and authentic empowerment.',
          moon_mercury: 'Your emotions and logic conflict, requiring integration of feeling and thinking.',
          moon_venus: 'Your emotional needs may conflict with your values, requiring balance in relationships.',
          moon_mars: 'Your emotions and actions are at odds, requiring emotional self-control and assertiveness.',
          moon_jupiter: 'Your emotions may be excessive, requiring balance between feeling and wisdom.',
          moon_saturn: 'Emotional restrictions teach you resilience and emotional maturity through challenges.',
          moon_uranus: 'Your emotions conflict with your independence, requiring emotional freedom and stability.',
          moon_neptune: 'Emotional confusion requires clear boundaries and spiritual discernment.',
          moon_pluto: 'Intense emotions challenge your security, requiring emotional transformation and healing.',
          mercury_venus: 'Your thoughts and values may conflict, requiring harmony between mind and heart.',
          mercury_mars: 'Your words and actions may be at odds, requiring thoughtful communication.',
          mercury_jupiter: 'Your thinking may be excessive, requiring balance between detail and big picture.',
          mercury_saturn: 'Communication restrictions teach clarity and structured thinking through challenges.',
          mercury_uranus: 'Your conventional thinking conflicts with innovation, requiring mental flexibility.',
          mercury_neptune: 'Mental confusion requires clear thinking and practical application of intuition.',
          mercury_pluto: 'Mental power struggles require transformative thinking and honest communication.',
          venus_mars: 'Your love nature conflicts with your desires, requiring balance between affection and passion.',
          venus_jupiter: 'Your relationships may be excessive, requiring balance between love and freedom.',
          venus_saturn: 'Love restrictions teach commitment and realistic relationship expectations.',
          venus_uranus: 'Your love needs conflict with independence, requiring balance in relationships.',
          venus_neptune: 'Romantic illusions require realistic love expectations and clear boundaries.',
          venus_pluto: 'Intense relationships challenge your values, requiring transformative love experiences.'
        }
      },
      trine: {
        general: 'flows harmoniously with',
        influence: 'supportive and natural',
        combinations: {
          sun_jupiter: 'You have natural confidence and optimism, with opportunities for growth.',
          moon_venus: 'Your emotions and values align beautifully, creating inner harmony.'
        }
      },
      square: {
        general: 'challenges',
        influence: 'dynamic and motivating',
        combinations: {
          sun_mars: 'You have abundant energy but may struggle with impulsiveness, learning self-control.',
          moon_saturn: 'Emotional restrictions teach you resilience and emotional maturity.'
        }
      },
      sextile: {
        general: 'supports',
        influence: 'opportunistic and helpful',
        combinations: {
          sun_venus: 'You have natural charm and artistic abilities that enhance your personality.',
          mercury_mars: 'Your thoughts and actions work well together, creating effective communication.'
        }
      }
    };
  }

  // Utility methods
  findPlanet(planets, name) {
    return planets.find(planet => planet.name === name);
  }

  getPlanetSign(planets, planetName) {
    const planet = this.findPlanet(planets, planetName);
    return planet ? planet.sign : 'Unknown';
  }

  getAscendantSign(houses) {
    return houses[0] ? houses[0].sign : 'Unknown';
  }

  getZodiacSign(longitude) {
    // Convert longitude degrees to zodiac sign
    const normalizedLon = ((longitude % 360) + 360) % 360;
    const signIndex = Math.floor(normalizedLon / 30);
    const signs = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 
      'Leo', 'Virgo', 'Libra', 'Scorpio', 
      'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    return signs[signIndex] || 'Aries';
  }

  getPlanetKeywords(planetName) {
    const keywords = {
      'Sun': ['identity', 'ego', 'vitality', 'leadership'],
      'Moon': ['emotions', 'intuition', 'nurturing', 'security'],
      'Mercury': ['communication', 'thinking', 'learning', 'adaptability'],
      'Venus': ['love', 'beauty', 'harmony', 'values'],
      'Mars': ['action', 'energy', 'courage', 'desire'],
      'Jupiter': ['expansion', 'wisdom', 'optimism', 'growth'],
      'Saturn': ['discipline', 'responsibility', 'structure', 'lessons'],
      'Uranus': ['innovation', 'rebellion', 'freedom', 'change'],
      'Neptune': ['spirituality', 'dreams', 'intuition', 'compassion'],
      'Pluto': ['transformation', 'power', 'regeneration', 'depth']
    };
    
    return keywords[planetName] || ['unique', 'influential', 'meaningful'];
  }

  identifyKeyThemes(chartData) {
    // Analyze chart for dominant themes
    const themes = [];
    const elements = this.calculateDominantElements(chartData.planets);
    
    if (elements.fire > 3) themes.push('Dynamic and energetic nature');
    if (elements.earth > 3) themes.push('Practical and grounded approach');
    if (elements.air > 3) themes.push('Intellectual and communicative');
    if (elements.water > 3) themes.push('Emotional and intuitive');
    
    return themes.length > 0 ? themes : ['Balanced and versatile nature'];
  }

  calculateDominantElements(planets) {
    const elements = { fire: 0, earth: 0, air: 0, water: 0 };
    const elementMap = {
      'Aries': 'fire', 'Leo': 'fire', 'Sagittarius': 'fire',
      'Taurus': 'earth', 'Virgo': 'earth', 'Capricorn': 'earth',
      'Gemini': 'air', 'Libra': 'air', 'Aquarius': 'air',
      'Cancer': 'water', 'Scorpio': 'water', 'Pisces': 'water'
    };
    
    planets.forEach(planet => {
      const element = elementMap[planet.sign];
      if (element) elements[element]++;
    });
    
    return elements;
  }

  analyzeElements(planets) {
    const elements = this.calculateDominantElements(planets);
    const total = planets.length;
    const percentages = {};
    
    Object.keys(elements).forEach(element => {
      percentages[element] = Math.round((elements[element] / total) * 100);
    });
    
    // Find dominant and lacking elements
    const dominantElement = Object.keys(elements).reduce((a, b) => elements[a] > elements[b] ? a : b);
    const lackingElements = Object.keys(elements).filter(element => elements[element] === 0);
    const weakElements = Object.keys(elements).filter(element => elements[element] === 1);
    
    return {
      counts: elements,
      percentages: percentages,
      dominant: dominantElement,
      lacking: lackingElements,
      weak: weakElements,
      interpretation: this.interpretElementBalance(elements, dominantElement, lackingElements, weakElements)
    };
  }

  analyzeModalities(planets) {
    const modalities = { cardinal: 0, fixed: 0, mutable: 0 };
    const modalityMap = {
      'Aries': 'cardinal', 'Cancer': 'cardinal', 'Libra': 'cardinal', 'Capricorn': 'cardinal',
      'Taurus': 'fixed', 'Leo': 'fixed', 'Scorpio': 'fixed', 'Aquarius': 'fixed',
      'Gemini': 'mutable', 'Virgo': 'mutable', 'Sagittarius': 'mutable', 'Pisces': 'mutable'
    };
    
    planets.forEach(planet => {
      const modality = modalityMap[planet.sign];
      if (modality) modalities[modality]++;
    });
    
    const total = planets.length;
    const percentages = {};
    
    Object.keys(modalities).forEach(modality => {
      percentages[modality] = Math.round((modalities[modality] / total) * 100);
    });
    
    const dominantModality = Object.keys(modalities).reduce((a, b) => modalities[a] > modalities[b] ? a : b);
    const lackingModalities = Object.keys(modalities).filter(modality => modalities[modality] === 0);
    const weakModalities = Object.keys(modalities).filter(modality => modalities[modality] === 1);
    
    return {
      counts: modalities,
      percentages: percentages,
      dominant: dominantModality,
      lacking: lackingModalities,
      weak: weakModalities,
      interpretation: this.interpretModalityBalance(modalities, dominantModality, lackingModalities, weakModalities)
    };
  }

  interpretElementBalance(elements, dominant, lacking, weak) {
    const interpretations = {
      fire: {
        strong: "You have abundant fire energy, making you naturally energetic, enthusiastic, and action-oriented. You're a natural leader who inspires others with your passion and confidence.",
        balanced: "Your fire energy is well-balanced, giving you healthy confidence and the ability to take initiative when needed without being overly aggressive.",
        weak: "You may lack fire energy, making it important to cultivate more confidence, assertiveness, and willingness to take action in your life."
      },
      earth: {
        strong: "You have strong earth energy, making you practical, grounded, and reliable. You excel at building stable foundations and handling material matters with skill.",
        balanced: "Your earth energy is well-balanced, giving you practical wisdom and the ability to manifest your ideas in the physical world.",
        weak: "You may lack earth energy, making it important to develop more practical skills, persistence, and grounding in material reality."
      },
      air: {
        strong: "You have abundant air energy, making you mentally agile, communicative, and intellectually curious. You excel at ideas, communication, and social connections.",
        balanced: "Your air energy is well-balanced, giving you good communication skills and the ability to think objectively when needed.",
        weak: "You may lack air energy, making it important to develop better communication skills, intellectual pursuits, and objective thinking."
      },
      water: {
        strong: "You have strong water energy, making you emotionally sensitive, intuitive, and deeply empathetic. You understand others' feelings and have strong psychic abilities.",
        balanced: "Your water energy is well-balanced, giving you emotional intelligence and intuitive insights without being overwhelmed by feelings.",
        weak: "You may lack water energy, making it important to develop your emotional intelligence, intuition, and compassionate understanding of others."
      }
    };

    let analysis = [];
    
    // Analyze dominant element
    if (elements[dominant] >= 4) {
      analysis.push(interpretations[dominant].strong);
    } else if (elements[dominant] >= 2) {
      analysis.push(interpretations[dominant].balanced);
    }
    
    // Analyze lacking/weak elements
    lacking.forEach(element => {
      analysis.push(interpretations[element].weak);
    });
    
    weak.forEach(element => {
      if (!lacking.includes(element)) {
        analysis.push(interpretations[element].weak);
      }
    });
    
    return analysis.join(' ');
  }

  interpretModalityBalance(modalities, dominant, lacking, weak) {
    const interpretations = {
      cardinal: {
        strong: "You have strong cardinal energy, making you a natural initiator and leader. You're excellent at starting new projects and taking charge of situations.",
        balanced: "Your cardinal energy is well-balanced, giving you good leadership abilities and the initiative to start new ventures when needed.",
        weak: "You may lack cardinal energy, making it important to develop more initiative, leadership skills, and the courage to start new ventures."
      },
      fixed: {
        strong: "You have strong fixed energy, making you persistent, determined, and reliable. You excel at seeing projects through to completion and maintaining stability.",
        balanced: "Your fixed energy is well-balanced, giving you the persistence to complete what you start without being overly stubborn.",
        weak: "You may lack fixed energy, making it important to develop more persistence, determination, and follow-through on your commitments."
      },
      mutable: {
        strong: "You have strong mutable energy, making you adaptable, flexible, and versatile. You're excellent at adjusting to change and seeing multiple perspectives.",
        balanced: "Your mutable energy is well-balanced, giving you flexibility and adaptability without being scattered or inconsistent.",
        weak: "You may lack mutable energy, making it important to develop more flexibility, adaptability, and openness to change and different viewpoints."
      }
    };

    let analysis = [];
    
    // Analyze dominant modality
    if (modalities[dominant] >= 4) {
      analysis.push(interpretations[dominant].strong);
    } else if (modalities[dominant] >= 2) {
      analysis.push(interpretations[dominant].balanced);
    }
    
    // Analyze lacking/weak modalities
    lacking.forEach(modality => {
      analysis.push(interpretations[modality].weak);
    });
    
    weak.forEach(modality => {
      if (!lacking.includes(modality)) {
        analysis.push(interpretations[modality].weak);
      }
    });
    
    return analysis.join(' ');
  }

  generateElementModalityInsights(elementAnalysis, modalityAnalysis) {
    const insights = [];
    
    // Element insights
    insights.push(`**Elemental Nature:** ${elementAnalysis.interpretation}`);
    
    // Modality insights
    insights.push(`**Approach to Life:** ${modalityAnalysis.interpretation}`);
    
    // Combined insights
    const dominant = `${modalityAnalysis.dominant}-${elementAnalysis.dominant}`;
    const combinedInsights = {
      'cardinal-fire': 'You are a dynamic pioneer who leads with passion and initiates bold new ventures.',
      'cardinal-earth': 'You are a practical leader who builds lasting foundations and achieves concrete results.',
      'cardinal-air': 'You are an intellectual leader who initiates new ideas and communicates vision effectively.',
      'cardinal-water': 'You are an emotionally intuitive leader who nurtures others and initiates healing.',
      'fixed-fire': 'You have unwavering determination and the ability to sustain passionate commitment to your goals.',
      'fixed-earth': 'You are incredibly reliable and persistent, building security through steady, methodical effort.',
      'fixed-air': 'You have strong convictions and the ability to maintain intellectual focus and loyal friendships.',
      'fixed-water': 'You have deep emotional strength and the ability to maintain long-lasting, profound relationships.',
      'mutable-fire': 'You are adaptable and enthusiastic, able to adjust your approach while maintaining your passion.',
      'mutable-earth': 'You are practical and flexible, able to adjust your methods while maintaining realistic goals.',
      'mutable-air': 'You are mentally versatile and communicative, able to see all sides and adapt your thinking.',
      'mutable-water': 'You are emotionally adaptable and intuitive, able to flow with life\'s changes compassionately.'
    };
    
    if (combinedInsights[dominant]) {
      insights.push(`**Core Character:** ${combinedInsights[dominant]}`);
    }
    
    return insights;
  }

  identifyChartPattern(planets) {
    const positions = planets.map(p => ({ name: p.name, longitude: p.longitude }));
    const patterns = [];
    
    // Check for Stelliums (3+ planets within 8 degrees)
    const stelliums = this.findStelliums(positions);
    patterns.push(...stelliums);
    
    // Check for T-Squares
    const tSquares = this.findTSquares(positions);
    patterns.push(...tSquares);
    
    // Check for Grand Trines
    const grandTrines = this.findGrandTrines(positions);
    patterns.push(...grandTrines);
    
    // Check for Grand Crosses
    const grandCrosses = this.findGrandCrosses(positions);
    patterns.push(...grandCrosses);
    
    // Check for Yods (Finger of God)
    const yods = this.findYods(positions);
    patterns.push(...yods);
    
    // Overall distribution pattern
    const distributionPattern = this.analyzeDistributionPattern(positions);
    
    if (patterns.length > 0) {
      return `${distributionPattern}. Major patterns: ${patterns.join(', ')}`;
    }
    
    return distributionPattern;
  }

  findStelliums(positions) {
    const stelliums = [];
    const groups = [];
    
    // Group planets within 8 degrees of each other
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const diff = Math.abs(positions[i].longitude - positions[j].longitude);
        const normalizedDiff = diff > 180 ? 360 - diff : diff;
        
        if (normalizedDiff <= 8) {
          // Check if either planet is already in a group
          let foundGroup = null;
          for (const group of groups) {
            if (group.includes(positions[i]) || group.includes(positions[j])) {
              foundGroup = group;
              break;
            }
          }
          
          if (foundGroup) {
            if (!foundGroup.includes(positions[i])) foundGroup.push(positions[i]);
            if (!foundGroup.includes(positions[j])) foundGroup.push(positions[j]);
          } else {
            groups.push([positions[i], positions[j]]);
          }
        }
      }
    }
    
    // Identify stelliums (3+ planets)
    for (const group of groups) {
      if (group.length >= 3) {
        const planetNames = group.map(p => p.name).join(', ');
        const sign = this.getZodiacSign(group[0].longitude);
        stelliums.push(`Stellium in ${sign} (${planetNames})`);
      }
    }
    
    return stelliums;
  }

  findTSquares(positions) {
    const tSquares = [];
    
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        // Check for opposition (180° ± 8°)
        const diff = Math.abs(positions[i].longitude - positions[j].longitude);
        const normalizedDiff = diff > 180 ? 360 - diff : diff;
        
        if (Math.abs(normalizedDiff - 180) <= 8) {
          // Found opposition, now look for the apex (90° to both)
          const midpoint = (positions[i].longitude + positions[j].longitude) / 2;
          const apexPoint1 = (midpoint + 90) % 360;
          const apexPoint2 = (midpoint + 270) % 360;
          
          for (let k = 0; k < positions.length; k++) {
            if (k === i || k === j) continue;
            
            const diffToApex1 = Math.abs(positions[k].longitude - apexPoint1);
            const diffToApex2 = Math.abs(positions[k].longitude - apexPoint2);
            const normalizedDiff1 = diffToApex1 > 180 ? 360 - diffToApex1 : diffToApex1;
            const normalizedDiff2 = diffToApex2 > 180 ? 360 - diffToApex2 : diffToApex2;
            
            if (normalizedDiff1 <= 8 || normalizedDiff2 <= 8) {
              tSquares.push(`T-Square: ${positions[k].name} apex to ${positions[i].name}-${positions[j].name} opposition`);
            }
          }
        }
      }
    }
    
    return tSquares;
  }

  findGrandTrines(positions) {
    const grandTrines = [];
    
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        for (let k = j + 1; k < positions.length; k++) {
          // Check if all three planets form trines (120° ± 6°)
          const diff1 = Math.abs(positions[i].longitude - positions[j].longitude);
          const diff2 = Math.abs(positions[j].longitude - positions[k].longitude);
          const diff3 = Math.abs(positions[k].longitude - positions[i].longitude);
          
          const norm1 = diff1 > 180 ? 360 - diff1 : diff1;
          const norm2 = diff2 > 180 ? 360 - diff2 : diff2;
          const norm3 = diff3 > 180 ? 360 - diff3 : diff3;
          
          if (Math.abs(norm1 - 120) <= 6 && Math.abs(norm2 - 120) <= 6 && Math.abs(norm3 - 120) <= 6) {
            const element = this.getElement(this.getZodiacSign(positions[i].longitude));
            grandTrines.push(`Grand Trine in ${element} (${positions[i].name}, ${positions[j].name}, ${positions[k].name})`);
          }
        }
      }
    }
    
    return grandTrines;
  }

  findGrandCrosses(positions) {
    const grandCrosses = [];
    
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        for (let k = j + 1; k < positions.length; k++) {
          for (let l = k + 1; l < positions.length; l++) {
            // Check if four planets form two oppositions and four squares
            const planets = [positions[i], positions[j], positions[k], positions[l]];
            const longitudes = planets.map(p => p.longitude).sort((a, b) => a - b);
            
            // Check for roughly 90-degree spacing
            const diffs = [];
            for (let m = 0; m < 4; m++) {
              const diff = longitudes[(m + 1) % 4] - longitudes[m];
              diffs.push(diff < 0 ? diff + 360 : diff);
            }
            
            if (diffs.every(diff => Math.abs(diff - 90) <= 8)) {
              const quality = this.getQuality(this.getZodiacSign(longitudes[0]));
              const planetNames = planets.map(p => p.name).join(', ');
              grandCrosses.push(`Grand Cross in ${quality} signs (${planetNames})`);
            }
          }
        }
      }
    }
    
    return grandCrosses;
  }

  findYods(positions) {
    const yods = [];
    
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        // Check for sextile (60° ± 3°)
        const diff = Math.abs(positions[i].longitude - positions[j].longitude);
        const normalizedDiff = diff > 180 ? 360 - diff : diff;
        
        if (Math.abs(normalizedDiff - 60) <= 3) {
          // Found sextile, now look for the apex (150° to both)
          for (let k = 0; k < positions.length; k++) {
            if (k === i || k === j) continue;
            
            const diffToI = Math.abs(positions[k].longitude - positions[i].longitude);
            const diffToJ = Math.abs(positions[k].longitude - positions[j].longitude);
            const normDiffI = diffToI > 180 ? 360 - diffToI : diffToI;
            const normDiffJ = diffToJ > 180 ? 360 - diffToJ : diffToJ;
            
            if (Math.abs(normDiffI - 150) <= 3 && Math.abs(normDiffJ - 150) <= 3) {
              yods.push(`Yod: ${positions[k].name} apex to ${positions[i].name}-${positions[j].name} sextile`);
            }
          }
        }
      }
    }
    
    return yods;
  }

  analyzeDistributionPattern(positions) {
    const longitudes = positions.map(p => p.longitude).sort((a, b) => a - b);
    const spread = longitudes[longitudes.length - 1] - longitudes[0];
    
    if (spread < 120) {
      return 'Bundle Pattern - Concentrated energy and intense focus in one life area';
    } else if (spread > 240) {
      return 'Splash Pattern - Diverse interests and scattered energy across all life areas';
    } else {
      // Check for bowl pattern (all planets in one half)
      const gaps = [];
      for (let i = 0; i < longitudes.length; i++) {
        const nextIndex = (i + 1) % longitudes.length;
        const gap = longitudes[nextIndex] - longitudes[i];
        gaps.push(gap < 0 ? gap + 360 : gap);
      }
      
      const maxGap = Math.max(...gaps);
      if (maxGap > 120) {
        return 'Bowl Pattern - Concentrated activity with a specific area of challenge or growth';
      }
    }
    
    return 'Locomotive Pattern - Dynamic energy with drive toward specific goals';
  }

  getElement(sign) {
    const elementMap = {
      'Aries': 'Fire', 'Leo': 'Fire', 'Sagittarius': 'Fire',
      'Taurus': 'Earth', 'Virgo': 'Earth', 'Capricorn': 'Earth',
      'Gemini': 'Air', 'Libra': 'Air', 'Aquarius': 'Air',
      'Cancer': 'Water', 'Scorpio': 'Water', 'Pisces': 'Water'
    };
    return elementMap[sign] || 'Unknown';
  }

  getQuality(sign) {
    const qualityMap = {
      'Aries': 'Cardinal', 'Cancer': 'Cardinal', 'Libra': 'Cardinal', 'Capricorn': 'Cardinal',
      'Taurus': 'Fixed', 'Leo': 'Fixed', 'Scorpio': 'Fixed', 'Aquarius': 'Fixed',
      'Gemini': 'Mutable', 'Virgo': 'Mutable', 'Sagittarius': 'Mutable', 'Pisces': 'Mutable'
    };
    return qualityMap[sign] || 'Unknown';
  }

  identifyStrengths(chartData) {
    const strengths = [];
    const sun = this.findPlanet(chartData.planets, 'Sun');
    const jupiter = this.findPlanet(chartData.planets, 'Jupiter');
    
    // Add strengths based on planetary positions
    if (sun) strengths.push(`Natural ${sun.sign} leadership qualities`);
    if (jupiter) strengths.push(`Growth opportunities through ${jupiter.sign} energy`);
    
    return strengths;
  }

  identifyChallenges(chartData) {
    const challenges = [];
    const saturn = this.findPlanet(chartData.planets, 'Saturn');
    
    // Add challenges based on difficult aspects
    chartData.aspects.forEach(aspect => {
      if (aspect.aspect === 'Square' || aspect.aspect === 'Opposition') {
        challenges.push(`Learning to balance ${aspect.planet1} and ${aspect.planet2} energies`);
      }
    });
    
    return challenges.length > 0 ? challenges : ['Developing patience and self-awareness'];
  }

  // Additional helper methods would be implemented here...
  analyzeRelationshipAspects(aspects) {
    return aspects
      .filter(aspect => aspect.planet1 === 'Venus' || aspect.planet2 === 'Venus' || 
                      aspect.planet1 === 'Mars' || aspect.planet2 === 'Mars')
      .map(aspect => this.interpretAspect(aspect));
  }

  generateCompatibilityGuidance(venus, mars) {
    return `Your Venus in ${venus.sign} seeks ${venus.sign.toLowerCase()} qualities in love, while your Mars in ${mars.sign} is attracted to ${mars.sign.toLowerCase()} energy. This combination creates a unique approach to relationships.`;
  }

  identifyTalents(chartData) {
    const talents = [];
    const trines = chartData.aspects.filter(aspect => aspect.aspect === 'Trine');
    
    trines.forEach(trine => {
      talents.push(`Natural ability combining ${trine.planet1} and ${trine.planet2} energies`);
    });
    
    return talents.length > 0 ? talents : ['Developing unique personal talents'];
  }

  identifyCareerChallenges(chartData) {
    const challenges = [];
    const saturn = this.findPlanet(chartData.planets, 'Saturn');
    
    if (saturn) {
      challenges.push(`Learning discipline and responsibility in ${saturn.sign} areas`);
    }
    
    return challenges;
  }

  generateLifePhilosophy(chartData) {
    const jupiter = this.findPlanet(chartData.planets, 'Jupiter');
    const sagittarius = chartData.planets.filter(p => p.sign === 'Sagittarius');
    
    if (jupiter) {
      return `Your life philosophy is shaped by ${jupiter.sign} values, emphasizing growth through ${jupiter.sign.toLowerCase()} experiences.`;
    }
    
    return 'Your life philosophy develops through personal experience and wisdom.';
  }

  identifySpiritualGifts(chartData) {
    const gifts = [];
    const neptune = this.findPlanet(chartData.planets, 'Neptune');
    const pisces = chartData.planets.filter(p => p.sign === 'Pisces');
    
    if (neptune) gifts.push(`Intuitive abilities through ${neptune.sign} energy`);
    if (pisces.length > 0) gifts.push('Natural empathy and spiritual sensitivity');
    
    return gifts.length > 0 ? gifts : ['Developing spiritual awareness and intuition'];
  }

  interpretPlanetInHouse(planet) {
    const houseData = this.interpretations.houses[planet.house];
    if (houseData && houseData.planetInterpretations) {
      const planetKey = planet.name.toLowerCase();
      return houseData.planetInterpretations[planetKey] || 
        `${planet.name} in the ${houseData.theme} house brings unique energy to this life area.`;
    }
    return `${planet.name} in House ${planet.house} influences your life in distinctive ways.`;
  }

  generateCombinedPlanetInterpretation(planet) {
    const signInterpretation = this.interpretPlanetInSign(planet, 'general');
    const houseInterpretation = this.interpretPlanetInHouse(planet);
    
    return `Your ${planet.name} in ${planet.sign} (${planet.house}th house) combines ${planet.sign} energy with ${this.getHouseTheme(planet.house)} themes. ${signInterpretation} ${houseInterpretation}`;
  }

  generatePracticalAdvice(planet) {
    const adviceMap = {
      'Sun': `To express your authentic self, focus on ${planet.sign} qualities in ${this.getHouseTheme(planet.house)} areas of life. Shine by embracing your natural ${planet.sign} leadership style.`,
      'Moon': `For emotional fulfillment, nurture your ${planet.sign} needs through ${this.getHouseTheme(planet.house)} activities. Trust your ${planet.sign} instincts.`,
      'Mercury': `Enhance your communication by expressing ${planet.sign} thinking patterns in ${this.getHouseTheme(planet.house)} contexts. Learn through ${planet.sign} approaches.`,
      'Venus': `Attract love and beauty by embodying ${planet.sign} values in ${this.getHouseTheme(planet.house)} situations. Create harmony through ${planet.sign} appreciation.`,
      'Mars': `Channel your energy effectively by taking ${planet.sign} action in ${this.getHouseTheme(planet.house)} areas. Assert yourself through ${planet.sign} courage.`,
      'Jupiter': `Expand your opportunities by embracing ${planet.sign} growth in ${this.getHouseTheme(planet.house)} endeavors. Seek wisdom through ${planet.sign} exploration.`,
      'Saturn': `Build lasting success by applying ${planet.sign} discipline in ${this.getHouseTheme(planet.house)} responsibilities. Master life through ${planet.sign} patience.`,
      'Uranus': `Innovate by expressing ${planet.sign} originality in ${this.getHouseTheme(planet.house)} areas. Break free through ${planet.sign} revolution.`,
      'Neptune': `Connect with your higher self by channeling ${planet.sign} spirituality through ${this.getHouseTheme(planet.house)} service. Transcend through ${planet.sign} compassion.`,
      'Pluto': `Transform your life by embracing ${planet.sign} power in ${this.getHouseTheme(planet.house)} areas. Regenerate through ${planet.sign} depth.`
    };
    
    return adviceMap[planet.name] || `Work with your ${planet.name} energy by integrating ${planet.sign} qualities into ${this.getHouseTheme(planet.house)} activities.`;
  }

  getHouseTheme(houseNumber) {
    const themes = {
      1: 'identity and self-expression',
      2: 'values and resources',
      3: 'communication and learning',
      4: 'home and family',
      5: 'creativity and romance',
      6: 'work and health',
      7: 'partnerships and relationships',
      8: 'transformation and shared resources',
      9: 'philosophy and higher learning',
      10: 'career and reputation',
      11: 'friendships and groups',
      12: 'spirituality and subconscious'
    };
    return themes[houseNumber] || 'life experiences';
  }

  interpretHouseCusp(house) {
    const houseInfo = this.interpretations.houses[house.house];
    return `${houseInfo.theme}: ${house.sign} energy influences your ${houseInfo.description.toLowerCase()}.`;
  }

  getAspectInfluence(aspectName) {
    const influences = {
      'Conjunction': 'intense and focused',
      'Opposition': 'challenging but balancing',
      'Trine': 'harmonious and supportive',
      'Square': 'dynamic and motivating',
      'Sextile': 'opportunistic and helpful'
    };
    
    return influences[aspectName] || 'significant';
  }

  getAspectAdvice(aspect) {
    const advice = {
      'Conjunction': 'Embrace the blended energy and use it purposefully.',
      'Opposition': 'Find balance between these opposing forces.',
      'Trine': 'Develop and use this natural talent.',
      'Square': 'Channel this tension into productive action.',
      'Sextile': 'Take advantage of the opportunities this creates.'
    };
    
    return advice[aspect.aspect] || 'Work with this planetary relationship consciously.';
  }
}

// Export for use in birth chart calculator
window.ChartInterpretationEngine = ChartInterpretationEngine;