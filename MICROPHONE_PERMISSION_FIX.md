# Microphone Permission Fix for Android App

## Issue
The Android app was showing "Microphone permission is required" error when trying to use voice chat feature.

## Root Cause
Android apps built with Capacitor need explicit permission handling in both:
1. AndroidManifest.xml (declare permissions)
2. Runtime permission requests (getUserMedia API)

## Changes Made

### 1. Updated AndroidManifest.xml
Added proper microphone permissions:
```xml
<!-- Audio/Microphone permissions for voice chat -->
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />

<!-- Declare microphone feature -->
<uses-feature android:name="android.hardware.microphone" android:required="false" />
```

### 2. Updated Chat Component (chat.ts)
- Added Capacitor import to detect native platform
- Improved error messages for native apps vs web browsers
- Added better logging for permission debugging

### 3. Installed Capacitor Device Plugin
```bash
npm install @capacitor/device
```

## How to Test

### Option 1: Rebuild and Test on Device

1. **Rebuild the app:**
   ```powershell
   npm run build
   npx cap sync android
   ```

2. **Open in Android Studio:**
   ```powershell
   npx cap open android
   ```

3. **Build and install APK:**
   - In Android Studio: Build → Build Bundle(s) / APK(s) → Build APK(s)
   - Install on device or emulator

4. **Test voice chat:**
   - Open a course
   - Click the microphone button
   - You should see Android's permission dialog
   - Grant permission
   - Voice chat should now work

### Option 2: Quick Test with Android Studio

1. **Sync and open:**
   ```powershell
   npm run android:open
   ```

2. **Run on device:**
   - Click the green "Run" button in Android Studio
   - Select your device/emulator
   - App will install and launch automatically

3. **Test microphone:**
   - Navigate to voice chat
   - Click microphone button
   - Grant permission when prompted

## Permission Flow

### First Time Use:
1. User clicks microphone button
2. App requests microphone permission via `getUserMedia()`
3. Android shows system permission dialog
4. User grants/denies permission
5. If granted: Voice recording starts
6. If denied: Error message shown

### Subsequent Uses:
- If permission already granted: Voice recording starts immediately
- If permission denied: User sees error with instructions to enable in settings

## Troubleshooting

### Permission Still Not Working?

1. **Check Android version:**
   - Android 6.0+ requires runtime permissions
   - Make sure you're testing on Android 6.0 or higher

2. **Clear app data:**
   ```
   Settings → Apps → Learn ClassPedia → Storage → Clear Data
   ```
   Then reinstall the app

3. **Manually grant permission:**
   ```
   Settings → Apps → Learn ClassPedia → Permissions → Microphone → Allow
   ```

4. **Check logcat in Android Studio:**
   - Look for permission-related errors
   - Search for "Microphone" or "RECORD_AUDIO"

### Error: "Microphone access was blocked"

This means the user denied permission. To fix:
1. Go to device Settings
2. Apps → Learn ClassPedia
3. Permissions → Microphone
4. Enable "Allow"

### Error: "No microphone detected"

This means:
- Device has no microphone (unlikely on phones)
- Microphone is being used by another app
- Hardware issue

## Testing Checklist

- [ ] Build completes without errors
- [ ] App installs on Android device
- [ ] App launches successfully
- [ ] Can navigate to course
- [ ] Microphone button is visible
- [ ] Clicking microphone shows permission dialog (first time)
- [ ] Granting permission allows voice recording
- [ ] Voice input is captured and sent
- [ ] Denying permission shows helpful error message
- [ ] Permission persists across app restarts

## Additional Notes

### For Production Release:

1. **Update app permissions description:**
   Add to `android/app/src/main/res/values/strings.xml`:
   ```xml
   <string name="microphone_permission_rationale">
       This app needs microphone access to enable voice chat with your Course Companion.
   </string>
   ```

2. **Test on multiple Android versions:**
   - Android 6.0 (API 23)
   - Android 10.0 (API 29)
   - Android 13.0 (API 33)
   - Latest Android version

3. **Handle permission denial gracefully:**
   - Show clear instructions
   - Provide link to app settings
   - Allow users to continue without voice (text-only)

## Files Modified

1. `android/app/src/main/AndroidManifest.xml` - Added microphone permissions
2. `src/app/setup/course/chat/chat.ts` - Improved permission handling
3. `package.json` - Added @capacitor/device dependency

## Next Steps

After rebuilding and testing:
1. If working: Build release APK for distribution
2. If not working: Check Android Studio logcat for specific errors
3. Test on different Android devices/versions
4. Consider adding permission rationale dialog before requesting

## Support

If issues persist:
1. Check Android Studio logcat output
2. Verify AndroidManifest.xml has correct permissions
3. Ensure app has latest Capacitor sync
4. Test on physical device (emulator may have microphone issues)
