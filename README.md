# 🎬 GIF to Reel (Meme Maker) 🚀

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![FFmpeg](https://img.shields.io/badge/FFmpeg-007808?style=for-the-badge&logo=ffmpeg&logoColor=white)

**GIF to Reel** is a powerful React Native mobile application built with Expo that allows creators to instantly convert standard GIFs or images into perfect 9:16 vertical videos for Instagram Reels, TikTok, and YouTube Shorts. 

Say goodbye to awkwardly cropped memes or messy formatting. With GIF to Reel, you can add custom text, stickers, blur backgrounds, and export a perfectly looped, high-quality video entirely on-device!

---

## ✨ Features

- **📱 Auto 9:16 Formatting:** Automatically frames your raw GIFs or images into a pristine vertical video canvas without cropping out essential details.
- **🎨 Advanced Meme Editor:** Customize your content with draggable text, resizable stickers, and a built-in color picker.
- **🔤 Custom Fonts Support:** Choose from high-impact built-in fonts (like *Anton* and *Bebas Neue*) or upload your own custom fonts to match your brand style.
- **🖼️ Smart Backgrounds:** Create an aesthetic viewing experience using auto-blurred backgrounds derived from your GIF, solid colors, or entirely custom uploaded background images.
- **⚡ On-Device Rendering:** Leverage the power of `FFmpegKit` directly on your mobile device to render and loop video frames quickly and privately—no cloud servers required.
- **🔗 Seamless Exporting:** Save directly to your device's media gallery or share instantly to social apps.

## 🛠️ Tech Stack

This app relies on a robust and modern mobile development stack:
* **Framework:** [React Native](https://reactnative.dev/) & [Expo SDK](https://expo.dev/) (Expo Router for navigation)
* **Video Processing:** [`@wokcito/ffmpeg-kit-react-native`](https://github.com/wokcito/ffmpeg-kit) for executing powerful FFmpeg commands on mobile.
* **Animations & Gestures:** `react-native-reanimated` and `react-native-gesture-handler` for butter-smooth interactions.
* **File System:** `expo-file-system` and `expo-media-library` for asset management and exporting.

## 🚀 How it Works

1. **Select an Asset:** The user selects a raw GIF or static image from their device.
2. **Customize:** 
   - Add text layers with various preset styles and custom fonts.
   - Adjust the background layer to use a dynamic blur effect.
   - Set the desired loop duration for the final video (e.g., 5 seconds, 10 seconds).
3. **Render:** When the user taps Save, the app generates a sequence of FFmpeg commands. It extracts frames, overlays the text and background, and loops the content perfectly to the specified duration.
4. **Share:** The final `.mp4` file is generated locally and presented for the user to save or share.

## 💻 Running Locally

To run this project locally, ensure you have Node.js and the Expo CLI installed.

```bash
# Install dependencies
npm install

# Start the Expo development server
npx expo start
```

*Note: Video generation relies on native FFmpeg binaries. You must create a development build (`npx expo run:ios` or `npx expo run:android`) to test video exporting, as the Expo Go app does not include custom native modules.*

## 📜 License

This project is licensed under the MIT License.
