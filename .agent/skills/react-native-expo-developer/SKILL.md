---
name: react-native-expo-developer
description: Expert guidance for developing LUNARA mobile screens using React, JavaScript (.jsx), Tailwind CSS v4, Capacitor for Android, and Supabase.
---

# LUNARA Mobile Frontend & Capacitor Developer Skill

## Overview & Architecture Alignment
This skill guides the implementation of client-side application screens, navigation, component composition, form handling, and mobile ergonomics for **LUNARA** using the same proven stack as **MentorshipTutoringApp**:
- **Framework**: React 19 (Functional components & Hooks)
- **Language**: JavaScript (ES6+ Modules, `.jsx`)
- **Build Tool**: Vite (Instant HMR, `http://localhost:5173`)
- **Styling**: Tailwind CSS v4 (Mobile-first ergonomics, Lavender design tokens)
- **Mobile Native Runtime**: Capacitor (`@capacitor/core`, `@capacitor/android`) for Android compilation
- **Backend Access**: Supabase (`@supabase/supabase-js`) via `src/services/supabaseClient.js`

---

## 1. Directory Structure

```text
LUNARA/
├── index.html                # Mobile viewport mount point
├── vite.config.js            # Vite configuration with @tailwindcss/vite
├── capacitor.config.json     # Capacitor Android runtime config
├── package.json              # Scripts: dev, build, preview
├── src/
│   ├── main.jsx              # Application bootstrap
│   ├── App.jsx               # Root mobile frame with 5-tab bottom navigation
│   ├── index.css             # Tailwind CSS v4 with safe area and theme tokens
│   ├── pages/                # Screen views (HomeScreen.jsx, TransactionsScreen.jsx, etc.)
│   ├── components/           # Reusable UI components (buttons, cards, inputs)
│   ├── services/
│   │   └── supabaseClient.js # Centralized Supabase client with session persistence
│   └── utils/                # Pure business logic (currency.js, calculations.js)
```

---

## 2. Development Workflow

- **Preview on PC**:
  ```bash
  npm run dev
  ```
  Access via: `http://localhost:5173`
- **Preview on Mobile Phone (same Wi-Fi)**:
  Access via: `http://<YOUR-PC-IP>:5173` directly in your phone's browser.
- **Build for Android (Capacitor)**:
  ```bash
  npm run build
  npx cap sync
  npx cap open android
  ```
