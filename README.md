# irt_client

Uses [ES6] and [React] with [Electron]. It uses [Babel] to automatically transpile ES6 and JSX code,
without depending on any package manager besides `npm`.  Some work started in [TypeScript], goal is to 
convert all JS to TypeScript.

## How?

The Node and Electron binaries both take a parameter `-r` that automatically
requires a module before the rest of the code.  The `npm start` script is
modified using this, which registers Babel and loads the entry point `main.js`.

The renderer entry point `index.html` does basically the same, but loads the
`scripts/main.js` file, which renders the `views/main.jsx` component into the `body`.

## Installation

1. git clone repo
2. install node globally
   a. Upgrade npm: npm install npm@latest -g
3. install windows-build-tools (not sure how this works on mac yet)
    npm install --global --add-python-to-path --production windows-build-tools
4. install install type script globally
    npm install -g typescript
5. install electron-forge globally
    npm install -g electron-forge
6. npm install
7. npm start

## Top Level Library Dependencies

[node.js] Node v6.10.0 installed globally
[npm] Is installed with node, but you'll need to upgrade npm > 4 for electron-forge package to work.
[ES6]: http://exploringjs.com/
[React]: https://facebook.github.io/react/
[Electron]: http://electron.atom.io/
[Babel]: http://babeljs.io (hoping to remove this dependency and just use electron-forge)
[TypeScript]: http://www.typescriptlang.org
[Electron-Forge]: https://www.npmjs.com/package/electron-forge (Packages electron app for distribution)

## Note
```bash
You cannot use the bash shell on Windows for npm install, likely because it compiles native libraries.

Make sure that git is in your path, i.e. "c:\program files\git\bin\"

## Using Native Libraries
#ffi is used to talk to the native ANT libraries.
    This requires electron-rebuild
        Which requires windows-build-tools to be installed (globally), run as admin: 
            npm install --global --add-python-to-path --production windows-build-tools
        This will then run the postinstall script which rebuilds native libraries: 
            .\node_modules\.bin\electron-rebuild.cmd

# Add "build pipline" using webpack?
    tried using this, but got an err:
        Not allowed to load local resource
        http://blog.scottlogic.com/2017/06/06/typescript-electron-webpack.html

# Update 11/1/2018
 when trying to build on OSX, had all sorts of errors.  Needed to downgrade node to 8.8.1
 also needed to *upgrade* node-gyp: 
 [sudo] npm explore npm -g -- npm install node-gyp@latest
 as per this: https://github.com/nodejs/node-gyp/wiki/Updating-npm's-bundled-node-gyp