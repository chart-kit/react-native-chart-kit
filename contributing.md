# Contributing to React Native Chart Kit

👍🎉 First off, thanks for taking the time to contribute! 🎉👍

Suggestions and pull requests are highly encouraged! Have a look at the [open issues](https://github.com/indiespirit/react-native-chart-kit/issues).

## Workflow

First clone:

```sh
git clone git@github.com:indiespirit/react-native-chart-kit.git
cd react-native-chart-kit
yarn install
```

In order to run it, you are gonna have to flip values for "main" and "_main" in package json. This is nessesary because both npm and expo have a notion of a main file, but for npm it's the file that you run when you import this library in your app; and for expo it's the file that it uses to display the example app.

Don't forget to flip it back before commiting.

**After you update fix the package.json**

```sh
yarn start # And get you expo app ready on your phone
```

