/**
 * ESLint Plugin – Stability Framework
 *
 * Lightweight linting rules that enforce the project's naming conventions,
 * file-size limits, and import hygiene.
 */

// ── enforce-naming-conventions ──────────────────────────────────────────────
const enforceNamingConventions = {
  meta: {
    type: "suggestion",
    docs: { description: "Enforce PascalCase components, use* hooks, *Service services" },
    schema: [],
  },
  create(context) {
    const filename = context.getFilename();

    return {
      ExportDefaultDeclaration(node) {
        // Components in src/components should be PascalCase
        if (filename.includes("/components/") && node.declaration) {
          const name =
            node.declaration.name ||
            (node.declaration.id && node.declaration.id.name);
          if (name && !/^[A-Z]/.test(name)) {
            context.report({
              node,
              message: `Component '${name}' should use PascalCase.`,
            });
          }
        }
      },

      ExportNamedDeclaration(node) {
        if (!node.declaration || !node.declaration.declarations) return;

        for (const decl of node.declaration.declarations) {
          if (!decl.id || !decl.id.name) continue;
          const name = decl.id.name;

          // Hooks must start with "use"
          if (filename.includes("/hooks/") && /^[a-z]/.test(name) && !name.startsWith("use")) {
            context.report({
              node: decl.id,
              message: `Hook '${name}' should start with 'use'.`,
            });
          }

          // Service files – exported names should end with Service (soft)
          if (
            filename.includes("/services/") &&
            filename.endsWith("Service.ts") &&
            /service/i.test(name) &&
            !name.endsWith("Service")
          ) {
            context.report({
              node: decl.id,
              message: `Service export '${name}' should end with 'Service'.`,
            });
          }
        }
      },
    };
  },
};

// ── limit-file-complexity ───────────────────────────────────────────────────
const limitFileComplexity = {
  meta: {
    type: "suggestion",
    docs: { description: "Warn when a file has too many exported declarations" },
    schema: [
      {
        type: "object",
        properties: { max: { type: "number" } },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const max = (context.options[0] && context.options[0].max) || 10;
    let exportCount = 0;

    return {
      ExportNamedDeclaration() {
        exportCount += 1;
      },
      "Program:exit"(node) {
        if (exportCount > max) {
          context.report({
            node,
            message: `File has ${exportCount} exports (max ${max}). Consider splitting.`,
          });
        }
      },
    };
  },
};

// ── limit-file-length ───────────────────────────────────────────────────────
const limitFileLength = {
  meta: {
    type: "suggestion",
    docs: { description: "Warn when a file exceeds a line-count threshold" },
    schema: [
      {
        type: "object",
        properties: { max: { type: "number" } },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const max = (context.options[0] && context.options[0].max) || 300;

    return {
      "Program:exit"(node) {
        const lines = context.getSourceCode().lines.length;
        if (lines > max) {
          context.report({
            node,
            message: `File has ${lines} lines (max ${max}). Consider splitting.`,
          });
        }
      },
    };
  },
};

// ── no-duplicate-imports ────────────────────────────────────────────────────
const noDuplicateImports = {
  meta: {
    type: "problem",
    docs: { description: "Disallow multiple import statements from the same module" },
    schema: [],
  },
  create(context) {
    const seen = new Map();

    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (seen.has(source)) {
          context.report({
            node,
            message: `'${source}' is imported multiple times. Merge into a single import.`,
          });
        } else {
          seen.set(source, true);
        }
      },
    };
  },
};

// ── enforce-update-first ────────────────────────────────────────────────────
const enforceUpdateFirst = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Prefer updating/extending existing code over creating new files with similar names",
    },
    schema: [],
  },
  create() {
    // This is intentionally a no-op at lint-time; it exists so the rule name
    // is registered and the config doesn't throw.  The real duplicate-detection
    // logic lives in scripts/framework-check.js which runs as a separate step.
    return {};
  },
};

// ── plugin export ───────────────────────────────────────────────────────────
const plugin = {
  meta: { name: "eslint-plugin-stability-framework", version: "1.0.0" },
  rules: {
    "enforce-naming-conventions": enforceNamingConventions,
    "limit-file-complexity": limitFileComplexity,
    "limit-file-length": limitFileLength,
    "no-duplicate-imports": noDuplicateImports,
    "enforce-update-first": enforceUpdateFirst,
  },
};

export default plugin;
