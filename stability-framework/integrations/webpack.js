/**
 * Webpack Integration - Integrates stability framework with Webpack build process
 * Provides build-time analysis and optimization
 */

export class WebpackIntegration {
  constructor(config = {}) {
    this.config = {
      enableBuildAnalysis: true,
      enableBundleOptimization: true,
      detectDuplicates: true,
      generateReport: true,
      ...config
    };
    
    this.pluginName = 'StabilityFrameworkWebpackPlugin';
    this.framework = null;
    this.buildStats = {
      duplicates: [],
      chunks: [],
      modules: [],
      assets: []
    };
  }

  /**
   * Create Webpack plugin
   */
  createPlugin(framework) {
    this.framework = framework;
    
    return {
      apply: (compiler) => {
        this.applyPlugin(compiler);
      }
    };
  }

  /**
   * Apply plugin to Webpack compiler
   */
  applyPlugin(compiler) {
    // Hook into compilation process
    compiler.hooks.compilation.tap(this.pluginName, (compilation) => {
      this.handleCompilation(compilation);
    });

    // Hook into build completion
    compiler.hooks.done.tap(this.pluginName, (stats) => {
      this.handleBuildComplete(stats);
    });

    // Hook into asset emission
    compiler.hooks.emit.tapAsync(this.pluginName, (compilation, callback) => {
      this.handleAssetEmission(compilation, callback);
    });

    console.log('🔌 Webpack integration plugin applied');
  }

  /**
   * Handle compilation phase
   */
  handleCompilation(compilation) {
    if (this.config.detectDuplicates) {
      // Hook into module optimization
      compilation.hooks.optimizeModules.tap(this.pluginName, (modules) => {
        this.analyzeDuplicateModules(modules);
      });
    }

    // Hook into chunk optimization
    compilation.hooks.optimizeChunks.tap(this.pluginName, (chunks) => {
      this.analyzeChunks(chunks);
    });
  }

  /**
   * Analyze duplicate modules
   */
  analyzeDuplicateModules(modules) {
    const moduleMap = new Map();
    const duplicates = [];

    for (const module of modules) {
      if (!module.resource) continue;

      const content = this.getModuleContent(module);
      const hash = this.generateContentHash(content);

      if (moduleMap.has(hash)) {
        const existing = moduleMap.get(hash);
        duplicates.push({
          type: 'webpack_module',
          hash,
          modules: [existing.resource, module.resource],
          size: module.size(),
          severity: this.calculateModuleSeverity(module)
        });
      } else {
        moduleMap.set(hash, module);
      }
    }

    this.buildStats.duplicates = duplicates;

    if (duplicates.length > 0) {
      console.warn(`⚠️ Found ${duplicates.length} duplicate modules in Webpack build`);
      
      // Notify framework if available
      if (this.framework) {
        this.framework.emit('webpack:duplicates-detected', { duplicates });
      }
    }
  }

  /**
   * Analyze chunks
   */
  analyzeChunks(chunks) {
    const chunkAnalysis = [];

    for (const chunk of chunks) {
      const analysis = {
        name: chunk.name,
        id: chunk.id,
        size: chunk.size(),
        modules: chunk.getNumberOfModules(),
        files: Array.from(chunk.files),
        entrypoint: chunk.hasEntryModule(),
        initial: chunk.isOnlyInitial(),
        canBeInitial: chunk.canBeInitial()
      };

      chunkAnalysis.push(analysis);

      // Check for oversized chunks
      if (analysis.size > 500000) { // 500KB
        console.warn(`⚠️ Large chunk detected: ${analysis.name} (${this.formatBytes(analysis.size)})`);
      }
    }

    this.buildStats.chunks = chunkAnalysis;
  }

  /**
   * Handle build completion
   */
  handleBuildComplete(stats) {
    const compilation = stats.compilation;
    
    // Extract build statistics
    this.buildStats.modules = this.extractModuleStats(compilation);
    this.buildStats.assets = this.extractAssetStats(compilation);

    // Generate build report
    if (this.config.generateReport) {
      this.generateBuildReport(stats);
    }

    // Perform post-build analysis
    if (this.config.enableBuildAnalysis) {
      this.performBuildAnalysis();
    }

    console.log(`✅ Webpack build complete - ${this.buildStats.modules.length} modules, ${this.buildStats.assets.length} assets`);
  }

  /**
   * Handle asset emission
   */
  handleAssetEmission(compilation, callback) {
    // Analyze assets before emission
    for (const [filename, source] of Object.entries(compilation.assets)) {
      this.analyzeAsset(filename, source);
    }

    // Generate stability report as asset
    if (this.config.generateReport && this.framework) {
      this.generateStabilityReportAsset(compilation);
    }

    callback();
  }

  /**
   * Extract module statistics
   */
  extractModuleStats(compilation) {
    const modules = [];

    for (const module of compilation.modules) {
      if (!module.resource) continue;

      modules.push({
        resource: module.resource,
        size: module.size(),
        type: module.type,
        built: module.built,
        cached: module.cached,
        optional: module.optional,
        reasons: module.reasons?.length || 0
      });
    }

    return modules;
  }

  /**
   * Extract asset statistics
   */
  extractAssetStats(compilation) {
    const assets = [];

    for (const [name, asset] of Object.entries(compilation.assets)) {
      assets.push({
        name,
        size: asset.size(),
        type: this.getAssetType(name),
        compressed: name.includes('.gz'),
        sourcemap: name.includes('.map')
      });
    }

    return assets;
  }

  /**
   * Analyze individual asset
   */
  analyzeAsset(filename, source) {
    const size = source.size();
    const type = this.getAssetType(filename);

    // Check for large assets
    const sizeThresholds = {
      js: 1000000,   // 1MB
      css: 500000,   // 500KB
      image: 2000000, // 2MB
      font: 1000000  // 1MB
    };

    if (size > (sizeThresholds[type] || 1000000)) {
      console.warn(`⚠️ Large asset detected: ${filename} (${this.formatBytes(size)})`);
    }
  }

  /**
   * Get asset type from filename
   */
  getAssetType(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    
    const typeMap = {
      js: 'js',
      jsx: 'js',
      ts: 'js',
      tsx: 'js',
      css: 'css',
      scss: 'css',
      sass: 'css',
      less: 'css',
      png: 'image',
      jpg: 'image',
      jpeg: 'image',
      gif: 'image',
      svg: 'image',
      webp: 'image',
      woff: 'font',
      woff2: 'font',
      ttf: 'font',
      otf: 'font',
      eot: 'font'
    };

    return typeMap[extension] || 'other';
  }

  /**
   * Generate build report
   */
  generateBuildReport(stats) {
    const report = {
      timestamp: new Date(),
      build: {
        time: stats.endTime - stats.startTime,
        hash: stats.hash,
        errors: stats.compilation.errors.length,
        warnings: stats.compilation.warnings.length
      },
      stability: {
        duplicates: this.buildStats.duplicates.length,
        chunks: this.buildStats.chunks.length,
        modules: this.buildStats.modules.length,
        assets: this.buildStats.assets.length
      },
      performance: this.analyzePerformance(),
      recommendations: this.generateRecommendations()
    };

    console.log('📊 Build report generated:', report);
    return report;
  }

  /**
   * Perform build analysis
   */
  performBuildAnalysis() {
    const analysis = {
      bundleSize: this.analyzeBundleSize(),
      duplicates: this.buildStats.duplicates,
      performance: this.analyzePerformance(),
      optimization: this.analyzeOptimization()
    };

    // Send to framework if available
    if (this.framework) {
      this.framework.emit('webpack:build-analysis', analysis);
    }

    return analysis;
  }

  /**
   * Analyze bundle size
   */
  analyzeBundleSize() {
    const totalSize = this.buildStats.assets.reduce((sum, asset) => sum + asset.size, 0);
    const jsSize = this.buildStats.assets
      .filter(asset => asset.type === 'js')
      .reduce((sum, asset) => sum + asset.size, 0);
    const cssSize = this.buildStats.assets
      .filter(asset => asset.type === 'css')
      .reduce((sum, asset) => sum + asset.size, 0);

    return {
      total: totalSize,
      javascript: jsSize,
      css: cssSize,
      images: totalSize - jsSize - cssSize,
      formatted: {
        total: this.formatBytes(totalSize),
        javascript: this.formatBytes(jsSize),
        css: this.formatBytes(cssSize)
      }
    };
  }

  /**
   * Analyze performance metrics
   */
  analyzePerformance() {
    const largeAssets = this.buildStats.assets.filter(asset => asset.size > 500000);
    const oversizedChunks = this.buildStats.chunks.filter(chunk => chunk.size > 1000000);
    
    return {
      largeAssets: largeAssets.length,
      oversizedChunks: oversizedChunks.length,
      totalModules: this.buildStats.modules.length,
      duplicateModules: this.buildStats.duplicates.length,
      score: this.calculatePerformanceScore()
    };
  }

  /**
   * Calculate performance score
   */
  calculatePerformanceScore() {
    let score = 100;
    
    // Deduct points for issues
    score -= this.buildStats.duplicates.length * 5;
    score -= this.buildStats.assets.filter(a => a.size > 1000000).length * 10;
    score -= this.buildStats.chunks.filter(c => c.size > 1000000).length * 15;
    
    return Math.max(0, score);
  }

  /**
   * Analyze optimization opportunities
   */
  analyzeOptimization() {
    const opportunities = [];

    // Check for unoptimized assets
    const uncompressed = this.buildStats.assets.filter(asset => 
      !asset.compressed && asset.size > 100000 && asset.type === 'js'
    );

    if (uncompressed.length > 0) {
      opportunities.push({
        type: 'compression',
        description: `${uncompressed.length} large assets could benefit from compression`,
        impact: 'high',
        assets: uncompressed.map(a => a.name)
      });
    }

    // Check for large chunks
    const largeChunks = this.buildStats.chunks.filter(chunk => chunk.size > 500000);
    if (largeChunks.length > 0) {
      opportunities.push({
        type: 'code_splitting',
        description: `${largeChunks.length} chunks could benefit from code splitting`,
        impact: 'medium',
        chunks: largeChunks.map(c => c.name)
      });
    }

    // Check for duplicates
    if (this.buildStats.duplicates.length > 0) {
      opportunities.push({
        type: 'deduplication',
        description: `${this.buildStats.duplicates.length} duplicate modules detected`,
        impact: 'high',
        duplicates: this.buildStats.duplicates.length
      });
    }

    return opportunities;
  }

  /**
   * Generate recommendations
   */
  generateRecommendations() {
    const recommendations = [];

    if (this.buildStats.duplicates.length > 0) {
      recommendations.push('Consider extracting common dependencies to shared chunks');
    }

    const largeAssets = this.buildStats.assets.filter(asset => asset.size > 1000000);
    if (largeAssets.length > 0) {
      recommendations.push('Implement code splitting for large bundles');
    }

    const performanceScore = this.calculatePerformanceScore();
    if (performanceScore < 80) {
      recommendations.push('Consider optimizing bundle size and implementing lazy loading');
    }

    return recommendations;
  }

  /**
   * Generate stability report as Webpack asset
   */
  async generateStabilityReportAsset(compilation) {
    try {
      const report = await this.framework.generateReport();
      const reportContent = JSON.stringify(report, null, 2);
      
      compilation.assets['stability-report.json'] = {
        source: () => reportContent,
        size: () => reportContent.length
      };

      console.log('📄 Stability report added to build assets');
    } catch (error) {
      console.error('❌ Failed to generate stability report asset:', error);
    }
  }

  /**
   * Get module content for hashing
   */
  getModuleContent(module) {
    // This would extract the actual module content
    // For now, we'll use the resource path as a simple identifier
    return module.resource || '';
  }

  /**
   * Generate content hash
   */
  generateContentHash(content) {
    // Simple hash function - in production, use a proper hash library
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Calculate module severity
   */
  calculateModuleSeverity(module) {
    const size = module.size();
    
    if (size > 100000) return 'high';
    if (size > 50000) return 'medium';
    return 'low';
  }

  /**
   * Format bytes for display
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get build statistics
   */
  getBuildStats() {
    return { ...this.buildStats };
  }

  /**
   * Get integration status
   */
  getStatus() {
    return {
      pluginName: this.pluginName,
      enabled: true,
      buildAnalysis: this.config.enableBuildAnalysis,
      bundleOptimization: this.config.enableBundleOptimization,
      duplicateDetection: this.config.detectDuplicates,
      lastBuild: this.buildStats.modules.length > 0 ? 'available' : 'none'
    };
  }
}

export default WebpackIntegration;