# Cross-Platform Strategy
## Web → iOS → Android

---

## Strategy Summary

**Phase 1: Web (current)** — Mobile-first React PWA. Works on all devices via browser.
**Phase 2: PWA Enhancement** — Add service worker, offline mode, installable prompt.
**Phase 3: Native Mobile** — Expo (React Native) for iOS + Android. Shared codebase ~85%.
**Phase 4: Platform-Specific** — Native modules, biometrics, deep linking, push.

---

## Platform Comparison

| Feature | Web (Phase 1) | PWA (Phase 2) | Native/Expo (Phase 3) |
|---------|--------------|--------------|----------------------|
| Install to home screen | Manual | Yes (prompt) | App Store / Play Store |
| Push notifications | No | Limited | Full (APNs + FCM) |
| Offline mode | No | Partial | Full |
| Camera / file upload | Yes | Yes | Yes + better UX |
| Native share sheet | No | Partial | Yes |
| Haptic feedback | No | No | Yes |
| Biometric auth | No | No | Phase 4 |
| App Store presence | No | No | Yes |
| Deep linking | Yes (URL) | Yes (URL) | Yes (universal links) |
| Performance | Good | Good | Better (native scroll) |

---

## Phase 2: PWA Implementation

### manifest.json
```json
{
  "name": "Velocity",
  "short_name": "Velocity",
  "description": "Community for Pursuit builders",
  "theme_color": "hsl(250, 84%, 54%)",
  "background_color": "#ffffff",
  "display": "standalone",
  "orientation": "portrait",
  "scope": "/",
  "start_url": "/",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icon-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### Service Worker Caching
```js
// Cache strategy:
// - App shell: cache-first (index.html, CSS, JS)
// - Builder directory: stale-while-revalidate (1hr)
// - User profile: stale-while-revalidate (5min)
// - Images: cache-first (24hr)
// - API calls: network-first with fallback
```

---

## Phase 3: Expo / React Native Architecture

### Repo Structure
```
pursuit-sync/
├── src/              ← Shared logic (lib/, hooks/, components/ui/)
├── web/              ← React web app (current)
└── mobile/           ← Expo app
    ├── app/          ← Expo Router file-based routing
    │   ├── (tabs)/
    │   │   ├── index.tsx    ← Feed
    │   │   ├── builders.tsx ← Builders
    │   │   ├── campfire.tsx ← Campfire
    │   │   ├── connect.tsx  ← Connect
    │   │   └── messages.tsx ← Messages
    │   ├── profile/[email].tsx
    │   ├── lookbook/[id].tsx
    │   └── project/[id].tsx
    ├── components/   ← Native-specific components
    ├── hooks/        ← Shared hooks (reuse from web where possible)
    └── app.json      ← Expo config
```

### Shared Code Strategy
| Layer | Sharing Approach |
|-------|-----------------|
| API calls (base44) | 100% shared — same SDK works in React Native |
| Business logic (lib/) | 100% shared — pure JS, no DOM |
| React Query hooks | 100% shared |
| UI components | ~30% shared (primitives); native uses RN equivalents |
| Styling | Web: Tailwind; Mobile: StyleSheet (nativewind for partial sharing) |
| Navigation | Web: React Router; Mobile: Expo Router (file-based) |

### Navigation (Mobile)
```
Tab Navigator:
├── 🏠 Feed
├── 📁 CoBuild
├── ＋ Create (FAB)
├── 👥 Builders
└── 💬 Messages

Stack overlays:
├── Profile → Lookbook → Schedule
├── Project Detail
├── Event Detail
└── Campfire → Match Detail
```

### Push Notification Setup
```js
// Expo Notifications
import * as Notifications from 'expo-notifications';

// Register device token
const token = await Notifications.getExpoPushTokenAsync();
// Save token to Base44 user record: user.push_token = token

// Handle notification types:
// - new_match: "You have a new Campfire match!"
// - new_message: "{sender} sent you a message"
// - new_rsvp_event: "Don't forget: {event} is tomorrow"
// - re_engagement: "You haven't posted in 2 weeks. Share your progress!"
```

### Deep Linking
```js
// app.json
{
  "scheme": "velocity",
  "ios": { "bundleIdentifier": "com.pursuit.velocity" },
  "android": { "package": "com.pursuit.velocity" }
}

// Universal links:
// https://velocity.pursuit.org/profile/:email
// https://velocity.pursuit.org/lookbook/:id
// https://velocity.pursuit.org/messages?to=:email
// https://velocity.pursuit.org/event/:id
```

---

## Platform-Specific UX Considerations

### iOS
- Use SF Symbols for icons where possible
- Bottom sheet for modals (not full-screen dialog)
- Swipe-to-go-back gesture support
- Dynamic Type support (accessibility text sizing)
- Dark Mode: respect system setting

### Android
- Material You color extraction from avatar
- FAB (floating action button) for Create Post
- Back gesture support (predictive back)
- Notification channels for different types
- Large screen / tablet: 2-column layout

### Web
- Purple theme (`hsl(250, 84%, 54%)`) as primary
- Desktop: sidebar nav + right panel
- Keyboard shortcuts (Phase 4): `C` = create post, `B` = builders, etc.
- Accessibility: screen reader, high contrast mode

---

## App Store Submission Plan

### Timeline
| Milestone | iOS | Android |
|-----------|-----|---------|
| Internal TestFlight / Internal Testing | Week 1 | Week 1 |
| External Beta (100 fellows) | Week 3 | Week 3 |
| App Store Review submission | Week 6 | Week 5 |
| Public launch | Week 8 | Week 7 |

### Required Assets
**iOS:**
- App icon: 1024x1024 PNG
- Screenshots: 6.7" (iPhone 14 Pro Max), 12.9" (iPad Pro)
- Privacy policy URL
- App Store description (< 4000 chars)

**Android:**
- Feature graphic: 1024x500 PNG
- Screenshots: Phone (1080x1920), Tablet (1200x1920)
- Privacy policy URL
- Short description (< 80 chars), Full description (< 4000 chars)

---

*Phase 4 document — reviewed 2026-03-26*
