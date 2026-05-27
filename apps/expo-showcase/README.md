# Chart Kit Expo Showcase

Expo app for reviewing the same chart stories used by the web showcase on a physical device.

This app intentionally tracks Expo SDK 54 for broad Expo Go compatibility during visual review.
The library source can still target newer React Native versions independently.

Run from the repository root:

```bash
npm install
npm run example:expo
```

Then scan the QR code with Expo Go while your computer and phone are on the same network.
If Expo Go does not discover the LAN server, use tunnel mode:

```bash
npm run example:expo -- --tunnel
```

Useful commands:

```bash
npm --workspace @chart-kit/expo-showcase run typecheck
npm --workspace @chart-kit/expo-showcase run start -- --clear
npm --workspace @chart-kit/expo-showcase run android
npm --workspace @chart-kit/expo-showcase run ios
```
