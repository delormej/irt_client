'use babel';

import React from 'react';
import VersionInfo from '../views/versionInfo.jsx';

function Menu(props) {
    let navigatePage;
    let linkLabel;
    if (props.page === "settings") {
      navigatePage = "ride";
      linkLabel = "RIDE";
    }
    else {
      navigatePage = "settings";
      linkLabel = "SETUP";
    }
    return (
      <div className="menu">
        <a href="#" className="menuLink" onClick={() => props.onClick(navigatePage)}>{linkLabel}</a>
        {props.fecConnected ? <div>Connected</div> : <div>Not Connected</div> }
      </div>
    );
}

export default class Header extends React.Component {
    constructor(props) {
      super(props);

    }    
    
    render() {
        return (
            <div className="header">
                <img className="logo" src="./images/logo.png" />
                <VersionInfo />
                <Menu page={this.props.page} onClick={this.props.onClick} 
                  fecConnected={this.props.fecConnected} />
            </div>
        );
    }
}
