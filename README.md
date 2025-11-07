
<table align="center" border="0">
  <tr>
    <td><img src="./resources/logo.png" alt="Codoro Logo" width="150" height="150"></td>
    <td><h1>Codoro</h1></td>
  </tr>
</table>

## Usage

### Install Dependencies

1.Clone the repository

```
git clone git@github.com:uzakotim/codoro.git && cd codoro
```

2.Install using yarn

```
yarn
```

or using npm

```
npm install
```

### Configure shortcuts for Focus mode

**Note**: Focus mode shortcuts are currently supported on macOS only.

3.Open the Shortcuts app

In macOS Shortcuts App

• Create two Shortcuts:

• “Enable Do Not Disturb” → Action: “Set Focus → Do Not Disturb → On”

• “Disable Do Not Disturb” → Action: “Set Focus → Off”

• Save them with those exact names.

Allow the app to access the shortcuts

Now your app can toggle Focus mode.

### Running in dev mode

```
yarn dev
```

or

```
npm run dev
```

### Build

```
yarn build
```

or

```
npm run build
```
