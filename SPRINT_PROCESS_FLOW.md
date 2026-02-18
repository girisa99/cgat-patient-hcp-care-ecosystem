# GenieSuite Sprint Process Flow — Visual Guide

## 1. High-Level Sprint Architecture

```mermaid
graph TB
    subgraph SPRINT["🏃 5-Day Sprint (Feb 17-21, 2026)"]
        direction TB
        D1["Day 1: Foundation<br/>Diagnose + Audit"]
        D2["Day 2: Deck + Products<br/>First module complete"]
        D3["Day 3: Spark + Demos<br/>Second module complete"]
        D4["Day 4: Mind + Mobile<br/>Third module complete"]
        D5["Day 5: Integration + Merge<br/>Ship it"]
        D1 --> D2 --> D3 --> D4 --> D5
    end

    subgraph ROLES["Three Roles"]
        CL["Claude (Tech Lead)<br/>Spark, Mind, Deck<br/>18 tasks"]
        LV["Lovable (Developer)<br/>Landing, Products, Demos<br/>18 tasks"]
        PO["PO/SM (You)<br/>Reviews, Approves, Unblocks<br/>26 checklist items"]
    end

    subgraph CHANNELS["Communication Channels (Files)"]
        SC["SHARED_CHANGELOG.md<br/>What changed + handoff status"]
        SU["SprintTrackerDashboard.tsx<br/>Standups + task status"]
        DD["data-dependencies.ts<br/>Handoffs + dependency chains"]
        CSV["PROJECT_PLAN.csv<br/>Task assignments + status"]
    end

    CL -->|writes| SC
    CL -->|writes| SU
    CL -->|writes| DD
    LV -->|reads| SC
    LV -->|reads| SU
    LV -->|reads| DD
    PO -->|reads| SC
    PO -->|reads| SU
```

---

## 2. Daily Cycle — How One Day Flows

```mermaid
sequenceDiagram
    participant PO as PO/SM (You)
    participant CL as Claude (Tech Lead)
    participant FILES as Shared Files
    participant LV as Lovable (Developer)

    Note over PO,LV: === MORNING ===

    PO->>CL: Opens session, says "start Day N"
    activate CL

    Note over CL: Morning Routine (7 steps)
    CL->>FILES: Read SHARED_CHANGELOG.md
    CL->>FILES: Read data-dependencies.ts
    CL->>FILES: Read Lovable's standup
    CL->>FILES: Read PROJECT_PLAN.csv
    CL->>FILES: Check shared resources
    CL->>CL: npm run build
    CL->>CL: git fetch + sync

    CL->>PO: Morning Report:<br/>Completed / Backlog / Today's Tasks /<br/>Handoffs / Build Status

    Note over PO,LV: === CLAUDE WORKS ===

    PO->>CL: "Go ahead, start tasks"
    loop For each task
        CL->>CL: Work on C-NNN task
        CL->>FILES: Update changelog (immediately)
        CL->>FILES: Mark handoff 'ready' (if producer)
    end

    Note over CL: EOD Routine
    CL->>FILES: Update SHARED_CHANGELOG.md
    CL->>FILES: Add standup entry
    CL->>FILES: Update CSV status
    CL->>CL: npm run build
    CL->>CL: git commit + push
    CL->>PO: EOD Report: Done / Blocked / Handoffs Ready

    deactivate CL

    Note over PO,LV: === PO REVIEWS ===

    PO->>FILES: Check Sprint Tracker dashboard
    PO->>PO: Review PO Gate checklist
    PO->>PO: Verify handoffs are ready

    Note over PO,LV: === LOVABLE SESSION ===

    PO->>LV: "Go ahead, start your tasks"
    activate LV

    Note over LV: Morning Routine (5 steps)
    LV->>FILES: Read SHARED_CHANGELOG.md
    LV->>FILES: CHECK STAGE GATES
    LV->>FILES: Read Claude's standup
    LV->>FILES: Read PROJECT_PLAN.csv
    LV->>LV: npm run build + git sync

    alt Handoff is 'ready'
        LV->>LV: Start task (gate open)
    else Handoff is 'pending'
        LV->>LV: Skip task, work on unblocked items
        LV->>FILES: Log blocker in standup
    end

    loop For each task
        LV->>LV: Work on L-NNN task
        LV->>FILES: Update changelog (if shared)
    end

    Note over LV: EOD Routine
    LV->>FILES: Update changelog
    LV->>FILES: Add standup entry
    LV->>LV: git commit + push

    deactivate LV

    Note over PO,LV: === NEXT DAY ===
    PO->>CL: Opens new session → cycle repeats
```

---

## 3. Stage Gate Protocol — Decision Tree

```mermaid
flowchart TD
    START["Lovable wants to start Task L-NNN"] --> CHECK{"Does task have<br/>a handoff dependency?"}

    CHECK -->|No dependency| GO["START TASK"]
    CHECK -->|Yes, needs handoff| READ["Read SHARED_CHANGELOG.md<br/>→ Handoff Quick Reference table"]

    READ --> STATUS{"Handoff status?"}

    STATUS -->|"Ready"| VERIFY["Verify artifact works<br/>(test route, check tagline, etc.)"]
    VERIFY --> GO

    STATUS -->|"Pending"| BLOCKED["TASK IS BLOCKED"]
    BLOCKED --> ALT["Work on other<br/>unblocked tasks instead"]
    ALT --> LOG["Log blocker in standup:<br/>'Blocked by H-NNN'"]

    STATUS -->|"Bidirectional"| SYNC["Both devs must align<br/>PO/SM coordinates"]
    SYNC --> AGREE{"Agreement<br/>reached?"}
    AGREE -->|Yes| GO
    AGREE -->|No| ESCALATE["PO/SM decides"]
    ESCALATE --> GO

    GO --> COMPLETE["Task completed"]
    COMPLETE --> PRODUCE{"Does this task<br/>produce a handoff<br/>for Claude?"}
    PRODUCE -->|Yes| UPDATE["Update SHARED_CHANGELOG<br/>+ standup: 'Ready for Claude'"]
    PRODUCE -->|No| DONE["Done"]
    UPDATE --> DONE

    style BLOCKED fill:#ff6b6b,color:#fff
    style GO fill:#51cf66,color:#fff
    style ESCALATE fill:#ffd43b,color:#333
```

---

## 4. Handoff Timeline — Day-by-Day

```mermaid
gantt
    title Sprint Handoff Timeline
    dateFormat  YYYY-MM-DD
    axisFormat  %a %d

    section Claude Tasks
    C-101 Diagnose Spark          :done,    c101, 2026-02-17, 1d
    C-102 Diagnose Mind           :done,    c102, 2026-02-17, 1d
    C-103 Diagnose Deck           :done,    c103, 2026-02-17, 1d
    C-104 Document all issues     :done,    c104, 2026-02-17, 1d
    C-201 Fix Deck wizard         :active,  c201, 2026-02-18, 1d
    C-202 Fix Deck sub-components :         c202, 2026-02-18, 1d
    C-203 Verify Deck E2E         :         c203, 2026-02-18, 1d
    C-301 Fix Spark pipeline      :         c301, 2026-02-19, 1d
    C-302 Fix Spark wizard        :         c302, 2026-02-19, 1d
    C-304 Verify Spark E2E        :         c304, 2026-02-19, 1d
    C-401 Fix Mind editor         :         c401, 2026-02-20, 1d
    C-404 Verify Spark→Mind       :         c404, 2026-02-20, 1d
    C-501 Final verification      :         c501, 2026-02-21, 1d
    C-504 Merge to main FIRST     :crit,    c504, 2026-02-21, 1d

    section Handoffs (Claude → Lovable)
    H-101 Route fix               :done,    h101, 2026-02-17, 1d
    H-102 Taglines fixed          :done,    h102, 2026-02-17, 1d
    H-103 Support email           :done,    h103, 2026-02-17, 1d
    H-201 Deck flow ready         :crit,    h201, 2026-02-18, 1d
    H-301 Spark flow ready        :crit,    h301, 2026-02-19, 1d
    H-401 Mind flow ready         :crit,    h401, 2026-02-20, 1d
    H-501 Claude merges first     :crit,    h501, 2026-02-21, 1d

    section Lovable Tasks
    L-101 Audit landing           :         l101, 2026-02-17, 1d
    L-102 Audit explore           :         l102, 2026-02-17, 1d
    L-201 Product catalog         :         l201, 2026-02-18, 1d
    L-202 Pricing section         :         l202, 2026-02-18, 1d
    L-301 Interactive demos       :         l301, 2026-02-19, 1d
    L-401 Mobile responsive       :         l401, 2026-02-20, 1d
    L-504 Rebase + merge AFTER    :crit,    l504, 2026-02-21, 1d

    section Handoffs (Lovable → Claude)
    H-202 Product catalog data    :         h202, 2026-02-18, 1d
    H-302 Demo output format      :         h302, 2026-02-19, 1d
    H-402 Mobile breakpoints      :         h402, 2026-02-20, 1d
    H-502 Navigation verified     :         h502, 2026-02-21, 1d
```

---

## 5. File-Based Communication Architecture

```mermaid
flowchart LR
    subgraph CLAUDE["Claude (Tech Lead)"]
        CW["Writes"]
        CR["Reads"]
    end

    subgraph FILES["Shared Files (Git Repo)"]
        SC["SHARED_CHANGELOG.md<br/>━━━━━━━━━━━━━━━━<br/>• Change entries<br/>• Handoff quick reference<br/>• Stage gate rules<br/>• Shared resources index"]
        DD["data-dependencies.ts<br/>━━━━━━━━━━━━━━━━<br/>• 12 Handoffs (status)<br/>• Dependency chains<br/>• PO checklists (26 items)"]
        ST["SprintTrackerDashboard<br/>━━━━━━━━━━━━━━━━<br/>• Standup entries<br/>• Task status overrides"]
        CV["PROJECT_PLAN.csv<br/>━━━━━━━━━━━━━━━━<br/>• 41 tasks<br/>• Status + effort<br/>• Dependencies<br/>• Findings"]
    end

    subgraph LOVABLE["Lovable (Developer)"]
        LW["Writes"]
        LR["Reads"]
    end

    subgraph POSM["PO/SM (You)"]
        PR["Reviews via<br/>Sprint Tracker UI<br/>/genie-admin?tab=sprint-tracker"]
    end

    CW -->|handoff status, standup, changelog| SC
    CW -->|handoff ready/pending| DD
    CW -->|standup entry| ST
    CW -->|task COMPLETED| CV

    LR -->|check stage gates| SC
    LR -->|check dependencies| DD
    LR -->|read Claude's standup| ST
    LR -->|check today's tasks| CV

    LW -->|changelog entries| SC
    LW -->|standup entry| ST
    LW -->|task COMPLETED| CV

    CR -->|check Lovable's changes| SC
    CR -->|read Lovable's standup| ST

    PR -->|dashboard view| DD
    PR -->|PO Gate tab| DD
    PR -->|standups tab| ST
```

---

## 6. PO/SM Role — Your Review Workflow

```mermaid
flowchart TD
    START["Session starts"] --> READ["Read Sprint Tracker<br/>/genie-admin?tab=sprint-tracker"]

    READ --> TABS{"Check each tab"}

    TABS --> T1["Overview Tab<br/>Progress metrics,<br/>tasks by status"]
    TABS --> T2["Handoffs Tab<br/>12 handoffs,<br/>ready vs pending"]
    TABS --> T3["PO Gate Tab<br/>26 daily checklist items:<br/>verify / approve / decide / unblock"]
    TABS --> T4["Standups Tab<br/>Claude + Lovable entries"]

    T1 --> REVIEW["Review completed work"]
    T2 --> GATES{"Any handoffs<br/>newly 'ready'?"}
    T3 --> CHECKLIST["Work through today's<br/>PO checklist items"]
    T4 --> BLOCKERS{"Any blockers<br/>reported?"}

    GATES -->|Yes| SIGNAL["Tell Lovable:<br/>'Gate is open, proceed'"]
    GATES -->|No| WAIT["Check if Claude<br/>needs to finish first"]

    BLOCKERS -->|Yes| RESOLVE["Coordinate between<br/>Claude and Lovable"]
    BLOCKERS -->|No| PROCEED["All clear"]

    SIGNAL --> DONE["Day proceeds"]
    WAIT --> DONE
    RESOLVE --> DONE
    PROCEED --> DONE

    CHECKLIST --> VERIFY["Verify: test routes,<br/>check builds"]
    CHECKLIST --> APPROVE["Approve: pricing tiers,<br/>merge order, CTA links"]
    CHECKLIST --> DECIDE["Decide: must-fix vs<br/>nice-to-have, AI quality"]
    CHECKLIST --> UNBLOCK["Unblock: acknowledge<br/>handoffs, clear blockers"]
```

---

## 7. Day 5 Merge Order — Critical Path

```mermaid
flowchart TD
    START["Day 5 Start"] --> CV["C-501: Claude verifies<br/>all 3 CREATE routes"]
    START --> LV["L-501: Lovable verifies<br/>all landing routes"]

    CV --> CN["C-502: Verify QuadrantNav"]
    CN --> CP["C-503: Verify full pipeline<br/>Spark → Mind → Deck"]

    LV --> LN["L-502: Verify landing<br/>→ auth → studio nav"]

    CP --> CB["C-504: Claude runs<br/>npm run build"]
    CB --> CBUILD{"Build<br/>passes?"}
    CBUILD -->|Yes| CMERGE["Claude merges to main FIRST<br/>(H-501)"]
    CBUILD -->|No| CFIX["Fix and rebuild"]
    CFIX --> CB

    CMERGE --> POSM["PO/SM approves<br/>(PO-504)"]

    POSM --> LREBASE["L-504: Lovable rebases<br/>onto updated main"]
    LN --> LWAIT["Lovable WAITS for<br/>Claude merge"]
    LWAIT --> LREBASE

    LREBASE --> LBUILD{"Build<br/>passes?"}
    LBUILD -->|Yes| LMERGE["Lovable merges to main"]
    LBUILD -->|No| LFIX["Fix conflicts and rebuild"]
    LFIX --> LBUILD

    LMERGE --> POSM2["PO/SM approves<br/>(PO-505)"]

    POSM2 --> FINAL["S-501: Final build on main<br/>Both branches merged"]
    FINAL --> FBUILD{"Build<br/>passes?"}
    FBUILD -->|Yes| SHIP["SHIP IT"]
    FBUILD -->|No| HOTFIX["Hotfix needed"]

    style CMERGE fill:#4dabf7,color:#fff
    style LMERGE fill:#9775fa,color:#fff
    style SHIP fill:#51cf66,color:#fff
    style LWAIT fill:#ffd43b,color:#333
```

---

## Summary — The Simple Version

```
┌─────────────────────────────────────────────────────────┐
│                    DAILY CYCLE                          │
│                                                         │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐          │
│  │  CLAUDE   │───>│  PO/SM   │───>│ LOVABLE  │          │
│  │  works    │    │ reviews  │    │  works   │          │
│  │  pushes   │    │ approves │    │  pushes  │          │
│  └──────────┘    └──────────┘    └──────────┘          │
│       │                               │                 │
│       └───────── SHARED FILES ────────┘                 │
│         changelog, standups, handoffs, csv              │
│                                                         │
│  Signal: Handoff status changes from                    │
│          'pending' → 'ready' in files                   │
│                                                         │
│  Trigger: PO/SM says "go ahead" to each developer      │
│                                                         │
│  Gate: Lovable CANNOT start blocked tasks               │
│        until handoff shows 'ready'                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```
