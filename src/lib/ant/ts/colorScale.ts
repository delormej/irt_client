
interface ColorStyle {
    color: string;
}

export default class ColorScale {

    static getScaledRgb(value: number, maxValue: number): Array<number> {
        let percentOfMax: number = value / maxValue;
        let r:number = 0, g:number = 0, b:number = 0;
        if (percentOfMax < 0.50) {
            r = 0;
            g = 255;
        } else if (percentOfMax >= .75) {
            r = 255;
            g = Math.floor(255 * (1-(percentOfMax-0.75)/0.25));
        } else if (percentOfMax >= 0.50) {
            r = Math.floor(255 * ((percentOfMax-0.5)/0.25));
            g = 255;
        }
        let rgb: Array<number> = [r, g, b];
        return rgb;
    }

    static getColorStyle(value: number, maxValue: number): ColorStyle {
        let rgb: Array<number> = ColorScale.getScaledRgb(value, maxValue);
        let color: ColorStyle = { color: `rgb(${rgb})` };
        return color; 
    }
}