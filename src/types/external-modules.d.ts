// Declarations for third-party modules that lack bundled TypeScript types.

// 1. lovable-tagger – Vite plugin that adds data-component tags
declare module 'lovable-tagger' {
  import type { PluginOption } from 'vite';
  // Returns a Vite plugin; real implementation adds data-component attributes at build time.
  export function componentTagger(): PluginOption;
}

// 2. Supabase auth-js indirectly references this Solana package in its .d.ts but we never use it directly.
declare module '@solana/wallet-standard-features' {
  const value: unknown;
  export default value;
}

// 3. Vite's own types reference this Rollup helper.
declare module 'rollup/parseAst' {
  // Minimal signatures to satisfy the compiler without pulling in Rollup internals.
  export function parseAst(code: string): unknown;
  export function parseAstAsync(code: string): Promise<unknown>;
}