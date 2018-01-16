'use babel';

import React from 'react';
import GeneralSettings from '../views/generalSettings.jsx';
import ColorScale from '../lib/ant/ts/colorScale';

export default class ResistanceLevel extends GeneralSettings {
    constructor(props) {
      super(props);
      this.state.resistanceLevel = 80;
    }

    render() {
        return (
            <div className="resistanceLevelBox">
                <div className="dataLabel">RESISTANCE LEVEL</div>
                <div className="dataValue">{this.state.resistanceLevel + '%'}</div>
                <div className="resistanceLevel" style={this.getResistanceLevelStyle()}></div>
            </div>
        );
    }

    getResistanceLevelStyle() {
        let resistanceLevel = this.state.resistanceLevel;
        let style = {
            /*background: `linear-gradient(to right, rgb(0,255,0) , rgb(255,255,0), rgb(255,0,0))`,*/
            background: `linear-gradient(to right, 
                rgb(${this.getGreenGradient(resistanceLevel)}) , 
                rgb(${this.getYellowGradient(resistanceLevel)}), 
                rgb(${this.getRedGradeint(resistanceLevel)}))`,
            width: `${resistanceLevel}%`  
        }      
        return style;
    }

    getGreenGradient() {
        let r = 0, g = 0, b = 0;
        let value = this.state.resistanceLevel;
        if (value < 33) {
            let percentOfMax = value / 33;
            g = Math.floor(255 * percentOfMax);
        }
        else {
            g = 255;
        }
        return [r,g,b];
    }

    getYellowGradient() {
        let r = 0, g = 0, b = 0;
        let value = this.state.resistanceLevel;
        if (value < 33) {
            r = 255;
            g = 255;
            b = 255;
        }
        else if (value < 66) {

        }

        return [r,g,b];
    }

    getRedGradeint() {
        let r = 0, g = 0, b = 0;
        return [r,g,b];
    }
}
