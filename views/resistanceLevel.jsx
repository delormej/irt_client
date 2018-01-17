'use babel';

import React from 'react';
import GeneralSettings from '../views/generalSettings.jsx';
import ColorScale from '../lib/ant/ts/colorScale';

export default class ResistanceLevel extends GeneralSettings {
    constructor(props) {
      super(props);
      this.state.resistanceLevel = 0;
    }

    render() {
        return (
            <div className="resistanceLevelBox">
                <div className="dataLabel">RESISTANCE LEVEL</div>
                <div className="dataValue">{this.formatResistanceLevel(this.state.resistanceLevel)}</div>
                <div className="resistanceLevel" style={this.getResistanceLevelStyle()}></div>
            </div>
        );
    }

    formatResistanceLevel(level) {
        let formatted = "";
        let value = level * 100;
        if (value % 1 == 0)
            formatted = value + '%';
        else
            formatted = (value).toFixed(1) + '%';
        return formatted;
    }

    getResistanceLevelStyle() {
        let resistanceLevel = this.state.resistanceLevel;
        let style = {
            /*background: `linear-gradient(to right, rgb(0,255,0) , rgb(255,255,0), rgb(255,0,0))`,*/
            background: `linear-gradient(to right, 
                rgb(${this.getGreenGradient(resistanceLevel)}) , 
                rgb(${this.getYellowGradient(resistanceLevel)}), 
                rgb(${this.getRedGradeint(resistanceLevel)}))`,
            //width: `${resistanceLevel}%`  
            width: '100%'  
        }      
        return style;
    }

    getGreenGradient() {
        let r = 0, g = 0, b = 0;
        let value = this.state.resistanceLevel;
        if (value < 0.33) {
            let percentOfMax = value / 0.33;
            g = Math.floor(255 * percentOfMax);
        }
        else {
            g = 255;
        }
        return [r,g,b];
    }

    getYellowGradient() {
        let r = 255, g = 255, b = 255;
        let value = this.state.resistanceLevel;
        if (value > 0.33) {
            let percentOfMax = value / 0.66;
            b -= Math.floor(255 * percentOfMax);
        }
        return [r,g,b];
    }

    getRedGradeint() {
        let r = 255, g = 255, b = 255;
        let value = this.state.resistanceLevel;
        if (value >= 0.66) {
            let percentOfMax = value / 1.0;
            let color = Math.floor(255 * percentOfMax);
            b -= color;
            g -= color;
        }        
        return [r,g,b];
    }
}
