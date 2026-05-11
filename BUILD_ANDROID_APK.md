# Build Android APK Guide

## Prerequisites

To build an Android APK, you need to install the following:

### 1. Java Development Kit (JDK)
- Download JDK 17 or later from: https://www.oracle.com/java/technologies/downloads/
- Or use OpenJDK: https://adoptium.net/
- After installation, set JAVA_HOME environment variable:
  ```
  JAVA_HOME=C:\Program Files\Java\jdk-17
  ```
- Add to PATH: `%JAVA_HOME%\bin`

### 2. Android Studio (Recommended)
- Download from: https://developer.android.com/studio
- Install Android SDK
- Install Android SDK Build-Tools
- Install Android Emulator (optional, for testing)

### 3. Gradle (Usually comes with Android Studio)
- If not installed, download from: https://gradle.org/install/

## Build Steps

### Option 1: Using Gradle Command Line (After JDK is installed)

1. **Build the Angular app:**
   ```powershell
   npm run build
   ```

2. **Sync Capacitor:**
   ```powershell
   npx cap sync android
   ```

3. **Build Debug APK:**
   ```powershell
   cd android
   .\gradlew assembleDebug
   ```
   
   The APK will be located at:
   `android\app\build\outputs\apk\debug\app-debug.apk`

4. **Build Release APK (for production):**
   ```powershell
   cd android
   .\gradlew assembleRelease
   ```
   
   The APK will be located at:
   `android\app\build\outputs\apk\release\app-release-unsigned.apk`

### Option 2: Using Android Studio (Easiest)

1. **Build the Angular app:**
   ```powershell
   npm run build
   ```

2. **Sync Capacitor:**
   ```powershell
   npx cap sync android
   ```

3. **Open in Android Studio:**
   ```powershell
   npx cap open android
   ```

4. **In Android Studio:**
   - Wait for Gradle sync to complete
   - Go to: `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
   - Once complete, click "locate" to find your APK
   - APK location: `android\app\build\outputs\apk\debug\app-debug.apk`

### Option 3: Using Capacitor CLI (Simplest)

1. **Build and open in Android Studio:**
   ```powershell
   npm run build
   npx cap sync android
   npx cap open android
   ```

2. Then follow Option 2 steps 4

## Signing the APK for Production

To create a signed release APK:

1. **Generate a keystore:**
   ```powershell
   keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Update `android/app/build.gradle`:**
   Add before `android` block:
   ```gradle
   def keystorePropertiesFile = rootProject.file("keystore.properties")
   def keystoreProperties = new Properties()
   if (keystorePropertiesFile.exists()) {
       keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
   }
   ```

   Add inside `android` block:
   ```gradle
   signingConfigs {
       release {
           keyAlias keystoreProperties['keyAlias']
           keyPassword keystoreProperties['keyPassword']
           storeFile file(keystoreProperties['storeFile'])
           storePassword keystoreProperties['storePassword']
       }
   }
   buildTypes {
       release {
           signingConfig signingConfigs.release
       }
   }
   ```

3. **Create `android/keystore.properties`:**
   ```properties
   storeFile=my-release-key.keystore
   storePassword=your_store_password
   keyAlias=my-key-alias
   keyPassword=your_key_password
   ```

4. **Build signed release APK:**
   ```powershell
   cd android
   .\gradlew assembleRelease
   ```

## Quick Build Script

Add these scripts to your `package.json`:

```json
"scripts": {
  "android:build": "npm run build && npx cap sync android",
  "android:open": "npm run android:build && npx cap open android",
  "android:apk": "npm run build && npx cap sync android && cd android && .\\gradlew assembleDebug"
}
```

Then you can simply run:
```powershell
npm run android:open
```

## Troubleshooting

### Error: JAVA_HOME not set
- Install JDK and set JAVA_HOME environment variable
- Restart your terminal/IDE after setting environment variables

### Error: SDK location not found
- Install Android Studio and Android SDK
- Create `android/local.properties` with:
  ```
  sdk.dir=C:\\Users\\YourUsername\\AppData\\Local\\Android\\Sdk
  ```

### Error: Gradle sync failed
- Open Android Studio
- File → Invalidate Caches / Restart
- Try sync again

### APK too large
- Enable ProGuard in `android/app/build.gradle`:
  ```gradle
  buildTypes {
      release {
          minifyEnabled true
          proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
      }
  }
  ```

## Testing the APK

1. **Install on device/emulator:**
   ```powershell
   adb install android\app\build\outputs\apk\debug\app-debug.apk
   ```

2. **Or transfer the APK to your Android device and install manually**

## Current Status

✅ Capacitor installed
✅ Angular app built successfully
✅ Android platform added
✅ Capacitor synced with Android

⚠️ **Next Step:** Install Java JDK to build the APK

## App Information

- **App ID:** com.learnclasspedia.app
- **App Name:** Learn ClassPedia
- **Build Output:** dist/learn-class-pedia/browser
- **Android Project:** android/
