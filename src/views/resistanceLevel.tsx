import * as React from 'react';
import ColorScale from '../lib/ant/ts/colorScale';

interface ResistanceLevelProps {
    resistanceLevel: number;
}

export default class ResistanceLevel extends React.Component<ResistanceLevelProps> {
    constructor(props) {
      super(props);
    }

    render(): JSX.Element {
        return (
            <div className="resistanceLevelBox">
                <div className="dataLabel">RESISTANCE LEVEL</div>
                <div className="dataValue">{this.formatResistanceLevel(this.props.resistanceLevel)}</div>
                <div className="resistanceLevel" style={this.getResistanceLevelStyle()}></div>
            </div>
        );
    }

    formatResistanceLevel(level): string {
        let formatted: string = "";
        let value: number = level * 100;
        if (value % 1 == 0)
            formatted = value + '%';
        else
            formatted = (value).toFixed(1) + '%';
        return formatted;
    }

    getResistanceLevelStyle() {
        let style = {
            /*background: `linear-gradient(to right, rgb(0,255,0) , rgb(255,255,0), rgb(255,0,0))`,*/
            background: `linear-gradient(to right, 
                rgb(${this.getGreenGradient()}) , 
                rgb(${this.getYellowGradient()}), 
                rgb(${this.getRedGradeint()}))`,
            //width: `${resistanceLevel}%`  
            width: '100%'  
        }      
        return style;
    }

    getGreenGradient(): number[] {
        let r = 0, g = 0, b = 0;
        let value = this.props.resistanceLevel;
        if (value < 0.33) {
            let percentOfMax = value / 0.33;
            g = Math.floor(255 * percentOfMax);
        }
        else {
            g = 255;
        }
        return [r,g,b];
    }

    getYellowGradient(): number[] {
        let r = 255, g = 255, b = 255;
        let value = this.props.resistanceLevel;
        if (value > 0.33) {
            let percentOfMax = value / 0.66;
            b -= Math.floor(255 * percentOfMax);
        }
        return [r,g,b];
    }

    getRedGradeint(): number[] {
        let r = 255, g = 255, b = 255;
        let value = this.props.resistanceLevel;
        if (value >= 0.66) {
            let percentOfMax = value / 1.0;
            let color = Math.floor(255 * percentOfMax);
            b -= color;
            g -= color;
        }        
        return [r,g,b];
    }
}
