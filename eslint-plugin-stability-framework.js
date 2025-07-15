/**
 * ESLint Plugin for Stability Framework
 * Real-time enforcement of framework rules during development
 */

const path = require('path');
const fs = require('fs');

const NAMING_PATTERNS = {
  component: /^[A-Z][a-zA-Z0-9]*\.tsx?$/,
  hook: /^use[A-Z][a-zA-Z0-9]*\.tsx?$/,
  service: /^[a-z][a-zA-Z0-9]*Service\.ts$/,
  type: /^[A-Z][a-zA-Z0-9]*\.ts$/
};

const COMPLEXITY_THRESHOLD = 10;
const MAX_FILE_LENGTH = 300;

module.exports = {
  meta: {
    name: 'eslint-plugin-stability-framework',
    version: '1.0.0'
  },
  
  rules: {
    'enforce-naming-conventions': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Enforce stability framework naming conventions',
          category: 'Best Practices',
          recommended: true
        },
        fixable: null,
        schema: []
      },
      create: function(context) {
        const filename = context.getFilename();
        const basename = path.basename(filename);
        const dirname = path.dirname(filename);

        return {
          Program(node) {
            // Check component naming
            if (dirname.includes('components') && !NAMING_PATTERNS.component.test(basename)) {
              context.report({
                node,
                message: `Component file "${basename}" should follow PascalCase naming convention (e.g., ComponentName.tsx)`
              });
            }

            // Check hook naming
            if (dirname.includes('hooks') && !NAMING_PATTERNS.hook.test(basename)) {
              context.report({
                node,
                message: `Hook file "${basename}" should start with "use" and follow camelCase (e.g., useHookName.tsx)`
              });
            }

            // Check service naming
            if (dirname.includes('services') && !NAMING_PATTERNS.service.test(basename)) {
              context.report({
                node,
                message: `Service file "${basename}" should end with "Service" and follow camelCase (e.g., serviceNameService.ts)`
              });
            }

            // Check type naming
            if (dirname.includes('types') && !NAMING_PATTERNS.type.test(basename)) {
              context.report({
                node,
                message: `Type file "${basename}" should follow PascalCase naming convention (e.g., TypeName.ts)`
              });
            }
          }
        };
      }
    },

    'limit-file-complexity': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Limit file complexity to maintain readability',
          category: 'Best Practices',
          recommended: true
        },
        fixable: null,
        schema: [
          {
            type: 'object',
            properties: {
              max: { type: 'integer', minimum: 1 }
            },
            additionalProperties: false
          }
        ]
      },
      create: function(context) {
        const options = context.options[0] || {};
        const maxComplexity = options.max || COMPLEXITY_THRESHOLD;
        let complexity = 0;

        function incrementComplexity() {
          complexity++;
        }

        return {
          Program() {
            complexity = 1; // Base complexity
          },

          'Program:exit'(node) {
            if (complexity > maxComplexity) {
              context.report({
                node,
                message: `File complexity (${complexity}) exceeds maximum allowed (${maxComplexity}). Consider breaking into smaller files.`
              });
            }
          },

          IfStatement: incrementComplexity,
          WhileStatement: incrementComplexity,
          ForStatement: incrementComplexity,
          ForInStatement: incrementComplexity,
          ForOfStatement: incrementComplexity,
          SwitchStatement: incrementComplexity,
          CatchClause: incrementComplexity,
          ConditionalExpression: incrementComplexity,
          LogicalExpression: incrementComplexity
        };
      }
    },

    'limit-file-length': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Limit file length to maintain readability',
          category: 'Best Practices',
          recommended: true
        },
        fixable: null,
        schema: [
          {
            type: 'object',
            properties: {
              max: { type: 'integer', minimum: 1 }
            },
            additionalProperties: false
          }
        ]
      },
      create: function(context) {
        const options = context.options[0] || {};
        const maxLines = options.max || MAX_FILE_LENGTH;

        return {
          'Program:exit'(node) {
            const sourceCode = context.getSourceCode();
            const lines = sourceCode.lines.length;

            if (lines > maxLines) {
              context.report({
                node,
                message: `File length (${lines} lines) exceeds maximum allowed (${maxLines} lines). Consider breaking into smaller files.`
              });
            }
          }
        };
      }
    },

    'no-duplicate-imports': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Prevent duplicate imports',
          category: 'Best Practices',
          recommended: true
        },
        fixable: 'code',
        schema: []
      },
      create: function(context) {
        const importMap = new Map();

        return {
          ImportDeclaration(node) {
            const source = node.source.value;
            
            if (importMap.has(source)) {
              context.report({
                node,
                message: `"${source}" import is duplicated.`,
                fix: function(fixer) {
                  // Remove the duplicate import
                  return fixer.remove(node);
                }
              });
            } else {
              importMap.set(source, node);
            }
          }
        };
      }
    },

    'enforce-update-first': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Warn when creating files that might duplicate existing functionality',
          category: 'Best Practices',
          recommended: true
        },
        fixable: null,
        schema: []
      },
      create: function(context) {
        const filename = context.getFilename();
        const basename = path.basename(filename, path.extname(filename));
        const dirname = path.dirname(filename);

        return {
          Program(node) {
            try {
              // Check for similar files in the same directory
              const files = fs.readdirSync(dirname);
              const similarFiles = files.filter(file => {
                const fileBasename = path.basename(file, path.extname(file));
                return fileBasename.toLowerCase().includes(basename.toLowerCase()) && 
                       fileBasename !== basename;
              });

              if (similarFiles.length > 0) {
                context.report({
                  node,
                  message: `Similar files exist: ${similarFiles.join(', ')}. Consider updating existing files instead of creating new ones (Update First principle).`
                });
              }
            } catch (error) {
              // Directory read failed, ignore
            }
          }
        };
      }
    }
  },

  configs: {
    recommended: {
      plugins: ['stability-framework'],
      rules: {
        'stability-framework/enforce-naming-conventions': 'error',
        'stability-framework/limit-file-complexity': ['warn', { max: 10 }],
        'stability-framework/limit-file-length': ['warn', { max: 300 }],
        'stability-framework/no-duplicate-imports': 'error',
        'stability-framework/enforce-update-first': 'warn'
      }
    }
  }
};