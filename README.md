# react-native-keyevent-expo-config-plugin
## This plugin is designed to configure react-native-keyevent by Kevin E. John for use in Expo prebuild projects.
## Config plugin to auto configure react-native-keyevent on prebuild
### Forked from ChronSyn/react-native-keyevent-expo-config-plugin.git 6/11/2025
### Modified to uncomment keyevents needed by the Android app


### Add the package to your npm dependencies

```
yarn add --dev https://github.com/dhodges47/react-native-keyevent-expo-config-plugin.git
```

In your `app.json` or equivalent, add the following;
```js
{
    expo: {
      /* ... */
      plugins: ['react-native-keyevent-expo-config-plugin'],
    },
  }
```
do this to update the Android folder if building locally:
```
npx expo prebuild --platform android
```
# Contributing

Contributions are very welcome! Please refer to guidelines described in the [contributing guide]( https://github.com/expo/expo#contributing).
