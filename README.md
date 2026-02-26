# Auxtero AppDev Basic Mobile App

A basic React Native app (Expo + TypeScript) that satisfies the activity requirements:

- At least two interconnected screens (`Home` and `Details`)
- Global state management (favorites via React Context)
- Data fetched from an open REST API (`jsonplaceholder.typicode.com`)

## Features

- `Home` screen loads posts from:
  - `https://jsonplaceholder.typicode.com/posts?_limit=20`
- Tap any post to open `Details`
- `Details` screen allows saving/removing favorites (global state)
- `Details` also fetches sample comments from:
  - `https://jsonplaceholder.typicode.com/posts/{id}/comments?_limit=3`

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
