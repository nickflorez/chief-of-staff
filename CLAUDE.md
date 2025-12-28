# Chief of Staff - AI Development Guide

## Critical Rules

1. **Do exactly what's asked** - nothing more, nothing less
2. **NEVER create files unless necessary** - prefer editing existing files
3. **NEVER create docs/READMEs** unless explicitly requested

---

## API Integration Checklist

**BEFORE implementing any API integration:**

1. **Fetch the official API documentation** using WebFetch or WebSearch
2. **Verify the exact response schema** - never assume types (array vs string, nullable fields, etc.)
3. **Check for edge cases** - null values, empty arrays, missing fields
4. **Test with a real API call** before finalizing code (use curl or similar)
5. **Handle multiple possible types defensively** when documentation is unclear

### Known API Gotchas

| API | Issue | Lesson |
|-----|-------|--------|
| Fireflies.ai | `action_items` returns string, not array | Always verify actual response vs assumed types |

---

## Project Structure

```
chief-of-staff/
├── src/
│   ├── app/           # Next.js App Router
│   │   ├── actions/   # Server actions
│   │   └── api/       # API routes
│   ├── components/    # React components
│   └── lib/
│       ├── ai/        # AI tools and handlers
│       │   └── tools/ # Tool definitions
│       ├── db/        # Database utilities
│       └── integrations/ # External API clients
└── .claude/
    ├── hooks/         # Claude Code hooks
    └── settings.json  # Hook configuration
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **AI**: Anthropic Claude API
- **Auth**: Supabase Auth
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
