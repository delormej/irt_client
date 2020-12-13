import * as React from 'react';

export interface RideDataProps {
    class: string;
    label: string;
    value: string;
    style?: React.CSSProperties;
}

export default class RideDataComponent extends React.Component<RideDataProps> {
    constructor(props: RideDataProps) {
      super(props);
    }

    render(): JSX.Element {
        return (
            <div className={this.props.class}>
              <div className="dataLabel">{this.props.label}</div>
              <div className="dataValue" style={this.props.style}>{this.props.value}</div>
            </div>
        );      
    }
}  
  