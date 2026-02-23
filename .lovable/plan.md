

# Sprint 2 Design Strategy: Glass Morphism vs. Alternatives

## Executive Summary

**Recommendation: Continue with Glass Morphism — it IS the right choice.** Here's why, what's already built, and the plan to make it WOW.

---

## 1. Why Glass Morphism Is the Right Call

### What you already have (don't throw away)

Your codebase has a **production-ready glass design system** with two tiers:

| Layer | File | What it does |
|-------|------|-------------|
| CSS foundation | `src/index.css` (lines 679-876) | 12 glass classes, 3 animations, RTL support, dark mode, mobile touch targets |
| React primitives | `src/components/ui/glass-primitives.tsx` | GlassCard, GlassPanel, GlassTabs, GlassModal, GlassBadge, GlassInput, GlassButton — all with glow + animation variants |
| Motion cards | `src/components/shared/LiquidGlassCard.tsx` | Framer Motion hover-lift, step badges, active/completed states, 6 color variants |

This is **significant infrastructure** (~400 lines). Switching design languages would waste all of it.

### Competitive advantage

| Competitor | Design | Glass? |
|-----------|--------|--------|
| Canva | Flat Material | No |
| Descript | Clean minimal | No |
| Runway ML | Dark flat | Partial |
| Synthesia | Corporate cards | No |
| Kapwing | Light flat | No |
| **Genie Cast** | **Dark glass + emerald accent** | **Full system** |

Glass morphism with your emerald/provider-glow system is genuinely differentiated in the AI video production space.

### Regional/RTL readiness

Your CSS already includes RTL-specific glass rules (lines 849-876): sidebar flip, text alignment, tab flow reversal. No other design system in your competitor set handles this.

---

## 2. What Would Make It WOW (Sprint 2 Enhancements)

The current system is solid but needs **depth** — right now it's "glass cards on a flat page." The WOW factor comes from layered depth and contextual animation.

### Enhancement A: Ambient Background Layer
Add a subtle animated gradient mesh behind the Cast workspace (not inside cards). This gives the glass something to blur against, which is what makes Apple's glass feel alive.

### Enhancement B: Contextual Glow
Cards should glow based on what they represent:
- Scene cards: emerald glow when active
- AI provider cards: provider-specific glow (already have `glass-glow-azure`, `glass-glow-alibaba`, `glass-glow-gemini`)
- Timeline markers: pulse on the currently-rendering scene

### Enhancement C: Micro-interactions
- Tab switches: cross-fade (not mount/unmount — fixes the flickering)
- Card selection: ring + scale
- Progress states: shimmer animation (already have `glass-animate-shimmer`)

### Enhancement D: Regional Personality
Use the existing `useEcosystemRouting` to subtly shift accent hues per zone:
- Asia-Pacific: slightly warmer emerald
- Middle East: gold accent undertone
- Europe: cooler blue-emerald
This is a 5-line CSS variable swap, not a redesign.

---

## 3. Routing Integration — Use What Exists

The routing infrastructure is **fully wired and ready**:

```text
useEcosystemRouting()          -- IP-based zone detection, 5-zone LLM routing
  |
  +-- useRegionalLanguage()    -- TTS provider selection, language bundles
  |
  +-- useRegionPersistence()   -- Supabase-persisted user preference
  |
  +-- routeAIRequest()         -- Gateway for all AI calls (image, TTS, LLM)
```

For Cast components, the pattern is:
1. Import `useEcosystemRouting` to get zone/region
2. Use returned `routing.llm` and `routing.tts` to show correct provider badges
3. All AI generation calls go through `routeAIRequest()` — never direct edge function calls

This is already working. No changes needed to routing for Sprint 2.

---

## 4. Implementation Plan (9 Backlog Items)

### Priority Order

| Order | Item | What to build | Glass primitives to use |
|-------|------|--------------|------------------------|
| 0 | H-705 | Provision `cast-assets` storage bucket | N/A (backend) |
| 1 | L2-009 | Dashboard layout — unified glass card grid | `GlassCard`, `GlassPanel`, `LiquidGlassCard` + new ambient background |
| 2 | L2-004 | Style Picker polish — add glass styling to existing dual-portal | `GlassCard` with `glow` variants |
| 3 | L2-001 | Timeline/Storyboard view — horizontal scene strip | `LiquidGlassCard` with `stepBadge` + `isActive` |
| 4 | L2-002 | Scene Editor — drag/drop reorder | `GlassPanel` containers + dnd-kit integration |
| 5 | L2-003 | Character Gallery — browse/select grid | `LiquidGlassCard` grid with hover preview |
| 6 | L2-005 | Output Presets panel — resolution/format selector | `GlassCard` + `GlassTabs` |
| 7 | L2-006 | Preview Player — video with scene markers | `GlassPanel elevated` wrapper |
| 8 | L2-007 | Export/Download flow — progress + format | `GlassModal` with `glass-animate-shimmer` progress |
| 9 | L2-008 | Mobile responsive — breakpoints | Leverage existing `glass-touch-target` + `useIsMobile()` |

### Files to modify (all within territory: `src/components/genie-admin/genie-cast/**`)

- `GenieCastHub.tsx` — Add ambient background, restructure to glass grid
- `GenieCastConsolidatedTabs.tsx` — Switch AnimatePresence to CSS visibility (fix flickering)
- `GenieCastOverview.tsx` — Restyle overview cards with LiquidGlassCard
- `VideoStyleCards.tsx` — Add glass glow per style
- New files for L2-001 through L2-007 (within Cast directory)

### What NOT to touch

- `src/config/*` — Claude's territory
- `src/services/*` — Claude's territory
- `src/hooks/useEcosystemRouting.ts` — Claude's territory
- `AppLayout.tsx`, `GenieStudioLayout.tsx` — Claude's territory

---

## 5. Bottom Line

| Question | Answer |
|----------|--------|
| Keep glass morphism? | **Yes** — you have 400+ lines of production CSS/React, RTL-ready, dark-mode-ready |
| What makes it WOW? | Ambient gradient mesh background + contextual provider glows + micro-interactions |
| Better alternative? | No — flat/material would look generic; neumorphism has accessibility issues; glass is the Apple-tier play |
| Regional support? | Already built — RTL CSS rules, `useEcosystemRouting`, zone-aware accent colors |
| Use existing routing? | **Yes** — `useEcosystemRouting` + `routeAIRequest()` are wired and working |

The glass system is your moat. Sprint 2 is about **applying it consistently** across all 81 Cast files with the ambient depth layer that makes it feel alive.

