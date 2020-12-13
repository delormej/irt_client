'use babel';

import React from 'react';
import Electron from 'electron';
import Process from 'process';

export default class VersionInfo extends React.Component {
    constructor(props) {
      super(props);
    }
    
    render() {
        return (
            <div className="versionInfo">
                <div className="appVersionInfo">v.{Electron.remote.app.getVersion()}</div>
                Node.js: {Process.versions.node}<br/>
                Chromium: {Process.versions.chrome}<br/>
                Electron: {Process.versions.electron}<br/>  
            </div>
        );
    }
}
