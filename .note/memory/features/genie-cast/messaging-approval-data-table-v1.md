# Memory: features/genie-cast/messaging-approval-data-table-v1
Updated: just now

## Messaging Data Table - Filterable Approval Workflow

### Problem Solved
The previous Pending/Approved tabs used basic card layouts that didn't scale for multiple products, lacked filtering, had no regeneration capability, and didn't follow the parent→child regional hierarchy pattern.

### Solution Implemented

Created `MessagingDataTable.tsx` — a reusable filterable table with:

**Parent→Child Tree Model:**
- English master entries as parent rows
- Regional variants as expandable children (tree connector lines)
- Version history per entry with version badges

**Flat Filters:**
- Search (headline, hook, product, audience)
- Product filter (color-coded)
- Status filter (pending/approved/rejected)
- Region filter
- Sortable columns (product, status, date, version)

**Actions:**
- Inline approve/reject buttons
- Regenerate button (per row)
- View detail dialog (full messaging preview)
- Copy to clipboard
- Bulk select + approve

**Integration:**
- Pending tab → data table with pending entries + regenerate
- Approved tab → data table with approved entries + regenerate
- Generate preview (batch/matrix) → compact data table instead of card list

### Files Created/Modified

**New:**
- `src/components/genie-admin/genie-cast/MessagingDataTable.tsx`

**Modified:**
- `src/components/genie-admin/MessagingGeneratorPanel.tsx` (replaced card-based pending/approved/preview with data table)
