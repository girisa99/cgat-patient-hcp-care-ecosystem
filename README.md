# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/0e30badf-cab5-4682-9459-1076c06d2310

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/0e30badf-cab5-4682-9459-1076c06d2310) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/0e30badf-cab5-4682-9459-1076c06d2310) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Remote access via ngrok

To expose your local development server on the public internet (useful for mobile testing, webhooks, etc.) we include a small helper:

```bash
# 1. Install dependencies (if you haven't already)
npm install

# 2. Set your ngrok auth-token once (get it from https://dashboard.ngrok.com)
export NGROK_AUTHTOKEN="<YOUR_TOKEN>"

# 3. Start Vite *and* ngrok in two shells
# first shell – start the React dev server on :5173
npm run dev

# second shell – start the tunnel that points to :5173
npm run tunnel
```

`npm run tunnel` is just `ngrok http 5173` under the hood. It reads the token from the env variable via `ngrok.yml` (see the file at the repo root).

After a few seconds ngrok will print a **Forwarding** URL such as `https://abc123.ngrok.io`.  Open that URL from any device and you'll see your local app.

### Required environment variables

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Project URL from Supabase settings |
| `VITE_SUPABASE_ANON_KEY` | Public anon key from Supabase settings |
| `NGROK_AUTHTOKEN` | Personal token from the ngrok dashboard (only needed for tunnels) |

Other optional variables you might use in production (but are **not** required for local dev):

| Variable | Purpose |
|----------|---------|
| `VITE_NGROK_TUNNEL_URL` | If you need the tunnel URL inside your code for e.g. webhooks |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side Supabase key for scripts / migrations |

## Common commands

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start Vite + React on http://localhost:5173 |
| `npm run tunnel` | Create public tunnel to the dev server |
| `npm run build` | Production build (static in `dist/`) |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint with current rules |

## Database migrations (Supabase)

This repo ships with SQL files in `supabase/migrations/` – most importantly
`20250705180000-add-user-role-fk.sql` (adds the FK relationships that the UI
expects).

1. Install the CLI if you haven't already:
   ```bash
   npm i -g supabase
   ```
2. Get a **personal-access token** from your Supabase dashboard
   (Settings → Access Tokens) and export it:
   ```bash
   export SUPABASE_ACCESS_TOKEN="sbp_…"
   ```
3. Link the local folder to your project (one-time):
   ```bash
   npx supabase link --project-ref ithspbabhmdntioslfqe --yes
   ```
4. Push all pending migrations:
   ```bash
   npx supabase db push --include-all
   ```
5. In the dashboard restart the green "API" service so PostgREST reloads the
   new relationships.

## Running & testing through ngrok

```bash
npm run dev      # starts Vite on http://localhost:5173
npm run tunnel   # opens a public tunnel & prints the forwarding URL
```

Open that URL from any device and run through the smoke-test below.

| Page | What to test |
|------|---------------|
| **/users** | add user → assign roles/modules/facilities → edit → deactivate → bulk actions |
| **/facilities** | add facility → deactivate |
| **/modules** | add module – shows up in *Active* tab |
| **/api-services** | Add Service → Configure (toggle status / edit desc) → Delete |
| **/reports** | Generate each report, see it appear in *Recent Reports* |

Browser console and network tab should stay clean (all 2xx responses, no uncaught errors).

## Feature quick-reference

| Feature | Table | Hook / Helper |
|---------|-------|---------------|
| Roles per user | `user_roles` | `assignRole` / `removeRole` |
| Facilities per user | `user_facilities` | `assignFacility` / `removeFacility` |
| Modules per user | `user_module_assignments` | `assignModule` / `removeModule` |
| API services | `api_integration_registry` | `createApiService` |
| Reports | custom RPC `generate_report` | UI calls `supabase.functions.invoke` |

All helpers live in **`useMasterData`** (single source of truth).
