# Weathercam-guessr
A Geoguessr-like game based on the open road camera [API from Fintraffic](https://www.digitraffic.fi/tieliikenne/#kelikamerat). 

## Features
- User account system
    - Friends (requests)
    - User profiles
    - Account management (GDPR)
    - Admins
- Inbox/notification system
- Practice mode (even without account)
    - Infinite
    - Highly configurable
        - Image difficulties and types
        - Helpers: Disabling location blur, enabling available locations on map
- Review system
    - Images can be reviewed by admins to set their location blur, difficulty levels and types
- Daily challenges generated with a cron trigger
- Modern UI
- Custom maps
    - Creation
    - Editing
    - Playing

## Usage
1. Install:
`npm i`
2. Run next app:
`npm run dev`
- Cloudflare login required for D1 DB and R2 bucket access.
- Change bindings according to your DB names in `wrangler.jsonc`

## Deploying to Cloudflare

- Run full deploy: `npm run deploy`
- Run local build & preview `npm run preview`

## Technologies used
- Next.js 15
    - Cloudflare OpenNext adapter
- Maplibre GL JS
    - Custom style
- SQlite DB
    - Drizzle ORM
    - Cloudflare D1
- Static storage
    - Cloudflare R2
