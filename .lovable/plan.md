
# Drug Label: Dynamic Proposed-vs-RLD Extraction & Comparison

## Problem with current behavior

- Extraction treats everything as "Proposed" (single bag of fields). RLD is left blank in the comparison tab.
- The RLD Comparison tab uses a fixed FDA target-field list (`drug-label.targetFields` in `src/config/documentTypes.ts`) — not the dynamic sections actually present in each label.
- The user expects: upload once → system separates Proposed vs RLD content from the same document (or accepts a second RLD upload) → comparison tab simply shows the side-by-side result with match/mismatch/missing.
- Document preview wasn't loading and OCR-image button hit a 2xx-but-empty edge function error.

## Goal

One upload-driven pipeline that produces three things at the same time:
1. A dynamic field/section list discovered from the document.
2. Proposed-label values per field.
3. RLD values per field (from the same doc when present, or a second RLD upload when needed).

The RLD Comparison tab becomes a read-only review of that pre-computed result with verify/accept actions — no re-entry required.

## Scope (frontend-only, drug-label doc type)

Files touched:
- `src/components/document-processing/tabs/DrugLabelRLDTab.tsx` — rebuild around dynamic schema + dual-channel extraction.
- `src/pages/DocumentProcessing.tsx` — pass through the new dual-channel extraction result; trigger the dual extraction in the drug-label branch right after the existing Stage-2 extraction completes.
- `src/config/documentTypes.ts` — keep `drug-label.targetFields` only as a *seed/anchor list*; mark the schema as dynamic (no behavior change for other doc types).

No DB migrations, no new edge functions, no changes outside drug-label.

## New extraction contract

A single call to `ai-universal-processor` (Gemini Vision) returns:

```json
{
  "documentContains": "proposed_only" | "rld_only" | "both",
  "fields": [
    {
      "key": "indications_and_usage",
      "label": "1 Indications and Usage",
      "proposed": { "value": "...", "confidence": 0.92, "evidence": "..." } | null,
      "rld":      { "value": "...", "confidence": 0.88, "evidence": "..." } | null
    }
  ]
}
```

Rules enforced in the prompt:
- Field list is **document-driven** — the model emits only sections it actually found, plus any of the FDA seed keys when present (seed keys passed as hints, not as required output).
- Verbatim values only; empty when not found.
- If only one side exists in the document, the other side is `null` and the user can later upload an RLD to fill it.

## UI behavior — RLD Comparison tab

Replace the current grid with a comparison table whose **rows are the dynamic fields returned by extraction**, not a hardcoded list:

```text
┌────────────────────────┬──────────────────────────┬──────────────────────────┬──────────┬──────────┐
│ Field (dynamic)        │ Proposed                 │ RLD                      │ Status   │ Actions  │
├────────────────────────┼──────────────────────────┼──────────────────────────┼──────────┼──────────┤
│ Indications and Usage  │ <verbatim text + conf %> │ <verbatim text + conf %> │ Match    │ Accept   │
│ Boxed Warning          │ <text>                   │ — missing —              │ Missing  │ Add RLD  │
│ Dosage and Admin.      │ <text A> [diff]          │ <text B> [diff]          │ Mismatch │ Accept   │
└────────────────────────┴──────────────────────────┴──────────────────────────┴──────────┴──────────┘
```

- Status is computed locally (normalized exact = Match, substring = Partial, both present and different = Mismatch, one side empty = Missing in proposed/RLD). No second AI round-trip required for basic mapping.
- Inline word-level diff stays for Mismatch/Partial rows (already implemented).
- Source document preview stays at the top, with PDF iframe + image fallback (already fixed).
- New compact toolbar:
  - "Re-extract" — re-runs dual extraction on the current document.
  - "Upload RLD separately" — adds a second image/PDF; runs extraction in `rld_only` mode and merges values into the same dynamic field rows.
  - "Accept all matches" / per-row "Accept" — sets a verified flag (kept in component state + sessionStorage, no DB write in this scope).
- Confidence badges per side per field (uses returned `confidence`).
- Summary bar: `<dynamic field count>` fields · `<matched>` matched · `<mismatch>` mismatched · `<missing>` missing.

## Trigger flow (auto-run, no extra clicks)

1. User uploads document on Upload tab. Existing OCR + Stage-2 extraction runs as today.
2. When `selectedDocType === 'drug-label'` and Stage-2 completes, `DocumentProcessing.tsx` fires the new `extractProposedAndRld(file|imageUrl)` helper.
3. Result is stored on `processingResult.dualExtraction` (new optional field on the existing in-memory `ProcessingResult` shape — already loose-typed, no DB schema change).
4. RLD Comparison tab reads `processingResult.dualExtraction` directly and renders. If the tab is opened before extraction finishes, it shows a loading state.

## Bug fixes folded in

- OCR image button: continue using raw base64 (already fixed) and surface the actual edge-function error body in the toast instead of a generic message.
- PDF preview: keep iframe path (already fixed).
- Persisted state key `drugLabel_rldFields` is migrated to a new key `drugLabel_dualExtraction_v2` so old single-channel state doesn't leak into the new view.

## Out of scope (suggest, do not build now)

- Persisting accepted comparison results into a DB table (e.g. `drug_label_rld_comparisons`) — recommend a follow-up migration once the UX is validated.
- Reusing this dynamic dual-channel schema for non-drug-label doc types.
- Multi-page PDF page-by-page extraction (current call uses single-image / first-page; large PDFs may need chunking later).
