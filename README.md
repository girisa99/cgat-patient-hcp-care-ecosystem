# CGAT Patient HCP Care Ecosystem

> Multi-product platform with Genie Studio, Healthcare, and Document Processing

## Project Structure

```
├── src/
│   ├── genie-studio/      # 🎬 AI Media Production Suite (Commercial Launch)
│   ├── document-processing/ # 📄 Document AI & OCR Processing
│   ├── healthcare/         # 🏥 Patient Enrollment & Treatment Centers
│   ├── shared/             # 🔧 Cross-Product Infrastructure
│   ├── components/         # Shared UI Components
│   ├── hooks/              # Shared Hooks
│   ├── services/           # Shared Services
│   └── integrations/       # Supabase & External Integrations
├── supabase/
│   ├── functions/          # Edge Functions
│   └── migrations/         # Database Migrations
├── docs/                   # Documentation
├── public/                 # Static Assets
└── tests/                  # E2E Tests
```

## Products

| Product | Description | Status |
|---------|-------------|--------|
| **Genie Studio** | AI-powered media production suite | 🚀 Commercial Launch |
| **Document Processing** | Intelligent document extraction & OCR | ✅ Active |
| **Healthcare** | Patient enrollment & treatment management | ✅ Internal |

## Shared Infrastructure

All products share:
- **Authentication** - `useMasterAuth` hook
- **API Secrets** - Centralized in `src/shared/config/secret-keys.ts`
- **Agent System** - Universal agent infrastructure
- **Database** - Supabase with RLS policies
- **Multi-Tenant Ready** - User-scoped, workspace support planned

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Documentation

| Document | Purpose |
|----------|---------|
| [Genie Studio README](src/genie-studio/README.md) | Genie Studio architecture |
| [Healthcare README](src/healthcare/README.md) | Healthcare system guide |
| [Document Processing README](src/document-processing/README.md) | Document AI guide |
| [Product Config](src/shared/config/product-config.ts) | Product boundaries |

## Technologies

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Edge Functions, Auth)
- **AI**: OpenAI, Claude, Gemini, ElevenLabs
- **Mobile**: Capacitor

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase public key |

## Development

**Edit via Lovable**: [Open Project](https://lovable.dev/projects/0e30badf-cab5-4682-9459-1076c06d2310)

**Deploy**: Open Lovable → Share → Publish

**Custom Domain**: Project → Settings → Domains → Connect Domain

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
