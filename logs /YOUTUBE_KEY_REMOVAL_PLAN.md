# Plan: Remove Exposed YouTube API Key & Secure YouTube Integration

This document lists the prioritized changes you should make to remove the exposed YouTube API key from the repo and client bundle, secure credentials, and implement better patterns (backend proxy and/or OAuth) for private data access.

> Assumption: current repo contains committed `.env` files (backend/.env and frontend/.env) with `YOUTUBE_API_KEY` and `VITE_YOUTUBE_API_KEY`. The frontend currently calls YouTube Data API directly using a Vite environment variable.

---

## Goals

- Remove committed API keys from the repository and stop exposing them in the client bundle.
- Rotate/revoke exposed keys and create new, properly restricted keys.
- Ensure private user data (watch history, private playlists) is accessed only via OAuth with per-user tokens.
- Provide a short-term safe fix (backend proxy) so frontend no longer exposes the API key.

---

## Priority 0 — Immediate actions (do these first)

1. Rotate / revoke exposed API keys in Google Cloud Console
   - Revoke the keys present in the committed `.env` files immediately.
   - Create new API key(s) for public-only usage if needed and restrict them (HTTP referrers, API restrictions).
   - Note: You must perform this in the Google Cloud Console. The repo changes below should happen after rotation.

2. Remove committed `.env` files from tracking (stop exposing secrets)
   - Remove from git index and commit the removal.

   ```bash
   git rm --cached backend/.env frontend/.env
   git commit -m "Remove committed env files containing API keys"
   git push origin main
   ```

   - This removes the files from the repository head, but not from history. See *Purge history* below if you want to remove the keys from history.

3. Remove console logs or debug statements that print API keys
   - File to update: `frontend/src/components/YouTubeImportModal.tsx`
   - Remove or change any `console.log("YouTube API Key:", import.meta.env.VITE_YOUTUBE_API_KEY)` lines.

4. Replace client-side direct YouTube calls with a backend proxy (recommended short-term):
   - Create a backend controller endpoint (e.g., `YouTubeProxyController#search` and `YouTubeProxyController#playlist`) to accept client requests (authenticated via JWT) and make YouTube Data API calls server-side using a server-side env var (not VITE_).
   - Example endpoints:
     - `GET /api/youtube/search?q=...`
     - `GET /api/youtube/playlists?playlistId=...`
   - Store the new server API key in Render environment variables (e.g., `YOUTUBE_API_KEY`) and **do not** expose it to the client.

---

## Priority 1 — Repo hygiene & history (after immediate actions)

1. Purge keys from git history (optional but recommended if keys were real):
   - Use `git filter-repo` or BFG to remove `.env` and keys from the repo history.
   - BFG example (you'll need to install BFG; this rewrites history and requires force-push):

   ```bash
   # Example with BFG (follow BFG docs for exact steps)
   bfg --delete-files .env
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   git push --force
   ```

   - Coordinate with collaborators before rewriting history (force push).

2. Add `.env*` to `.gitignore` (if not already) and ensure no secrets present in other files.
   - Files: `backend/.gitignore`, `frontend/.gitignore` (or repo-level `.gitignore`)

3. Add a short CONTRIBUTING / SECURITY note in the repo README about storing secrets in environment variables only.

---

## Priority 2 — Secure server-side usage & deploy

1. Move public YouTube Data API calls to backend proxy
   - Implement server endpoints that call YouTube Data API using `ENV['YOUTUBE_API_KEY']` stored in Render secrets.
   - The backend should validate JWT (current authentication) to protect endpoints from abuse.
   - Add server-side caching for popular queries (Redis or Rails.cache) to reduce quota use.

2. Configure Render environment variables
   - Add the new `YOUTUBE_API_KEY`, `GOOGLE_CLIENT_ID`, and `GOOGLE_CLIENT_SECRET` to Render Environment (secrets) — not as VITE_* for the frontend.
   - Build the frontend without injecting any VITE_ secret that you want to keep private.

3. Add server-side rate limiting
   - Use Rack::Attack or similar to throttle requests to your YouTube proxy endpoints.
   - Example rule: 60 requests per user per minute (tune as needed).

4. Restrict the API key in Google Cloud Console
   - Restrict by API (YouTube Data API) and by HTTP referrers/IPs (use your domain and Render build IPs where possible).

---

## Priority 3 — OAuth for private data (medium-term)

1. Implement Google OAuth 2.0 for per-user private data access
   - The repo already contains `OAUTH_IMPLEMENTATION_GUIDE.md` and some code references — follow and complete that flow.
   - Store `yt_access_token`, `yt_refresh_token`, and `token_expiry` in the `users` table (encrypted if possible).
   - Use `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` in server env vars and redirect URIs configured for Render deployments.

2. Use OAuth tokens for private endpoints
   - `YoutubeService` should use per-user tokens (refresh when expired) to access watch history, private playlists, etc.
   - Keep all token exchange/refreshing server-side.

3. Update consent screen and scope
   - Request minimal scopes needed (`youtube.readonly` for reading watch history; add write scopes only if required).

---

## Files to edit (suggested minimal changes)

- Remove or edit these files:
  - `frontend/.env` — remove (delete) or replace with example `.env.example` that does not contain real keys
  - `backend/.env` — remove (delete) or replace with `.env.example`
  - `frontend/src/components/YouTubeImportModal.tsx` — remove console.log that prints the key
  - `frontend/src/lib/youtube-api.ts` — stop using `VITE_YOUTUBE_API_KEY` for requests that should go to server-side; instead call backend endpoints

- Add files:
  - `app/controllers/youtube_proxy_controller.rb` (Rails) — new controller with proxied endpoints
  - `frontend/src/lib/youtube-proxy.ts` — client wrapper that calls the backend proxy endpoints
  - `YOUTUBE_KEY_REMOVAL_PLAN.md` — this file (created)

---

## Example small-code plan (server proxy sketch)

- New route in `backend/config/routes.rb`:

```ruby
namespace :api do
  get 'youtube/search', to: 'youtube_proxy#search'
  get 'youtube/playlists', to: 'youtube_proxy#playlists'
end
```

- Controller `app/controllers/api/youtube_proxy_controller.rb` will:
  - Require authentication (JWT) via existing `ApiController` or `Api::BaseController`.
  - Read `ENV['YOUTUBE_API_KEY']` on the server.
  - Call the YouTube Data API and return results.

- Frontend: update the components to call `/api/youtube/search` rather than calling Google directly.

---

## Verification & tests

- After changes, run the following checks locally and on Render:
  1. Build the frontend and inspect the built bundle to confirm `VITE_YOUTUBE_API_KEY` is NOT present.
  2. Start the backend and call the new proxy endpoints (with a valid JWT) to confirm proxy returns expected results.
  3. Confirm no `.env` files or key values remain in the repository using a repo-wide search:

```bash
git grep -n "AIza" || true
git grep -n "YOUTUBE_API_KEY" || true
```

- Check Google Cloud Console logs & quota after rotating keys to ensure expected usage.

---

## Follow-ups (optional improvements)

- Implement token encryption at rest for `yt_refresh_token` (Rails encrypted attributes or Lockbox).
- Add usage telemetry and quota alerts (send email to admin when usage > threshold).
- Add a small admin page that shows API request counts and current quota usage.

---

## Notes / References

- See `OAUTH_IMPLEMENTATION_GUIDE.md` for OAuth steps already present in repo.
- The repo currently uses `dotenv` in backend; ensure that in production you rely on Render env vars and not committed `.env` files.

---

If you want, I can now:
- (A) Remove the `console.log` in `frontend/src/components/YouTubeImportModal.tsx` and update `frontend/src/lib/youtube-api.ts` to call the backend proxy (I can make edits and run quick searches), or
- (B) Create the backend proxy skeleton and wire one frontend call to it.