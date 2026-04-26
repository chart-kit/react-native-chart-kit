# Contributing to React Native Chart Kit

👍🎉 First off, thanks for taking the time to contribute! 🎉👍

Suggestions and pull requests are highly encouraged! Have a look at the [open issues](https://github.com/indiespirit/react-native-chart-kit/issues).

## Branch names

Use lowercase kebab-case branch names in this format:

```sh
<type>/<short-summary>
```

Use these branch types:

- `fix/` for user-visible bug fixes
- `feat/` for new public functionality
- `docs/` for documentation-only changes
- `ci/` for automation and CI changes
- `chore/` for maintenance, release hygiene, and dependency upkeep
- `refactor/` for internal changes that do not intentionally change behavior
- `release/` for version bump and publishing prep

Include an issue number when the branch maps to a specific issue, for example `fix/733-svg-gradient-ids`. Keep each branch scoped to one pull request.

## Workflow

First clone:

```sh
git clone git@github.com:indiespirit/react-native-chart-kit.git
cd react-native-chart-kit
npm install --legacy-peer-deps
```

In order to run it, you are gonna have to flip values for "main" and "\_main" in package json. This is nessesary because both npm and expo have a notion of a main file, but for npm it's the file that you run when you import this library in your app; and for expo it's the file that it uses to display the example app.

Don't forget to flip it back before commiting.

**After you update fix the package.json**

```sh
npm start # And get your Expo app ready on your phone
npm run build # Verify the package build
```
