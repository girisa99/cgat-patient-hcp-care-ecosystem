# Genie Hub & Production Hub: Module Architecture

> **Version:** 3.0  
> **Last Updated:** 2026-02-10  
> **Hub Tagline:** "Your Creative Command Center"  
> **Status:** ✅ P0-P2 Complete | Comprehensive Feature Set

---

## Overview

**Genie Hub** (formerly Genie Arc) is the creative command center for building custom AI workflows and orchestrating team productions.

---

## P0-P2 Implementation Status ✅ COMPLETE

### Genie Hub

| Feature | Status | Details |
|---------|--------|---------|
| Agent Builder | ✅ Complete | Visual agent creation |
| Workflow Designer | ✅ Complete | Node-based workflows |
| Deploy Manager | ✅ Complete | Test & deploy agents |
| MCP Integration | 🔶 Partial | Basic tool connectivity |
| **Show Scheduling** | ✅ Complete | Sync with Production Hub |
| **Calendar Integration** | ✅ Complete | Google/Outlook/Yahoo/iCal |

### Production Hub

| Feature | Status | Details |
|---------|--------|---------|
| Session Management | ✅ Complete | Schedule & invite |
| Kanban Board | ✅ Complete | Task tracking |
| Approval Workflow | ✅ Complete | Review chains |
| Real-time Collaboration | ✅ Complete | Bidirectional feedback |
| **Guided Wizard** | ✅ Complete | 7-phase production wizard |
| WebinarHighlightExtractor | ✅ Complete | Extract highlights from recordings |

---

## NEW: Features Implemented Beyond Original Roadmap

These features were implemented during P0-P2 development but were not part of the original 177 scenario roadmap:

### 1. Production Calendar System ✅

**Location:** `src/components/production/ProductionCalendar.tsx`

| Feature | Description | Status |
|---------|-------------|--------|
| **Week/Month Views** | Toggle between calendar views | ✅ |
| **Day Click Scheduling** | Click any day to schedule new show | ✅ |
| **Time Slot Selection** | 30-min intervals from 8AM-8PM | ✅ |
| **Color-Coded Legend** | Visual indicators by show type | ✅ |
| **Business Hours** | Highlight business vs non-business hours | ✅ |
| **Multi-Category Support** | Media, Meetings, Events | ✅ |

### 2. Show Type & Category System ✅

**Location:** `src/types/shows.ts`

| Category | Show Types | Stage Pipeline |
|----------|------------|----------------|
| **Media Production** | Podcast, Webcast, Interview, Panel, Tutorial, Broadcast | Outreach → Script → Rehearsal → Recording → Post-Production → Published |
| **Business Meeting** | Discovery Call, Sales Meeting, Project Kickoff, Status Update, Consultation | Scheduled → Confirmed → Agenda Prep → In Progress → Follow Up → Completed |
| **Event** | Workshop, Webinar, Conference, Training Session | Planning → Promotion → Registration → Live → Wrap Up → Archived |

### 3. Calendar Integration Utilities ✅

**Location:** `src/utils/calendarUtils.ts`

| Feature | Description | Status |
|---------|-------------|--------|
| **Google Calendar** | Generate Google Calendar URLs | ✅ |
| **Outlook Calendar** | Generate Outlook Web URLs | ✅ |
| **Yahoo Calendar** | Generate Yahoo Calendar URLs | ✅ |
| **ICS Download** | Generate .ics files for all clients | ✅ |
| **Rich Descriptions** | Meeting URL, topics, host/guests in invite | ✅ |
| **Multiple Reminders** | 24hr, 1hr, 30min, 15min alerts | ✅ |
| **Genie Branding** | Branded meeting invites | ✅ |

### 4. Meeting URL Generator ✅

**Location:** `src/utils/meetingUrlGenerator.ts`

| Feature | Description | Status |
|---------|-------------|--------|
| **Auto-Generate URLs** | Creates Genie Vibe studio URLs | ✅ |
| **Platform Support** | Google Meet, Zoom, Teams, Custom | ✅ |
| **Meeting Codes** | Unique UUID-based codes | ✅ |
| **Activation Timing** | Links active 30min before scheduled | ✅ |
| **Device Detection** | Routes to appropriate Vibe mode | ✅ |

### 5. Timezone Support ✅

**Location:** `src/utils/timezoneUtils.ts`

| Feature | Description | Status |
|---------|-------------|--------|
| **15 Common Timezones** | US, EU, Asia, Australia coverage | ✅ |
| **Local Timezone Detection** | Auto-detect user's timezone | ✅ |
| **Timezone Conversion** | Convert between any timezones | ✅ |
| **Multi-Timezone Display** | Show time in multiple zones | ✅ |
| **AM/PM Formatting** | User-friendly time display | ✅ |

### 6. Unified Schedule Dialog ✅

**Location:** `src/components/production/UnifiedScheduleShowDialog.tsx`

| Feature | Description | Status |
|---------|-------------|--------|
| **Step-by-Step Wizard** | Guided scheduling flow | ✅ |
| **Category Selection** | Media/Meeting/Event tabs | ✅ |
| **Stage Selection** | Category-appropriate stages | ✅ |
| **Host & Guest Management** | Add participants with roles | ✅ |
| **Email/SMS Invites** | Send calendar invites | ✅ |
| **Script Attachment** | Attach scripts to sessions | ✅ |
| **Reminder Configuration** | Multiple reminder options | ✅ |
| **Meeting Platform Selection** | Choose video platform | ✅ |
| **Timezone Selection** | Schedule in any timezone | ✅ |

### 7. Vertical Kanban Board ✅

**Location:** `src/components/production/VerticalKanban.tsx`

| Feature | Description | Status |
|---------|-------------|--------|
| **Swimlane Layout** | Horizontal stage rows | ✅ |
| **Drag & Drop** | Move cards between stages | ✅ |
| **Category Filtering** | Filter by Media/Meeting/Event | ✅ |
| **Stage-Specific Columns** | Dynamic based on category | ✅ |
| **Show Cards** | Rich card display with metadata | ✅ |
| **Quick Actions** | Edit, delete, move actions | ✅ |

### 8. Hub ↔ Production Sync ✅

| Feature | Description | Status |
|---------|-------------|--------|
| **Shared Shows Data** | Same `useShows` hook | ✅ |
| **Unified Scheduling** | Same `UnifiedScheduleShowDialog` | ✅ |
| **Real-time Updates** | Supabase realtime subscriptions | ✅ |
| **Stage Sync** | Stage changes reflect in both | ✅ |
| **Participant Sync** | Participants visible in both | ✅ |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                          GENIE HUB & PRODUCTION HUB                                           │
│                              ✅ P0-P2 COMPLETE                                                │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

                    ┌────────────────────────────────────────────────────┐
                    │                   GENIE HUB                         │
                    │          "Your Creative Command Center"             │
                    ├────────────────────────────────────────────────────┤
                    │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │
                    │  │ Agent Builder│  │  Workflow    │  │ Deploy   │  │
                    │  │      ✅      │  │  Designer ✅ │  │Manager ✅│  │
                    │  │ • Templates  │  │ • Visual     │  │ • Test   │  │
                    │  │ • Custom AI  │  │ • Node-based │  │ • Deploy │  │
                    │  │ • MCP Tools  │  │ • Triggers   │  │ • Monitor│  │
                    │  └──────────────┘  └──────────────┘  └──────────┘  │
                    │                                                     │
                    │  ┌──────────────────────────────────────────────┐  │
                    │  │         SCHEDULE & CALENDAR SYNC ✅           │  │
                    │  │  • Show scheduling  • Calendar integration    │  │
                    │  │  • Meeting URLs     • Timezone support        │  │
                    │  └──────────────────────────────────────────────┘  │
                    └────────────────────────────┬───────────────────────┘
                                                 │
                                    ┌────────────┴────────────┐
                                    │   SHARED DATA LAYER    │
                                    │   (useShows hook)      │
                                    │   • Real-time sync     │
                                    │   • Stage management   │
                                    │   • Participant sync   │
                                    └────────────┬────────────┘
                                                 │
                                                 ▼
                    ┌────────────────────────────────────────────────────┐
                    │                PRODUCTION HUB                       │
                    │             "Orchestrate Excellence"                │
                    ├────────────────────────────────────────────────────┤
                    │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │
                    │  │ Kanban Board │  │  Session     │  │ Approval │  │
                    │  │      ✅      │  │ Management ✅│  │Workflow ✅│  │
                    │  │ • Tasks      │  │ • Schedule   │  │ • Review │  │
                    │  │ • Status     │  │ • Invites    │  │ • Sign-off│ │
                    │  │ • Assign     │  │ • Reminders  │  │ • Audit  │  │
                    │  └──────────────┘  └──────────────┘  └──────────┘  │
                    │                                                     │
                    │  ┌──────────────────────────────────────────────┐  │
                    │  │          7-PHASE GUIDED WIZARD ✅             │  │
                    │  │  Plan → Setup → Schedule → Record → Review → │  │
                    │  │  Approve → Publish                            │  │
                    │  └──────────────────────────────────────────────┘  │
                    │                                                     │
                    │  ┌──────────────────────────────────────────────┐  │
                    │  │         PRODUCTION CALENDAR ✅                │  │
                    │  │  • Week/Month views  • Color-coded legend     │  │
                    │  │  • Day click schedule • Multi-category        │  │
                    │  └──────────────────────────────────────────────┘  │
                    │                                                     │
                    │  ┌──────────────────────────────────────────────┐  │
                    │  │           COLLABORATION SYSTEM ✅             │  │
                    │  │  • Real-time feedback  • Status sync          │  │
                    │  │  • Push notifications  • Review stages        │  │
                    │  └──────────────────────────────────────────────┘  │
                    └────────────────────────────────────────────────────┘
```

---

## Component & Utility Inventory

### Production Components

| Component | File | Purpose |
|-----------|------|---------|
| `ProductionCalendar` | `ProductionCalendar.tsx` | Visual calendar with scheduling |
| `VerticalKanban` | `VerticalKanban.tsx` | Swimlane Kanban board |
| `UnifiedScheduleShowDialog` | `UnifiedScheduleShowDialog.tsx` | Show scheduling wizard |
| `ScheduleManagementDialog` | `ScheduleManagementDialog.tsx` | Bulk schedule management |
| `ProductionStatusBadge` | `ProductionStatusBadge.tsx` | Status indicators |
| `ProductionGuidedWizard` | `ProductionGuidedWizard.tsx` | 7-phase guided experience |
| `WebinarHighlightExtractor` | `WebinarHighlightExtractor.tsx` | Extract highlights |
| `BRollIntegrator` | `BRollIntegrator.tsx` | B-roll integration |
| `MeetingUrlGenerator` | `MeetingUrlGenerator.tsx` | Meeting URL component |

### Utility Files

| Utility | File | Purpose |
|---------|------|---------|
| `calendarUtils` | `calendarUtils.ts` | Calendar URL generation |
| `meetingUrlGenerator` | `meetingUrlGenerator.ts` | Meeting URL logic |
| `timezoneUtils` | `timezoneUtils.ts` | Timezone handling |

### Types & Hooks

| Type/Hook | File | Purpose |
|-----------|------|---------|
| `shows.ts` | `src/types/shows.ts` | Show, Category, Stage types |
| `useShows` | `src/hooks/useShows.ts` | Shows CRUD operations |
| `useProductionContext` | `src/hooks/useProductionContext.ts` | Production context |

---

## Key Features

| Module | Feature | Description | Status |
|--------|---------|-------------|--------|
| **Hub** | Agent Builder | Visual agent creation | ✅ |
| **Hub** | Workflow Designer | Node-based workflows | ✅ |
| **Hub** | Deploy Manager | Test & deploy | ✅ |
| **Hub** | MCP Integration | Tool connectivity | 🔶 |
| **Hub** | Show Scheduling | Schedule from Hub | ✅ |
| **Hub** | Session Management | Schedule & invite | ✅ |
| **Hub** | Kanban Board | Task tracking | ✅ |
| **Hub** | Production Calendar | Visual calendar | ✅ |
| **Hub** | Approval Workflow | Review chains | ✅ |
| **Hub** | Guided Wizard | 7-phase production | ✅ |
| **Hub** | Real-time Collaboration | Bidirectional feedback | ✅ |
| **Hub** | Highlight Extractor | Webinar highlights | ✅ |
| **Shared** | Calendar Integration | Google/Outlook/Yahoo/iCal | ✅ |
| **Shared** | Meeting URLs | Auto-generate Genie URLs | ✅ |
| **Shared** | Timezone Support | 15 timezones, conversion | ✅ |
| **Shared** | Category System | Media/Meeting/Event | ✅ |
| **Shared** | Stage Pipelines | Category-specific stages | ✅ |
| **Shared** | Hub ↔ Production Sync | Real-time data sync | ✅ |

---

## Nice-to-Have Enhancements (P3 Candidates) - RE-VERIFIED ✅

Based on P3 planning re-verification (2026-01-13):

| Module | Enhancement | Component | Priority | Value Assessment | Recommendation |
|--------|-------------|-----------|----------|------------------|----------------|
| **Hub** | Audio mixing in agents | `AudioMixer` | **High** | ✅ **Valuable** - Audio workflow agents | **Implement P3** |
| **Hub** | Scene analysis in agents | `SceneAnalyzerPanel` | **High** | ✅ **Valuable** - Video QA automation | **Implement P3** |
| **Hub** | Voice coaching | `VoiceDirectorPanel` | Low | ❌ Low value - Hub is workflow-focused | Skip |
| **Hub** | Guided Experience | — | Not Recommended | ❌ No value - Power user tool | Skip |
| **Hub** | Recurring schedules | — | **High** | ✅ **Valuable** - Weekly/monthly shows | **Implement P3** |
| **Hub** | External calendar sync | — | **Medium** | ✅ **Valuable** - Two-way Google/Outlook | **Implement P3** |

See: `docs/P3_IMPLEMENTATION_PLAN.md` for full implementation details.

---

## Updated Scenario Count

| Source | Original Count | New Count | Notes |
|--------|----------------|-----------|-------|
| **Original P0-P5** | 177 | 177 | Original roadmap |
| **Calendar Features** | — | +15 | New calendar scenarios |
| **Meeting URL Features** | — | +8 | New meeting URL scenarios |
| **Timezone Features** | — | +5 | New timezone scenarios |
| **Category System** | — | +12 | New category scenarios |
| **Kanban Enhancements** | — | +6 | New Kanban scenarios |
| **Arc-Hub Sync** | — | +10 | New sync scenarios |
| **Guided Wizards** | — | +20 | New wizard scenarios |
| **Total** | 177 | **253** | **+76 new scenarios** |

---

## Related Scenarios (P0-P2) ✅ ALL COMPLETE

### Hub Scenarios

| # | Scenario | Status |
|---|----------|--------|
| 1 | Create new agent | ✅ |
| 2 | Design workflow | ✅ |
| 3 | Connect MCP tools | 🔶 |
| 4 | Test agent | ✅ |
| 5 | Deploy agent | ✅ |
| 6 | Schedule show from Hub | ✅ |
| 7 | Add calendar invite from Hub | ✅ |

### Hub Scenarios

| # | Scenario | Status |
|---|----------|--------|
| 1 | Create production session | ✅ |
| 2 | Invite participants | ✅ |
| 3 | Manage tasks (Kanban) | ✅ |
| 4 | Review & approve | ✅ |
| 5 | Guided production wizard | ✅ |
| 6 | Extract highlights | ✅ |
| 7 | Distribute content | ✅ |
| 8 | View production calendar | ✅ |
| 9 | Schedule from calendar | ✅ |
| 10 | Multi-category filtering | ✅ |

### Shared Scenarios (New)

| # | Scenario | Status |
|---|----------|--------|
| 1 | Generate meeting URL | ✅ |
| 2 | Add to Google Calendar | ✅ |
| 3 | Add to Outlook Calendar | ✅ |
| 4 | Download ICS file | ✅ |
| 5 | Set timezone for session | ✅ |
| 6 | View in multiple timezones | ✅ |
| 7 | Sync shows between Arc & Hub | ✅ |
| 8 | Drag cards in Kanban | ✅ |
| 9 | Filter by category | ✅ |
| 10 | View color-coded legend | ✅ |

---

*Part of Genie Suite Architecture Documentation*  
*P0-P2 Closeout: 2026-01-13*  
*Features Beyond Roadmap: Documented*