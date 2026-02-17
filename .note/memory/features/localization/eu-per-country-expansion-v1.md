# Memory: features/localization/eu-per-country-expansion-v1
Updated: just now

## EU Per-Country Transcreation + Voice Expansion

The EU region now supports 3-level nesting: EU → Sub-Region → Country. Each country gets its own fully transcreated script AND dedicated TTS voice with native locale.

### EU Country Breakdown (16 scripts from 1 English base)

| Sub-Region | Countries | Voice Locales |
|---|---|---|
| **EU_WEST** | UK & Ireland (1) | en-GB |
| **EU_DACH** → EU_DE, EU_AT, EU_CH | Germany, Austria, Switzerland (3) | de-DE, de-AT, de-CH |
| **EU_FRANCE** → EU_FR, EU_BE_FR | France, Belgium FR (2) | fr-FR, fr-BE |
| **EU_IBERIA** → EU_ES, EU_PT | Spain, Portugal (2) | es-ES, pt-PT |
| **EU_NORDIC** → EU_SE, EU_NO, EU_DK, EU_FI | Sweden, Norway, Denmark, Finland (4) | sv-SE, nb-NO, da-DK, fi-FI |
| **EU_EAST** → EU_PL, EU_CZ, EU_RO, EU_HU | Poland, Czech, Romania, Hungary (4) | pl-PL, cs-CZ, ro-RO, hu-HU |

### Changes Made
- `RegionChild` interface supports recursive `children?: RegionChild[]`
- `REGION_HIERARCHY` EU group uses 3-level nesting
- `voiceOptionsMap` has 15 new country-level voice entries with 2 voices each (male + female)
- `getGroupCodes` and `REGION_OPTIONS` handle grandchild codes
- `handleAutoExpandAndTranscreate` expands to leaf-level (country, not sub-region)
- `subRegionFallbackOrder` includes all 15 new country codes
- DB `valid_region` CHECK constraint updated with all 15 new codes

### Global Total: 48 leaf-level scripts + 1 English base = 49

Last Updated: 2026-02-12
