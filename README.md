# Auxtero AppDev Basic Mobile App

A basic React Native app (Expo + TypeScript) that satisfies the activity requirements:

- At least two interconnected screens (`Home` and `Details`)
- Global state management (favorites via React Context)
- Data fetched from an open REST API (`reddit.com/r/worldnews` JSON endpoint)

## Features

- `Home` screen loads live posts from:
  - `https://www.reddit.com/r/worldnews/new.json?limit=25`
- Optional Philippines feed:
  - `https://www.reddit.com/r/Philippines/new.json?limit=25`
- Auto-refresh every 60 seconds + pull-to-refresh
- Built-in on-device summary generation for each article
- Home supports `All / Favorites` filter so saved news can be viewed directly
- Tap any post to open `Details`
- `Details` screen allows saving/removing favorites (global state)
- `Details` shows source link and publication time for each live article
- When feed details are missing, `Details` tries to fetch a short source preview automatically
- `Details` includes a tiny `Refresh preview` button for retrying source preview

## Run Locally

```bash
npm install
npm run android
```

Other options:

```bash
npm run start
npm run web
```

## Build for Submission (Android APK/AAB)

### Option A: Local Build (No EAS account required)

From the project root:

```bash
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```

Generated APK path:

```text
android/app/build/outputs/apk/release/app-release.apk
```

You can submit that APK directly with your repository link.

### Option B: EAS Build (requires Expo account)

This option generates cloud builds and is useful if you want AAB without local Android toolchain setup.

1. Install EAS CLI:

```bash
npm install -g eas-cli
```

2. Login to Expo:

```bash
eas login
```

3. Configure build profile (first time only):

```bash
eas build:configure
```

4. Build Android AAB (Play Store format):

```bash
eas build -p android --profile production
```

5. (Optional) Build APK for direct install/testing:

```bash
eas build -p android --profile preview
```

After build completes, Expo gives a downloadable link for the artifact (`.aab` or `.apk`) that you can submit with your repository link.

## Submission Checklist

- Push this project to your GitHub repository
- Include the repository URL in your submission
- Download and submit the generated Android build artifact (`.apk` or `.aab`)
