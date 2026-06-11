# Waqt Ki Awaz — News Portal PRD

## Problem Statement
Build a modern, responsive multilingual (EN/UR/KN) news portal with white & sky-blue minimal UI, breaking news ticker, featured hero bento, latest news grid, YouTube video section, trending sidebar, article pages with comments and prev/next nav, and a complete admin panel for managing news/categories/videos/users/settings.

## Architecture
- **Backend**: FastAPI + MongoDB (Motor), JWT cookies + Bearer
- **Frontend**: React 19 + React Router 7 + Tailwind + shadcn/ui
- **Auth**: JWT (httpOnly cookies, secure, sameSite=none), bcrypt
- **i18n**: 3 UI languages (English, Urdu RTL, Kannada) via LanguageContext
- **Theme**: light/dark via ThemeContext

## User Personas
- **Visitor**: read news, switch language, toggle theme, search, watch videos, comment
- **Reporter/Editor**: create/edit/publish articles, manage videos
- **Admin**: full CRUD on users, categories, settings + everything above

## Implemented (Feb 2026)
- Public site: home (hero bento + latest grid + trending sidebar + videos), article page (share, prev/next, related, comments), category page, search
- Sticky header with logo, search, EN/UR/KN switcher, dark mode toggle
- Sticky scrollable category nav with 20 default categories
- Breaking news ticker (react-fast-marquee)
- YouTube video section with player + playlist
- Admin: dashboard with stats, news CRUD (drafts/scheduled/published, featured/breaking flags), categories CRUD, videos CRUD, users CRUD, settings (site name, tagline, social)
- Seeded 12 sample articles, 3 videos, 20 categories, admin/editor/reporter accounts
- Comments stored in localStorage (no backend persistence yet)
- Footer with newsletter form (UI only)

## Test Credentials
See `/app/memory/test_credentials.md`

## P1 Backlog
- Persist comments to backend with moderation
- Real newsletter subscription via SendGrid/Resend
- Push notifications, Google Analytics/AdSense placeholders
- Image upload via Object Storage
- AI auto-translation between EN/UR/KN
- XML sitemap & robots.txt

## P2
- SEO metadata per article (OG tags, JSON-LD)
- Advanced search with filters
- User-facing registration & profiles
