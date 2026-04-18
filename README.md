# Lowell Is Queer

A community events calendar celebrating LGBTQIA+ life, community, and culture in and around Lowell, Massachusetts.

## Features

- **Event calendar** powered by Google Calendar API with fuzzy search and pagination
- **Featured events** via `#featured` tag in event descriptions
- **Event images** via `#image:` Google Drive links in event descriptions
- **Dark mode** with system default, manual toggle, and `D` keyboard shortcut
- **Responsive design** optimized for mobile through desktop

## Tech stack

- [Next.js](https://nextjs.org) (App Router)
- [Tailwind CSS](https://tailwindcss.com) v4
- [fuzzysort](https://github.com/farzher/fuzzysort) for client-side search
- [next-themes](https://github.com/pacocoursey/next-themes) for dark mode
- [next-mdx-remote](https://github.com/hashicorp/next-mdx-remote) for content

## Getting started

```bash
pnpm install
cp .env.example .env  # fill in your Google Calendar credentials
pnpm dev
```

## Environment variables

| Variable | Description |
|---|---|
| `GOOGLE_CALENDAR_API_KEY` | Google Calendar API key |
| `GOOGLE_CALENDAR_ID` | Calendar ID |
| `NEXT_PUBLIC_GOOGLE_CALENDAR_ID` | Public calendar ID (for embed/subscribe links) |
| `NEXT_PUBLIC_EVENT_FORM_URL` | Event submission form URL (optional) |

## Managing events

Events are managed through Google Calendar. Special tags in event descriptions:

- `#featured` — marks an event as featured on the homepage
- `#image:<url>` — adds an image to the event (supports Google Drive share links)
