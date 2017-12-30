# electron-es6-react

A simple boilerplate app to demonstrate how to use [ES6] and [React] with
[Electron]. It uses [Babel] to automatically transpile ES6 and JSX code,
without depending on any package manager besides `npm`.

## How?

The Node and Electron binaries both take a parameter `-r` that automatically
requires a module before the rest of the code.  The `npm start` script is
modified using this, which registers Babel and loads the entry point `main.js`.

The renderer entry point `index.html` does basically the same, but loads the
`scripts/main.js` file, which renders the `views/main.jsx` component into the `body`.

## Installation

```bash
git clone https://github.com/b52/electron-es6-react.git
cd electron-es6-react
npm install
npm start
```

[ES6]: http://exploringjs.com/
[React]: https://facebook.github.io/react/
[Electron]: http://electron.atom.io/
[Babel]: http://babeljs.io

## Note
```bash
You cannot use the bash shell on Windows for npm install.  I do not know why.

## Using Native Libraries
#ffi is used to talk to the native ANT libraries.
    This requires electron-rebuild
        Which requires windows-build-tools to be installed (globally), run as admin: 
            npm install --global --add-python-to-path --production windows-build-tools
        This will then run the postinstall script which rebuilds native libraries: 
            .\node_modules\.bin\electron-rebuild.cmd

## Progressions

1. Add ffi and native ant libraries
//2. Use typescript (which requires webpack)
    tried using this, but got an err:
        Not allowed to load local resource
        http://blog.scottlogic.com/2017/06/06/typescript-electron-webpack.html
3. Port html/css from irt_client2 over as-is
4. Covert html/css to react
5. Import all ant services