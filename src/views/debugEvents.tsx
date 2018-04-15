import * as React from 'react';

interface RideChartProps {
  events: any[];
}

export default class DebugEvents extends React.Component<RideChartProps> {

    constructor(props) {
      super(props);
    }
  
    render() : JSX.Element {
        if (this.props.events != null) {
          return <div>length[{this.props.events.length}]: {this.props.events[this.props.events.length-1].timestamp}</div>
        }
        else
          return <div>nothing yet</div>;
    }
}
