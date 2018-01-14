'use babel';

import React from 'react';
import GeneralSettings from '../views/generalSettings.jsx';

export default class ResistanceLevel extends GeneralSettings {
    constructor(props) {
      super(props);
    }

    getResistanceLevelStyle(resistanceLevel) {
        let style = {
            background: `linear-gradient(to right, green , yellow, red)`,
            width: `${resistanceLevel}%`  
        }      
        return style;
    }

    render() {
        return (
            <div className="resistanceLevelBox">
                <div className="dataLabel">RESISTANCE LEVEL</div>
                <div className="dataValue">{this.state.resistanceLevel}</div>
                <div className="resistanceLevel" style={this.getResistanceLevelStyle(this.state.resistanceLevel)}></div>
            </div>
        );
    }
}
