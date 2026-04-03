**Dundee Elim Church Website**

**About**

This is a standalone Vite site for Dundee Elim Church with a Supabase-backed admin panel, draft/publish workflow, media uploads, and form submissions inbox.

**Local development**

1. Clone the repository
2. Navigate to the project directory
3. Install dependencies with `npm install`
4. Copy `.env.example` to `.env.local`
5. Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
6. Start the dev server with `npm run dev`

Build for production with `npm run build`.

**Supabase setup**

Run the SQL in `supabase/migrations/20260403_standalone_admin.sql` in your Supabase project.

This creates:
- `site_content_versions`
- `contact_submissions`
- `prayer_submissions`
- the public `site-media` storage bucket
- row-level security policies for public reads/inserts and authenticated admin writes

Create one shared admin user in Supabase Auth, then sign in at `/admin/login`.

The first authenticated admin visit seeds the draft and published content from `src/content/defaultSiteContent.js` if the content table is empty.

**Content model**

The public website now reads a single typed content document from Supabase.

- Schema: `src/content/siteContentSchema.js`
- Local seed content: `src/content/defaultSiteContent.js`
- Public content provider: `src/contexts/SiteContentContext.jsx`
- Supabase API layer: `src/lib/siteContentApi.js`

Public fallback content is bundled so the site still renders if Supabase is unavailable, but the admin workflow requires Supabase.

**Admin**

`/admin` includes:
- shared email/password login via Supabase Auth
- draft save and publish actions
- editable text and repeatable content arrays
- image upload/replace support via Supabase Storage
- submissions inbox for contact and prayer forms

The public contact and prayer forms insert into Supabase when configured. If Supabase env vars are missing, they fall back to opening a prefilled email draft for local preview only.

**Deployment**

This project is a standard Vite React app and can be deployed to static hosting with SPA fallback support. A Netlify-style `_redirects` file is included in `public/_redirects`.
