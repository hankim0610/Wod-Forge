# Wod Forge

A CrossFit-style workout-of-the-day app for discovering, timing, scaling, and
logging training sessions.

## Features

- Filter WODs by training focus and available equipment
- Generate a random workout from the active filters
- View a complete workout briefing with coaching cues and scaling guidance
- Run AMRAP, EMOM, and For Time clocks for the selected workout
- Save score, notes, and completion status in local browser storage
- Package the app for mobile with Capacitor
- Run a built-in countdown clock for the selected workout
- Save score, notes, and completion status in local browser storage

## Getting started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

## Mobile app workflow

This project uses Capacitor to package the Vite app as a native mobile app.

Sync web changes into the native projects:

```bash
npm run mobile:sync
```

Open the Android project in Android Studio:

```bash
npm run mobile:android
```

Open the iOS project in Xcode from macOS:

```bash
npm run mobile:ios
```

Notes:

- The Android native project is included in `android/`.
- iOS builds require macOS and Xcode. Run `npx cap add ios` on macOS before
  opening the iOS project for the first time.
