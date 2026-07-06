# Android Build & Deployment Guide

This guide provides step-by-step instructions for building, signing, and deploying PromptArchitect-Studio APKs for Android devices.

---

## 1. Prerequisites

Before you begin, ensure you have the following installed:

- **Java 21 (Oracle JDK)** — This is **required**. Homebrew's OpenJDK 26+ will fail the Gradle build with a JDK image transform error. Install via [oracle.com](https://www.oracle.com/java/technologies/javase/jdk21-archive-downloads.html) or use `brew install openjdk@21` (but ensure `/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home` is your active JDK).
- **Android SDK / Android Studio** — Provides the Android build tools and SDK platform packages.
- **Gradle CLI** — Either installed globally or via `./gradlew` wrapper in the project.
- **adb (Android Debug Bridge)** — Installed via Homebrew (`brew install adb`) as part of platform-tools.
- **[Capacitor CLI](https://capacitorjs.com/)** — `npm i -g @capacitor/cli @capacitor/core`

```bash
# Verify your active JDK is 21
/usr/libexec/java_home -V
# Should show Java SE 21, NOT Homebrew OpenJDK 26+
```

---

## 2. Project Structure

This project uses Capacitor 8 to bundle the React web app into an Android native wrapper.

```
android/                          # Full Android project (auto-generated + customized)
├── build.gradle                  # Gradle config (Gradle 8.14, Kotlin-based plugins)
├── variables.gradle              # SDK versions: minSdk=26, compileSdk=36, targetSdk=36
├── settings.gradle               # Includes :app and capacitor-cordova-android-plugins
│
android/app/
├── build.gradle                  # App-level: versionCode 1, namespace com.promptarchitect.app
├── src/main/AndroidManifest.xml  # Permissions (INTERNET), FileProvider
├── src/main/assets/public/       # Bundled web app (Vite build output)
├── src/main/java/com/promptarchitect/app/MainActivity.java   # Registers NativeAIPlugin
└── src/main/java/com/promptarchitect/app/NativeAIPlugin.java # On-device Gemma 4 inference via LiteRT LM
```

Key Capacitor config at root: `capacitor.config.ts` (appId: `com.promptarchitect.app`, appName: `PromptArchitectStudio`, webDir: `'dist'`)

---

## 3. JDK Compatibility Warning ⚠️

**Homebrew's OpenJDK 26 will break the Gradle build.** The error manifests as:

```
Failed to transform core-for-system-modules.jar ... Error while running jlink --add-modules java.base ...
BUILD FAILED in Xs
```

Always use **Java SE 21 (Oracle JDK)** to build. Set `JAVA_HOME` before running Gradle:

```bash
JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home ./gradlew assembleDebug
```

This is the most common build failure — keep this in mind if you upgrade your system JDK.

---

## 4. Debug APK Build (Development / Side-load)

Use debug builds for development, internal testing, and device installation.

### Step 1: Rebuild the web frontend

The React app must be rebuilt first so the updated HTML/JS/CSS is bundled into the Android assets:

```bash
pnpm build
```

Output lands in `dist/`. Verify it works by opening `dist/index.html` in a browser.

### Step 2: Sync to Android project assets

Overwrite the web bundle inside the Android project:

```bash
cp -R dist/* android/app/src/main/assets/public/
```

This copies your latest React build into the APK's asset directory.

### Step 3: Build the debug APK

From the project root:

```bash
JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home ./gradlew assembleDebug
```

The debug APK is created at:

```
android/app/build/outputs/apk/debug/app-debug.apk
```

### Step 4: Install on device (via USB)

Connect your Android device via USB with **USB Debugging** enabled. Authorize on-device when prompted, then run:

```bash
# Uninstall the previous version (required — same package name)
adb uninstall com.promptarchitect.app

# Install the new APK
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

The app should launch on your device with the latest changes.

### Updating Only Code Changes

If only frontend models or UI code have changed:
1. `pnpm build`
2. `cp -R dist/* android/app/src/main/assets/public/`
3. Skip the Gradle build — just copy again and hot-reload isn't available. You need a rebuild:
   a. Either reinstall without full rebuild (assets are baked at APK install time), or
   b. Run steps 3-4 above for a clean install.

---

## 5. Release APK (Production / Play Store)

Release APKS are signed and optimized for distribution.

### Step 1: Configure signing in app/build.gradle

First, create a keystore file (run once):

```bash
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore promptarchitect-release.keystore \
  -alias promptarchitect \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10950 \
  -jceks
```

This generates `promptarchitect-release.keystore` in your home directory. Protect this file — it's the key to your app's identity on Play Store.

Next, edit `android/app/build.gradle` to add a signing config:

```gradle
// Before `buildTypes {`:
def getProperty(String dictionary, String propertyName) {
    return properties.getProperty(propertyName, "")
}

android {
    // ... existing config ...
    
    signingConfigs {
        release {
            storeFile file(System.getenv("KEYSTORE_PATH") ?: "../promptarchitect-release.keystore")
            storePassword System.getenv("KEYSTORE_PASSWORD")
            keyAlias System.getenv("KEY_ALIAS")
            keyPassword System.getenv("KEY_PASSWORD")
        }
    }

    buildTypes {
        release {
            minifyEnabled false  // or true for ProGuard/R8 optimization
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
            signingConfig signingConfigs.release
        }
    }
}
```

Build variables can be passed via environment variables or `gradle.properties`. Keep your keystore file out of version control.

### Step 2: Update versionCode and versionName

Update these in `android/app/build.gradle` `defaultConfig`:

```gradle
defaultConfig {
    versionCode 2          // Increment for each release
    versionName "1.1"      // Semantic version matching your web app's package.json
}
```

### Step 3: Build release APK

```bash
JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home \
KEYSTORE_PATH=/path/to/promptarchitect-release.keystore \
KEYSTORE_PASSWORD=your_keystore_password \
KEY_ALIAS=promptarchitect \
KEY_PASSWORD=your_key_password \
./gradlew assembleRelease
```

The unsigned release APK is placed at:

```
android/app/build/outputs/apk/release/app-release.apk
```

### Step 4: Upload to Play Store

1. Create a new **Internal Testing** or **Production** track in the Google Play Console for `com.promptarchitect.app`
2. Upload `app-release.apk` as a new release (set versionCode/versionName matches)
3. Fill out the release notes, content rating, and distribution details
4. Review and publish when ready

### Step 5: Clean up (optional but recommended)

```bash
./gradlew clean     # Cleans gradle build cache locally
```

---

## 6. Updating Models

When your `types.ts` models change (e.g., replacing one model with another), follow this flow:

1. **Edit the model list** in `types.ts` — update the `MODELS` array and default model reference.
2. **Rebuild the web app:** `pnpm build`
3. **Sync to android:** `cp -R dist/* android/app/src/main/assets/public/`
4. **Update version metadata** in `android/app/build.gradle`:
   - Increment `versionCode` by 1 (required for Play Store)
   - Update `versionName` if applicable
5. **Build:** Run the appropriate Gradle command (debug or release as above)
6. **Install / Upload** to your target device or store

---

## 7. Troubleshooting

### Build fails with JDK/Jlink errors
See Section 3 above. Homebrew's OpenJDK 26+ is incompatible with Android SDK 36's `core-for-system-modules.jar`. Always use Oracle JDK 21 via the `JAVA_HOME` workaround.

### APK installs but the app shows an old version
You likely skipped step 2 (syncing web assets to android) or missed step 4 (uninstalling the previous APK). Run:
```bash
adb uninstall com.promptarchitect.app
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Gradle daemon issues ("incompatible daemons")
Clear the Gradle cache if builds hang or show stale state:
```bash
./gradlew --stop  # Kills all running gradle deamons
# Then rebuild normally
```

### ProGuard removes NativeAIPlugin / LiteRT classes
If you enable `minifyEnabled true` for release builds, add these ProGuard rules to `proguard-rules.pro`:
```
-keep class com.google.ai.edge.litertlm.** { *; }
-keep class com.getcapacitor.** { *; }
-dontwarn com.google.ai.edge.litertlm.**
```

### APK too large (>100MB with Gemma 4)
The LiteRT LM library and native bindings add significant size. If necessary, strip debug symbols:
```bash
./gradlew assembleRelease -Pandroid.bundle.enableUncompressedNativeLibs=false
```
