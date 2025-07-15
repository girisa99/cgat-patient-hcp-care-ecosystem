/**
 * ESLint Integration - Integrates stability framework with ESLint
 * Provides custom ESLint rules for stability checks
 */

export class ESLintIntegration {
  constructor(config = {}) {
    this.config = {
      enableCustomRules: true,
      enableStabilityChecks: true,
      enableDuplicateDetection: true,
      severity: 'warn', // 'error', 'warn', 'off'
      ...config
    };
    
    this.pluginName = 'stability-framework';
    this.framework = null;
    this.rules = new Map();
    
    this.initializeRules();
  }

  /**
   * Initialize custom ESLint rules
   */
  initializeRules() {
    // Component-related rules
    this.addRule('no-duplicate-components', this.noDuplicateComponents.bind(this));
    this.addRule('component-naming-convention', this.componentNamingConvention.bind(this));
    this.addRule('max-component-size', this.maxComponentSize.bind(this));
    this.addRule('require-prop-types', this.requirePropTypes.bind(this));
    
    // Hook-related rules
    this.addRule('hooks-dependency-array', this.hooksDependencyArray.bind(this));
    this.addRule('no-conditional-hooks', this.noConditionalHooks.bind(this));
    this.addRule('hooks-naming-convention', this.hooksNamingConvention.bind(this));
    
    // Import/Export rules
    this.addRule('no-duplicate-imports', this.noDuplicateImports.bind(this));
    this.addRule('consistent-export-style', this.consistentExportStyle.bind(this));
    this.addRule('no-unused-exports', this.noUnusedExports.bind(this));
    
    // Performance rules
    this.addRule('no-large-bundles', this.noLargeBundles.bind(this));
    this.addRule('prefer-lazy-loading', this.preferLazyLoading.bind(this));
    
    // Security rules
    this.addRule('no-dangerous-props', this.noDangerousProps.bind(this));
    this.addRule('require-accessibility', this.requireAccessibility.bind(this));
  }

  /**
   * Add a custom rule
   */
  addRule(name, implementation) {
    this.rules.set(name, {
      meta: this.getRuleMeta(name),
      create: implementation
    });
  }

  /**
   * Get rule metadata
   */
  getRuleMeta(ruleName) {
    const metaData = {
      'no-duplicate-components': {
        type: 'problem',
        docs: {
          description: 'Prevent duplicate component definitions',
          category: 'Stability',
          recommended: true
        },
        fixable: 'code',
        schema: []
      },
      'component-naming-convention': {
        type: 'suggestion',
        docs: {
          description: 'Enforce consistent component naming convention',
          category: 'Stylistic',
          recommended: true
        },
        fixable: 'code',
        schema: [
          {
            type: 'object',
            properties: {
              pattern: { type: 'string' },
              format: { enum: ['PascalCase', 'camelCase'] }
            }
          }
        ]
      },
      'max-component-size': {
        type: 'suggestion',
        docs: {
          description: 'Enforce maximum component size',
          category: 'Performance',
          recommended: true
        },
        schema: [
          {
            type: 'object',
            properties: {
              maxLines: { type: 'number', minimum: 1 },
              maxStatements: { type: 'number', minimum: 1 }
            }
          }
        ]
      },
      'require-prop-types': {
        type: 'suggestion',
        docs: {
          description: 'Require PropTypes for component props',
          category: 'Type Safety',
          recommended: true
        },
        schema: []
      },
      'hooks-dependency-array': {
        type: 'problem',
        docs: {
          description: 'Enforce correct dependencies in effect hooks',
          category: 'Hooks',
          recommended: true
        },
        fixable: 'code',
        schema: []
      },
      'no-conditional-hooks': {
        type: 'error',
        docs: {
          description: 'Prevent conditional hook calls',
          category: 'Hooks',
          recommended: true
        },
        schema: []
      },
      'hooks-naming-convention': {
        type: 'suggestion',
        docs: {
          description: 'Enforce hooks naming convention',
          category: 'Stylistic',
          recommended: true
        },
        schema: []
      },
      'no-duplicate-imports': {
        type: 'problem',
        docs: {
          description: 'Prevent duplicate import statements',
          category: 'Imports',
          recommended: true
        },
        fixable: 'code',
        schema: []
      },
      'consistent-export-style': {
        type: 'suggestion',
        docs: {
          description: 'Enforce consistent export style',
          category: 'Exports',
          recommended: false
        },
        fixable: 'code',
        schema: [
          {
            enum: ['named', 'default', 'mixed']
          }
        ]
      },
      'no-unused-exports': {
        type: 'suggestion',
        docs: {
          description: 'Prevent unused exports',
          category: 'Exports',
          recommended: true
        },
        schema: []
      },
      'no-large-bundles': {
        type: 'suggestion',
        docs: {
          description: 'Warn about large bundle sizes',
          category: 'Performance',
          recommended: true
        },
        schema: [
          {
            type: 'object',
            properties: {
              maxSize: { type: 'number', minimum: 1 }
            }
          }
        ]
      },
      'prefer-lazy-loading': {
        type: 'suggestion',
        docs: {
          description: 'Prefer lazy loading for large components',
          category: 'Performance',
          recommended: false
        },
        fixable: 'code',
        schema: []
      },
      'no-dangerous-props': {
        type: 'problem',
        docs: {
          description: 'Prevent dangerous props like dangerouslySetInnerHTML',
          category: 'Security',
          recommended: true
        },
        schema: []
      },
      'require-accessibility': {
        type: 'suggestion',
        docs: {
          description: 'Require accessibility attributes',
          category: 'Accessibility',
          recommended: true
        },
        schema: []
      }
    };

    return metaData[ruleName] || {
      type: 'suggestion',
      docs: {
        description: 'Custom stability rule',
        category: 'Stability'
      },
      schema: []
    };
  }

  /**
   * Create ESLint plugin configuration
   */
  createPlugin(framework) {
    this.framework = framework;
    
    return {
      meta: {
        name: this.pluginName,
        version: '1.0.0'
      },
      rules: Object.fromEntries(this.rules),
      configs: {
        recommended: this.getRecommendedConfig(),
        strict: this.getStrictConfig(),
        healthcare: this.getHealthcareConfig()
      }
    };
  }

  /**
   * Get recommended configuration
   */
  getRecommendedConfig() {
    return {
      plugins: [this.pluginName],
      rules: {
        [`${this.pluginName}/no-duplicate-components`]: 'warn',
        [`${this.pluginName}/component-naming-convention`]: 'warn',
        [`${this.pluginName}/max-component-size`]: ['warn', { maxLines: 200 }],
        [`${this.pluginName}/hooks-dependency-array`]: 'error',
        [`${this.pluginName}/no-conditional-hooks`]: 'error',
        [`${this.pluginName}/no-duplicate-imports`]: 'warn',
        [`${this.pluginName}/no-dangerous-props`]: 'error'
      }
    };
  }

  /**
   * Get strict configuration
   */
  getStrictConfig() {
    return {
      plugins: [this.pluginName],
      rules: {
        [`${this.pluginName}/no-duplicate-components`]: 'error',
        [`${this.pluginName}/component-naming-convention`]: 'error',
        [`${this.pluginName}/max-component-size`]: ['error', { maxLines: 150 }],
        [`${this.pluginName}/require-prop-types`]: 'error',
        [`${this.pluginName}/hooks-dependency-array`]: 'error',
        [`${this.pluginName}/no-conditional-hooks`]: 'error',
        [`${this.pluginName}/hooks-naming-convention`]: 'error',
        [`${this.pluginName}/no-duplicate-imports`]: 'error',
        [`${this.pluginName}/consistent-export-style`]: ['error', 'named'],
        [`${this.pluginName}/no-unused-exports`]: 'error',
        [`${this.pluginName}/no-dangerous-props`]: 'error',
        [`${this.pluginName}/require-accessibility`]: 'error'
      }
    };
  }

  /**
   * Get healthcare-specific configuration
   */
  getHealthcareConfig() {
    return {
      plugins: [this.pluginName],
      rules: {
        ...this.getStrictConfig().rules,
        [`${this.pluginName}/require-accessibility`]: 'error', // HIPAA compliance
        [`${this.pluginName}/no-dangerous-props`]: 'error', // Security requirement
        [`${this.pluginName}/require-prop-types`]: 'error' // Data validation
      }
    };
  }

  // Rule implementations

  /**
   * Rule: no-duplicate-components
   */
  noDuplicateComponents(context) {
    const componentNames = new Set();
    
    return {
      FunctionDeclaration(node) {
        if (this.isReactComponent(node)) {
          this.checkDuplicateComponent(context, node, componentNames);
        }
      },
      VariableDeclarator(node) {
        if (this.isReactComponentVariable(node)) {
          this.checkDuplicateComponent(context, node, componentNames);
        }
      }
    };
  }

  /**
   * Rule: component-naming-convention
   */
  componentNamingConvention(context) {
    const options = context.options[0] || {};
    const format = options.format || 'PascalCase';
    
    return {
      FunctionDeclaration(node) {
        if (this.isReactComponent(node)) {
          this.checkNamingConvention(context, node, format);
        }
      }
    };
  }

  /**
   * Rule: max-component-size
   */
  maxComponentSize(context) {
    const options = context.options[0] || {};
    const maxLines = options.maxLines || 200;
    const maxStatements = options.maxStatements || 50;
    
    return {
      FunctionDeclaration(node) {
        if (this.isReactComponent(node)) {
          this.checkComponentSize(context, node, maxLines, maxStatements);
        }
      }
    };
  }

  /**
   * Rule: require-prop-types
   */
  requirePropTypes(context) {
    return {
      FunctionDeclaration(node) {
        if (this.isReactComponent(node)) {
          this.checkPropTypes(context, node);
        }
      }
    };
  }

  /**
   * Rule: hooks-dependency-array
   */
  hooksDependencyArray(context) {
    return {
      CallExpression(node) {
        if (this.isEffectHook(node)) {
          this.checkDependencyArray(context, node);
        }
      }
    };
  }

  /**
   * Rule: no-conditional-hooks
   */
  noConditionalHooks(context) {
    const conditionalStack = [];
    
    return {
      IfStatement() {
        conditionalStack.push(true);
      },
      'IfStatement:exit'() {
        conditionalStack.pop();
      },
      CallExpression(node) {
        if (this.isHookCall(node) && conditionalStack.length > 0) {
          context.report({
            node,
            message: 'Hooks should not be called conditionally'
          });
        }
      }
    };
  }

  /**
   * Rule: hooks-naming-convention
   */
  hooksNamingConvention(context) {
    return {
      FunctionDeclaration(node) {
        if (this.isCustomHook(node)) {
          this.checkHookNaming(context, node);
        }
      }
    };
  }

  /**
   * Rule: no-duplicate-imports
   */
  noDuplicateImports(context) {
    const importSources = new Set();
    
    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (importSources.has(source)) {
          context.report({
            node,
            message: `Duplicate import from '${source}'`,
            fix: (fixer) => this.fixDuplicateImport(fixer, node)
          });
        } else {
          importSources.add(source);
        }
      }
    };
  }

  /**
   * Rule: consistent-export-style
   */
  consistentExportStyle(context) {
    const style = context.options[0] || 'named';
    
    return {
      ExportDefaultDeclaration(node) {
        if (style === 'named') {
          context.report({
            node,
            message: 'Use named exports instead of default exports'
          });
        }
      },
      ExportNamedDeclaration(node) {
        if (style === 'default' && !node.declaration) {
          context.report({
            node,
            message: 'Use default exports instead of named exports'
          });
        }
      }
    };
  }

  /**
   * Rule: no-unused-exports
   */
  noUnusedExports(context) {
    // This would need cross-file analysis
    // For now, just check for exports in the same file
    const exports = new Set();
    const usages = new Set();
    
    return {
      ExportNamedDeclaration(node) {
        if (node.declaration) {
          exports.add(node.declaration.id?.name);
        }
      },
      Identifier(node) {
        usages.add(node.name);
      },
      'Program:exit'() {
        for (const exportName of exports) {
          if (!usages.has(exportName)) {
            // Would report unused export
          }
        }
      }
    };
  }

  /**
   * Rule: no-large-bundles
   */
  noLargeBundles(context) {
    const options = context.options[0] || {};
    const maxSize = options.maxSize || 500000; // 500KB
    
    return {
      Program() {
        // This would need integration with bundle analysis
        // For now, just check file size
        const sourceCode = context.getSourceCode();
        const fileSize = sourceCode.getText().length;
        
        if (fileSize > maxSize) {
          context.report({
            loc: { line: 1, column: 0 },
            message: `File size (${fileSize} bytes) exceeds maximum (${maxSize} bytes)`
          });
        }
      }
    };
  }

  /**
   * Rule: prefer-lazy-loading
   */
  preferLazyLoading(context) {
    return {
      ImportDeclaration(node) {
        if (this.isLargeComponent(node)) {
          context.report({
            node,
            message: 'Consider lazy loading this large component',
            fix: (fixer) => this.fixLazyLoading(fixer, node)
          });
        }
      }
    };
  }

  /**
   * Rule: no-dangerous-props
   */
  noDangerousProps(context) {
    const dangerousProps = ['dangerouslySetInnerHTML', 'innerHTML'];
    
    return {
      JSXAttribute(node) {
        if (dangerousProps.includes(node.name.name)) {
          context.report({
            node,
            message: `Avoid using dangerous prop '${node.name.name}'`
          });
        }
      }
    };
  }

  /**
   * Rule: require-accessibility
   */
  requireAccessibility(context) {
    const interactiveElements = ['button', 'input', 'select', 'textarea', 'a'];
    
    return {
      JSXOpeningElement(node) {
        const elementName = node.name.name;
        if (interactiveElements.includes(elementName)) {
          this.checkAccessibilityAttributes(context, node);
        }
      }
    };
  }

  // Helper methods

  isReactComponent(node) {
    return node.type === 'FunctionDeclaration' && 
           /^[A-Z]/.test(node.id.name);
  }

  isReactComponentVariable(node) {
    return node.id && 
           /^[A-Z]/.test(node.id.name) &&
           node.init && 
           (node.init.type === 'ArrowFunctionExpression' || 
            node.init.type === 'FunctionExpression');
  }

  isEffectHook(node) {
    return node.callee.name === 'useEffect' ||
           node.callee.name === 'useCallback' ||
           node.callee.name === 'useMemo';
  }

  isHookCall(node) {
    return node.callee.name && node.callee.name.startsWith('use');
  }

  isCustomHook(node) {
    return node.id && node.id.name.startsWith('use');
  }

  isLargeComponent(node) {
    // Simple heuristic - check if importing from components folder
    return node.source.value.includes('/components/') &&
           node.source.value.length > 30;
  }

  checkDuplicateComponent(context, node, componentNames) {
    const name = node.id ? node.id.name : node.key.name;
    if (componentNames.has(name)) {
      context.report({
        node,
        message: `Duplicate component name '${name}'`
      });
    } else {
      componentNames.add(name);
    }
  }

  checkNamingConvention(context, node, format) {
    const name = node.id.name;
    const isValid = format === 'PascalCase' ? 
      /^[A-Z][a-zA-Z0-9]*$/.test(name) :
      /^[a-z][a-zA-Z0-9]*$/.test(name);
    
    if (!isValid) {
      context.report({
        node,
        message: `Component name '${name}' should use ${format}`
      });
    }
  }

  checkComponentSize(context, node, maxLines, maxStatements) {
    const sourceCode = context.getSourceCode();
    const startLine = node.loc.start.line;
    const endLine = node.loc.end.line;
    const lineCount = endLine - startLine + 1;
    
    if (lineCount > maxLines) {
      context.report({
        node,
        message: `Component exceeds maximum line count (${lineCount}/${maxLines})`
      });
    }
  }

  checkPropTypes(context, node) {
    // Check if component has propTypes defined
    // This is a simplified check
    const componentName = node.id.name;
    const sourceCode = context.getSourceCode();
    const text = sourceCode.getText();
    
    if (!text.includes(`${componentName}.propTypes`)) {
      context.report({
        node,
        message: `Component '${componentName}' should define propTypes`
      });
    }
  }

  checkDependencyArray(context, node) {
    if (node.arguments.length < 2) {
      context.report({
        node,
        message: 'Effect hook missing dependency array'
      });
    }
  }

  checkHookNaming(context, node) {
    const name = node.id.name;
    if (!name.startsWith('use')) {
      context.report({
        node,
        message: `Custom hook '${name}' should start with 'use'`
      });
    }
  }

  checkAccessibilityAttributes(context, node) {
    const requiredAttrs = {
      'button': ['aria-label'],
      'input': ['aria-label', 'id'],
      'img': ['alt']
    };
    
    const elementName = node.name.name;
    const required = requiredAttrs[elementName];
    
    if (required) {
      const hasRequired = required.some(attr => 
        node.attributes.some(attribute => 
          attribute.name && attribute.name.name === attr
        )
      );
      
      if (!hasRequired) {
        context.report({
          node,
          message: `${elementName} element missing accessibility attributes: ${required.join(', ')}`
        });
      }
    }
  }

  fixDuplicateImport(fixer, node) {
    return fixer.remove(node);
  }

  fixLazyLoading(fixer, node) {
    const source = node.source.value;
    const specifiers = node.specifiers.map(spec => spec.local.name).join(', ');
    
    return fixer.replaceText(node, 
      `const { ${specifiers} } = lazy(() => import('${source}'));`
    );
  }

  /**
   * Get integration status
   */
  getStatus() {
    return {
      pluginName: this.pluginName,
      enabled: true,
      customRules: this.config.enableCustomRules,
      stabilityChecks: this.config.enableStabilityChecks,
      duplicateDetection: this.config.enableDuplicateDetection,
      ruleCount: this.rules.size
    };
  }

  /**
   * Get available rules
   */
  getAvailableRules() {
    return Array.from(this.rules.keys());
  }
}

export default ESLintIntegration;