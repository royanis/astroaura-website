/**
 * Performance Monitoring and Progress Feedback System
 * Provides real-time feedback during intensive astronomical calculations
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      calculations: [],
      memoryUsage: [],
      cachePerformance: [],
      errorRates: [],
      userInteractions: []
    };
    
    this.thresholds = {
      slowCalculation: 1000, // ms
      highMemoryUsage: 100 * 1024 * 1024, // 100MB
      lowCacheHitRate: 50, // %
      highErrorRate: 5 // %
    };
    
    this.progressCallbacks = new Set();
    this.performanceCallbacks = new Set();
    this.alertCallbacks = new Set();
    
    this.isMonitoring = false;
    this.monitoringInterval = null;
    this.samplingRate = 1000; // ms
    
    this.startTime = null;
    this.currentOperation = null;
    this.operationStack = [];
  }

  /**
   * Start monitoring system
   */
  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, this.samplingRate);
    
    // Monitor memory usage if available
    if (performance.memory) {
      this.memoryMonitoringEnabled = true;
    }
    
    console.log('Performance monitoring started');
  }

  /**
   * Stop monitoring system
   */
  stopMonitoring() {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    console.log('Performance monitoring stopped');
  }

  /**
   * Start tracking an operation
   */
  startOperation(operationName, details = {}) {
    const operation = {
      name: operationName,
      startTime: performance.now(),
      details,
      id: this.generateOperationId(),
      parentId: this.currentOperation ? this.currentOperation.id : null
    };
    
    this.operationStack.push(operation);
    this.currentOperation = operation;
    
    // Notify progress callbacks
    this.notifyProgress({
      type: 'operation_start',
      operation: operationName,
      operationId: operation.id,
      details,
      timestamp: Date.now()
    });
    
    return operation.id;
  }

  /**
   * Update operation progress
   */
  updateProgress(operationId, progress) {
    const operation = this.findOperation(operationId);
    if (!operation) return;
    
    const progressData = {
      type: 'progress_update',
      operation: operation.name,
      operationId,
      progress: {
        current: progress.current || 0,
        total: progress.total || 100,
        percentage: progress.percentage || ((progress.current || 0) / (progress.total || 100)) * 100,
        stage: progress.stage || 'processing',
        message: progress.message || '',
        eta: this.calculateETA(operation, progress)
      },
      timestamp: Date.now()
    };
    
    // Notify progress callbacks
    this.notifyProgress(progressData);
  }

  /**
   * Complete an operation
   */
  completeOperation(operationId, result = {}) {
    const operationIndex = this.operationStack.findIndex(op => op.id === operationId);
    if (operationIndex === -1) return;
    
    const operation = this.operationStack[operationIndex];
    const duration = performance.now() - operation.startTime;
    
    // Record metrics
    this.recordCalculationMetric({
      operation: operation.name,
      duration,
      success: result.success !== false,
      details: operation.details,
      result
    });
    
    // Remove from stack
    this.operationStack.splice(operationIndex, 1);
    
    // Update current operation
    this.currentOperation = this.operationStack.length > 0 
      ? this.operationStack[this.operationStack.length - 1] 
      : null;
    
    // Notify completion
    this.notifyProgress({
      type: 'operation_complete',
      operation: operation.name,
      operationId,
      duration,
      result,
      timestamp: Date.now()
    });
    
    // Check for performance issues
    this.checkPerformanceThresholds(operation.name, duration);
  }

  /**
   * Record calculation metrics
   */
  recordCalculationMetric(metric) {
    this.metrics.calculations.push({
      ...metric,
      timestamp: Date.now()
    });
    
    // Limit metrics array size
    if (this.metrics.calculations.length > 1000) {
      this.metrics.calculations = this.metrics.calculations.slice(-500);
    }
  }

  /**
   * Record cache performance
   */
  recordCacheMetric(hits, misses, size) {
    const hitRate = hits + misses > 0 ? (hits / (hits + misses)) * 100 : 0;
    
    this.metrics.cachePerformance.push({
      hits,
      misses,
      hitRate,
      size,
      timestamp: Date.now()
    });
    
    // Check cache performance
    if (hitRate < this.thresholds.lowCacheHitRate) {
      this.notifyAlert({
        type: 'performance_warning',
        category: 'cache',
        message: `Low cache hit rate: ${hitRate.toFixed(1)}%`,
        recommendation: 'Consider increasing cache size or expiry time'
      });
    }
  }

  /**
   * Record error metrics
   */
  recordErrorMetric(errorType, severity, context = {}) {
    this.metrics.errorRates.push({
      errorType,
      severity,
      context,
      timestamp: Date.now()
    });
    
    // Calculate recent error rate
    const recentErrors = this.getRecentErrors(5 * 60 * 1000); // Last 5 minutes
    const recentCalculations = this.getRecentCalculations(5 * 60 * 1000);
    
    if (recentCalculations.length > 0) {
      const errorRate = (recentErrors.length / recentCalculations.length) * 100;
      
      if (errorRate > this.thresholds.highErrorRate) {
        this.notifyAlert({
          type: 'error_rate_warning',
          category: 'errors',
          message: `High error rate: ${errorRate.toFixed(1)}%`,
          recommendation: 'Consider reducing calculation precision or checking input data'
        });
      }
    }
  }

  /**
   * Collect system metrics
   */
  collectMetrics() {
    // Memory usage
    if (performance.memory) {
      const memoryInfo = {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
        timestamp: Date.now()
      };
      
      this.metrics.memoryUsage.push(memoryInfo);
      
      // Check memory thresholds
      if (memoryInfo.used > this.thresholds.highMemoryUsage) {
        this.notifyAlert({
          type: 'memory_warning',
          category: 'memory',
          message: `High memory usage: ${(memoryInfo.used / 1024 / 1024).toFixed(1)}MB`,
          recommendation: 'Consider clearing caches or reducing precision'
        });
      }
    }
    
    // Notify performance callbacks with current metrics
    this.notifyPerformance(this.getCurrentMetrics());
  }

  /**
   * Calculate ETA for operation
   */
  calculateETA(operation, progress) {
    if (!progress.current || !progress.total || progress.current === 0) {
      return null;
    }
    
    const elapsed = performance.now() - operation.startTime;
    const rate = progress.current / elapsed;
    const remaining = progress.total - progress.current;
    
    return remaining / rate;
  }

  /**
   * Generate unique operation ID
   */
  generateOperationId() {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Find operation by ID
   */
  findOperation(operationId) {
    return this.operationStack.find(op => op.id === operationId);
  }

  /**
   * Check performance thresholds
   */
  checkPerformanceThresholds(operationName, duration) {
    if (duration > this.thresholds.slowCalculation) {
      this.notifyAlert({
        type: 'performance_warning',
        category: 'calculation_speed',
        message: `Slow calculation detected: ${operationName} took ${duration.toFixed(0)}ms`,
        recommendation: 'Consider reducing precision or optimizing calculation'
      });
    }
  }

  /**
   * Get recent errors
   */
  getRecentErrors(timeWindow) {
    const cutoff = Date.now() - timeWindow;
    return this.metrics.errorRates.filter(error => error.timestamp > cutoff);
  }

  /**
   * Get recent calculations
   */
  getRecentCalculations(timeWindow) {
    const cutoff = Date.now() - timeWindow;
    return this.metrics.calculations.filter(calc => calc.timestamp > cutoff);
  }

  /**
   * Get current metrics summary
   */
  getCurrentMetrics() {
    const recentCalculations = this.getRecentCalculations(60 * 1000); // Last minute
    const recentErrors = this.getRecentErrors(60 * 1000);
    
    const avgDuration = recentCalculations.length > 0
      ? recentCalculations.reduce((sum, calc) => sum + calc.duration, 0) / recentCalculations.length
      : 0;
    
    const errorRate = recentCalculations.length > 0
      ? (recentErrors.length / recentCalculations.length) * 100
      : 0;
    
    const latestCache = this.metrics.cachePerformance.length > 0
      ? this.metrics.cachePerformance[this.metrics.cachePerformance.length - 1]
      : null;
    
    const latestMemory = this.metrics.memoryUsage.length > 0
      ? this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1]
      : null;
    
    return {
      calculations: {
        recent: recentCalculations.length,
        averageDuration: avgDuration,
        successRate: recentCalculations.length > 0
          ? (recentCalculations.filter(c => c.success).length / recentCalculations.length) * 100
          : 100
      },
      errors: {
        recent: recentErrors.length,
        rate: errorRate
      },
      cache: latestCache ? {
        hitRate: latestCache.hitRate,
        size: latestCache.size
      } : null,
      memory: latestMemory ? {
        used: latestMemory.used,
        usedMB: latestMemory.used / 1024 / 1024,
        percentage: (latestMemory.used / latestMemory.limit) * 100
      } : null,
      activeOperations: this.operationStack.length,
      timestamp: Date.now()
    };
  }

  /**
   * Callback management
   */
  onProgress(callback) {
    this.progressCallbacks.add(callback);
    return () => this.progressCallbacks.delete(callback);
  }

  onPerformance(callback) {
    this.performanceCallbacks.add(callback);
    return () => this.performanceCallbacks.delete(callback);
  }

  onAlert(callback) {
    this.alertCallbacks.add(callback);
    return () => this.alertCallbacks.delete(callback);
  }

  /**
   * Notify callbacks
   */
  notifyProgress(data) {
    this.progressCallbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Progress callback error:', error);
      }
    });
  }

  notifyPerformance(data) {
    this.performanceCallbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Performance callback error:', error);
      }
    });
  }

  notifyAlert(data) {
    this.alertCallbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Alert callback error:', error);
      }
    });
  }

  /**
   * Get performance report
   */
  getPerformanceReport(timeWindow = 60 * 60 * 1000) { // Default: last hour
    const cutoff = Date.now() - timeWindow;
    
    const calculations = this.metrics.calculations.filter(c => c.timestamp > cutoff);
    const errors = this.metrics.errorRates.filter(e => e.timestamp > cutoff);
    const cacheMetrics = this.metrics.cachePerformance.filter(c => c.timestamp > cutoff);
    const memoryMetrics = this.metrics.memoryUsage.filter(m => m.timestamp > cutoff);
    
    return {
      timeWindow,
      summary: {
        totalCalculations: calculations.length,
        successfulCalculations: calculations.filter(c => c.success).length,
        totalErrors: errors.length,
        averageCalculationTime: calculations.length > 0
          ? calculations.reduce((sum, c) => sum + c.duration, 0) / calculations.length
          : 0,
        errorRate: calculations.length > 0
          ? (errors.length / calculations.length) * 100
          : 0
      },
      calculations: {
        byOperation: this.groupBy(calculations, 'operation'),
        slowest: calculations.sort((a, b) => b.duration - a.duration).slice(0, 10),
        fastest: calculations.sort((a, b) => a.duration - b.duration).slice(0, 10)
      },
      errors: {
        byType: this.groupBy(errors, 'errorType'),
        bySeverity: this.groupBy(errors, 'severity')
      },
      cache: {
        averageHitRate: cacheMetrics.length > 0
          ? cacheMetrics.reduce((sum, c) => sum + c.hitRate, 0) / cacheMetrics.length
          : 0,
        peakSize: cacheMetrics.length > 0
          ? Math.max(...cacheMetrics.map(c => c.size))
          : 0
      },
      memory: {
        peak: memoryMetrics.length > 0
          ? Math.max(...memoryMetrics.map(m => m.used))
          : 0,
        average: memoryMetrics.length > 0
          ? memoryMetrics.reduce((sum, m) => sum + m.used, 0) / memoryMetrics.length
          : 0
      }
    };
  }

  /**
   * Utility function to group array by property
   */
  groupBy(array, property) {
    return array.reduce((groups, item) => {
      const key = item[property];
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {});
  }

  /**
   * Clear metrics data
   */
  clearMetrics() {
    this.metrics = {
      calculations: [],
      memoryUsage: [],
      cachePerformance: [],
      errorRates: [],
      userInteractions: []
    };
  }

  /**
   * Export metrics data
   */
  exportMetrics() {
    return {
      metrics: this.metrics,
      thresholds: this.thresholds,
      currentOperations: this.operationStack,
      timestamp: Date.now()
    };
  }
}

/**
 * Progress UI Component for displaying calculation progress
 */
class ProgressUI {
  constructor(container) {
    this.container = typeof container === 'string' 
      ? document.getElementById(container) 
      : container;
    
    this.progressBars = new Map();
    this.isVisible = false;
    
    this.createUI();
  }

  /**
   * Create progress UI elements
   */
  createUI() {
    if (!this.container) return;
    
    this.progressContainer = document.createElement('div');
    this.progressContainer.className = 'calculation-progress-container';
    this.progressContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 15px;
      border-radius: 8px;
      min-width: 300px;
      max-width: 400px;
      z-index: 10000;
      font-family: monospace;
      font-size: 12px;
      display: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;
    
    this.container.appendChild(this.progressContainer);
  }

  /**
   * Show progress for operation
   */
  showProgress(operationId, operationName, progress = {}) {
    if (!this.progressContainer) return;
    
    if (!this.progressBars.has(operationId)) {
      this.createProgressBar(operationId, operationName);
    }
    
    this.updateProgressBar(operationId, progress);
    this.show();
  }

  /**
   * Create progress bar for operation
   */
  createProgressBar(operationId, operationName) {
    const progressElement = document.createElement('div');
    progressElement.className = 'progress-item';
    progressElement.style.cssText = `
      margin-bottom: 10px;
      padding-bottom: 10px;
      border-bottom: 1px solid #333;
    `;
    
    progressElement.innerHTML = `
      <div class="progress-label" style="margin-bottom: 5px; font-weight: bold;">
        ${operationName}
      </div>
      <div class="progress-bar-container" style="background: #333; height: 6px; border-radius: 3px; overflow: hidden;">
        <div class="progress-bar" style="background: #4CAF50; height: 100%; width: 0%; transition: width 0.3s ease;"></div>
      </div>
      <div class="progress-details" style="margin-top: 5px; font-size: 10px; color: #ccc;">
        <span class="progress-text">Starting...</span>
        <span class="progress-eta" style="float: right;"></span>
      </div>
    `;
    
    this.progressBars.set(operationId, {
      element: progressElement,
      bar: progressElement.querySelector('.progress-bar'),
      text: progressElement.querySelector('.progress-text'),
      eta: progressElement.querySelector('.progress-eta')
    });
    
    this.progressContainer.appendChild(progressElement);
  }

  /**
   * Update progress bar
   */
  updateProgressBar(operationId, progress) {
    const progressBar = this.progressBars.get(operationId);
    if (!progressBar) return;
    
    const percentage = progress.percentage || 0;
    const message = progress.message || progress.stage || 'Processing...';
    const eta = progress.eta ? `ETA: ${this.formatDuration(progress.eta)}` : '';
    
    progressBar.bar.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
    progressBar.text.textContent = `${message} (${percentage.toFixed(1)}%)`;
    progressBar.eta.textContent = eta;
  }

  /**
   * Complete operation progress
   */
  completeProgress(operationId, duration) {
    const progressBar = this.progressBars.get(operationId);
    if (!progressBar) return;
    
    progressBar.bar.style.width = '100%';
    progressBar.bar.style.background = '#2196F3';
    progressBar.text.textContent = `Completed in ${this.formatDuration(duration)}`;
    progressBar.eta.textContent = '';
    
    // Remove after delay
    setTimeout(() => {
      this.removeProgress(operationId);
    }, 2000);
  }

  /**
   * Remove progress bar
   */
  removeProgress(operationId) {
    const progressBar = this.progressBars.get(operationId);
    if (!progressBar) return;
    
    progressBar.element.remove();
    this.progressBars.delete(operationId);
    
    // Hide container if no more progress bars
    if (this.progressBars.size === 0) {
      this.hide();
    }
  }

  /**
   * Show progress container
   */
  show() {
    if (this.progressContainer && !this.isVisible) {
      this.progressContainer.style.display = 'block';
      this.isVisible = true;
    }
  }

  /**
   * Hide progress container
   */
  hide() {
    if (this.progressContainer && this.isVisible) {
      this.progressContainer.style.display = 'none';
      this.isVisible = false;
    }
  }

  /**
   * Format duration in milliseconds to human readable
   */
  formatDuration(ms) {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  }
}

// Export for use
window.PerformanceMonitor = PerformanceMonitor;
window.ProgressUI = ProgressUI;