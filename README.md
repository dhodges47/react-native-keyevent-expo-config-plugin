# react-native-keyevent
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

# Contributing

Contributions are very welcome! Please refer to guidelines described in the [contributing guide]( https://github.com/expo/expo#contributing).
