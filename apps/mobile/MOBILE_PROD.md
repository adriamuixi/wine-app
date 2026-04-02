# Mobile Production Guide (Expo + EAS)

This guide explains how to run the app on your phone and how to publish to Google Play and Apple App Store.

## 1. Run on your phone now (without publishing)

From repo root:

```bash
npm --prefix apps/mobile install
npm --prefix apps/mobile run start
```

Then:
- Open **Expo Go** on Android/iPhone.
- Scan the QR code from terminal.
- The app runs as a development build.

## 2. Prepare EAS (one-time setup)

```bash
npm i -g eas-cli
cd apps/mobile
eas login
eas build:configure
```

This creates/updates EAS config and links the project to Expo.

## 3. Internal builds (testing with real users/devices)

### Android internal build

```bash
cd apps/mobile
eas build --platform android --profile preview
```

### iOS internal build (TestFlight path)

```bash
cd apps/mobile
eas build --platform ios --profile preview
```

After each build, EAS gives you an install/distribution link.

## 4. Production builds

### Android production (.aab for Play Store)

```bash
cd apps/mobile
eas build --platform android --profile production
```

Upload resulting `.aab` to Google Play Console.

### iOS production (App Store / TestFlight)

```bash
cd apps/mobile
eas build --platform ios --profile production
eas submit --platform ios
```

## 5. Store accounts required

- Google Play: Google Play Console developer account
- Apple: Apple Developer Program account

Without these accounts you cannot publish publicly.

## 6. Required app config before publish

In `apps/mobile/app.json` (or app config), verify:
- App name
- Package IDs:
  - Android `package` (example: `com.tatirosset.wineapp`)
  - iOS `bundleIdentifier` (example: `com.tatirosset.wineapp`)
- Version + build numbers
- App icon
- Splash screen
- Permissions used by the app

## 7. Recommended pre-release checklist

Before production submission:
- Test login/logout
- Test catalog loading, filters, sorting
- Test wine detail + photo viewer
- Test review create/update/delete
- Test language switching (`ca`, `es`, `en`)
- Test on at least 1 real Android + 1 real iPhone
- Confirm backend URL is production-safe
- Prepare privacy policy URL

## 8. Useful commands

From repo root:

```bash
npm --prefix apps/mobile run typecheck
npm --prefix apps/mobile run lint
npm --prefix apps/mobile run test
```

If needed:

```bash
cd apps/mobile
npx expo doctor
```

