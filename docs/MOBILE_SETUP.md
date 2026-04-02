# Mobile Setup (Beginner Step-by-Step)

This project runs backend/web in Docker, but the mobile app (`apps/mobile`) runs on your local machine.

## 1) What runs where

- Docker:
  - `apps/api`
  - `apps/web-public`
  - `apps/web-private`
- Local machine:
  - `apps/mobile` (Expo React Native)

Reason: Android/iOS development needs local access to emulators/simulators/devices.

## 2) Prerequisites (local machine)

Install these first:

1. Node.js 22 LTS
2. npm (comes with Node)
3. Git
4. For Android:
   - Android Studio
   - Android SDK + emulator
5. For iOS (macOS only):
   - Xcode
   - iOS Simulator

Optional (recommended):

1. Expo Go app on your phone

## 3) Start backend in Docker

From repo root:

```bash
just up
just health
```

Check API URL is available:

- `http://localhost:8080/api`

## 4) Install mobile dependencies (local)

From repo root:

```bash
npm --prefix apps/mobile install
```

## 5) Start mobile app

From repo root:

```bash
npm --prefix apps/mobile run start
```

This opens Expo/Metro.

## 6) Run on device/emulator

### Android

If Android emulator is already running:

```bash
npm --prefix apps/mobile run android
```

### iOS (macOS)

If iOS Simulator is available:

```bash
npm --prefix apps/mobile run ios
```

### Real phone with Expo Go

1. Run `npm --prefix apps/mobile run start`
2. Scan QR from terminal/browser with Expo Go

## 7) Common first-time issues

1. `Cannot connect to API`
   - Verify Docker is running and `just health` works.
   - If using a real phone, `apps/mobile/app.json` must use your LAN IP (example: `http://192.168.1.135:8080`) not `localhost`.
2. Android emulator not detected
   - Open Android Studio and launch an emulator first.
3. iOS command fails on Linux/Windows
   - iOS builds require macOS + Xcode.
4. Dependency errors
   - Re-run:
   - `npm --prefix apps/mobile install`

## 8) Shared assets reuse

- Mobile reuses images from `shared/public/images` through backend static URLs (`/images/...`).
- This avoids duplicating icons/logos in `apps/mobile/assets`.
- Requirement: backend/static host must serve the `images` folder (already true for this repo stack).

## 9) Useful commands

From repo root:

```bash
# mobile
npm --prefix apps/mobile run start
npm --prefix apps/mobile run android
npm --prefix apps/mobile run ios
npm --prefix apps/mobile run typecheck

# docker stack
just up
just down
just health
```

## 10) Recommended daily workflow

1. Start Docker services:
   - `just up`
2. Start mobile:
   - `npm --prefix apps/mobile run start`
3. Run app on Android/iOS
4. When finished:
   - `just down`
