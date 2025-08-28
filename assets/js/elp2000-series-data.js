/**
 * ELP2000 Series Data
 * Contains the main periodic terms from ELP2000-82B lunar theory
 * Provides coefficients for high-precision lunar longitude calculations
 */

class ELP2000SeriesData {
  constructor() {
    this.mainTerms = this.initializeMainTerms();
    console.log(`ELP2000SeriesData initialized with ${this.mainTerms.length} terms`);
  }

  /**
   * Initialize the main ELP2000 periodic terms
   * Each term is [coefficient_arcsec, D, M, Mp, F]
   * Where D, M, Mp, F are multipliers for fundamental arguments
   * @returns {Array} Array of periodic terms
   */
  initializeMainTerms() {
    // Main ELP2000 periodic terms for lunar longitude
    // Format: [coefficient in arcseconds * 1e6, D, M, Mp, F]
    // These are the most significant terms from the full ELP2000 series
    return [
      // Main term - largest periodic correction
      [6288774, 0, 0, 1, 0],    // 6.288774" * sin(Mp)
      
      // Second largest terms
      [1274027, 2, 0, -1, 0],   // 1.274027" * sin(2D - Mp)
      [658314, 2, 0, 0, 0],     // 0.658314" * sin(2D)
      [213618, 0, 0, 2, 0],     // 0.213618" * sin(2Mp)
      [-185116, 0, 1, 0, 0],    // -0.185116" * sin(M)
      [-114332, 0, 0, 0, 2],    // -0.114332" * sin(2F)
      
      // Third tier terms
      [58793, 2, 0, -2, 0],     // 0.058793" * sin(2D - 2Mp)
      [57066, 2, -1, -1, 0],    // 0.057066" * sin(2D - M - Mp)
      [53322, 2, 0, 1, 0],      // 0.053322" * sin(2D + Mp)
      [45758, 2, -1, 0, 0],     // 0.045758" * sin(2D - M)
      [-40923, 0, 1, -1, 0],    // -0.040923" * sin(M - Mp)
      [-34720, 0, 1, 1, 0],     // -0.034720" * sin(M + Mp)
      
      // Fourth tier terms
      [-30383, 2, 0, 0, -2],    // -0.030383" * sin(2D - 2F)
      [15327, 4, 0, -1, 0],     // 0.015327" * sin(4D - Mp)
      [-12528, 0, 0, 1, 2],     // -0.012528" * sin(Mp + 2F)
      [10980, 0, 0, 1, -2],     // 0.010980" * sin(Mp - 2F)
      [10675, 4, 0, -2, 0],     // 0.010675" * sin(4D - 2Mp)
      [10034, 2, 0, 2, 0],      // 0.010034" * sin(2D + 2Mp)
      [8548, 2, -1, 1, 0],      // 0.008548" * sin(2D - M + Mp)
      [-7888, 2, 1, -1, 0],     // -0.007888" * sin(2D + M - Mp)
      
      // Fifth tier terms
      [-6766, 2, 1, 0, 0],      // -0.006766" * sin(2D + M)
      [-5163, 1, 0, 1, 0],      // -0.005163" * sin(D + Mp)
      [4987, 1, 1, 0, 0],       // 0.004987" * sin(D + M)
      [4036, 2, -1, 0, -2],     // 0.004036" * sin(2D - M - 2F)
      [3994, 2, 0, 0, 2],       // 0.003994" * sin(2D + 2F)
      [3861, 4, 0, 0, 0],       // 0.003861" * sin(4D)
      [3665, 2, 0, -3, 0],      // 0.003665" * sin(2D - 3Mp)
      [-2689, 0, 1, -2, 0],     // -0.002689" * sin(M - 2Mp)
      [-2602, 2, 0, -1, 2],     // -0.002602" * sin(2D - Mp + 2F)
      
      // Sixth tier terms
      [2390, 2, -1, -2, 0],     // 0.002390" * sin(2D - M - 2Mp)
      [-2348, 1, 0, 0, 0],      // -0.002348" * sin(D)
      [2236, 2, -2, 0, 0],      // 0.002236" * sin(2D - 2M)
      [-2120, 1, 0, 1, -2],     // -0.002120" * sin(D + Mp - 2F)
      [-2078, 0, 2, 0, 0],      // -0.002078" * sin(2M)
      [2043, 2, 0, -1, -2],     // 0.002043" * sin(2D - Mp - 2F)
      [1695, 2, 0, 3, 0],       // 0.001695" * sin(2D + 3Mp)
      [1647, 4, -1, -1, 0],     // 0.001647" * sin(4D - M - Mp)
      [1529, 4, 0, 1, 0],       // 0.001529" * sin(4D + Mp)
      [-1487, 0, 0, 2, 2],      // -0.001487" * sin(2Mp + 2F)
      
      // Seventh tier terms
      [-1481, 2, 1, 1, 0],      // -0.001481" * sin(2D + M + Mp)
      [1417, 0, 0, 2, -2],      // 0.001417" * sin(2Mp - 2F)
      [-1350, 1, 1, 1, 0],      // -0.001350" * sin(D + M + Mp)
      [1330, 2, -1, 0, 2],      // 0.001330" * sin(2D - M + 2F)
      [1106, 2, 0, 1, -2],      // 0.001106" * sin(2D + Mp - 2F)
      [1020, 4, 0, 0, -2],      // 0.001020" * sin(4D - 2F)
      [833, 4, -1, 0, 0],       // 0.000833" * sin(4D - M)
      [777, 0, 1, 2, 0],        // 0.000777" * sin(M + 2Mp)
      [671, 2, 1, -2, 0],       // 0.000671" * sin(2D + M - 2Mp)
      [-644, 2, 2, -1, 0],      // -0.000644" * sin(2D + 2M - Mp)
      
      // Eighth tier terms
      [-618, 2, 0, 0, -4],      // -0.000618" * sin(2D - 4F)
      [595, 6, 0, -1, 0],       // 0.000595" * sin(6D - Mp)
      [560, 2, -2, -1, 0],      // 0.000560" * sin(2D - 2M - Mp)
      [-549, 0, 1, 0, 2],       // -0.000549" * sin(M + 2F)
      [492, 2, -1, 1, -2],      // 0.000492" * sin(2D - M + Mp - 2F)
      [486, 1, 0, -1, 0],       // 0.000486" * sin(D - Mp)
      [446, 0, 1, 0, -2],       // 0.000446" * sin(M - 2F)
      [-427, 2, 2, 0, 0],       // -0.000427" * sin(2D + 2M)
      [398, 3, 0, -1, 0],       // 0.000398" * sin(3D - Mp)
      [-390, 2, -3, 0, 0]       // -0.000390" * sin(2D - 3M)
    ];
  }

  /**
   * Get the main ELP2000 periodic terms
   * @returns {Array} Array of periodic terms [coeff, D, M, Mp, F]
   */
  getMainTerms() {
    return this.mainTerms;
  }

  /**
   * Get the number of terms in the series
   * @returns {number} Number of periodic terms
   */
  getTermCount() {
    return this.mainTerms.length;
  }

  /**
   * Get terms filtered by significance
   * @param {number} minCoefficient - Minimum coefficient in arcseconds * 1e6
   * @returns {Array} Filtered terms above the threshold
   */
  getSignificantTerms(minCoefficient = 1000) {
    return this.mainTerms.filter(term => Math.abs(term[0]) >= minCoefficient);
  }

  /**
   * Get terms by argument type
   * @param {string} type - Type of terms ('main', 'solar', 'evection', 'variation')
   * @returns {Array} Terms of the specified type
   */
  getTermsByType(type) {
    switch (type) {
      case 'main':
        // Main lunar terms (Mp dominant)
        return this.mainTerms.filter(term => 
          Math.abs(term[2]) === 0 && Math.abs(term[3]) > 0 && Math.abs(term[4]) === 0
        );
      
      case 'solar':
        // Solar perturbation terms (M dominant)
        return this.mainTerms.filter(term => 
          Math.abs(term[2]) > 0 && Math.abs(term[3]) <= 1
        );
      
      case 'evection':
        // Evection terms (2D - Mp)
        return this.mainTerms.filter(term => 
          term[1] === 2 && term[2] === 0 && term[3] === -1 && term[4] === 0
        );
      
      case 'variation':
        // Variation terms (2D)
        return this.mainTerms.filter(term => 
          term[1] === 2 && term[2] === 0 && term[3] === 0 && term[4] === 0
        );
      
      default:
        return this.mainTerms;
    }
  }

  /**
   * Get information about the series data
   * @returns {Object} Information about the ELP2000 series
   */
  getSeriesInfo() {
    const totalTerms = this.mainTerms.length;
    const maxCoeff = Math.max(...this.mainTerms.map(term => Math.abs(term[0])));
    const minCoeff = Math.min(...this.mainTerms.map(term => Math.abs(term[0])));
    
    return {
      name: 'ELP2000-82B Main Series',
      totalTerms: totalTerms,
      maxCoefficient: maxCoeff / 1e6, // Convert to arcseconds
      minCoefficient: minCoeff / 1e6, // Convert to arcseconds
      coverage: 'Main periodic terms for lunar longitude',
      accuracy: '±2 arc minutes',
      description: 'Truncated ELP2000 series with most significant terms for professional astrological accuracy'
    };
  }

  /**
   * Validate the series data integrity
   * @returns {Object} Validation results
   */
  validateSeries() {
    const issues = [];
    const warnings = [];
    
    // Check for required main term
    const mainTerm = this.mainTerms.find(term => 
      term[1] === 0 && term[2] === 0 && term[3] === 1 && term[4] === 0
    );
    
    if (!mainTerm) {
      issues.push('Missing main lunar term (0,0,1,0)');
    } else if (Math.abs(mainTerm[0] - 6288774) > 1000) {
      warnings.push('Main term coefficient differs from expected value');
    }
    
    // Check for evection term
    const evectionTerm = this.mainTerms.find(term => 
      term[1] === 2 && term[2] === 0 && term[3] === -1 && term[4] === 0
    );
    
    if (!evectionTerm) {
      warnings.push('Missing evection term (2,0,-1,0)');
    }
    
    // Check coefficient ranges
    const coefficients = this.mainTerms.map(term => Math.abs(term[0]));
    const maxCoeff = Math.max(...coefficients);
    const minCoeff = Math.min(...coefficients);
    
    if (maxCoeff < 6000000) {
      issues.push('Maximum coefficient too small - may be missing main terms');
    }
    
    if (minCoeff > 1000000) {
      warnings.push('Minimum coefficient large - may be missing small but important terms');
    }
    
    return {
      valid: issues.length === 0,
      issues: issues,
      warnings: warnings,
      termCount: this.mainTerms.length,
      coefficientRange: [minCoeff / 1e6, maxCoeff / 1e6]
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ELP2000SeriesData;
}