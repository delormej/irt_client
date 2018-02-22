
import * as React from 'react';
import * as EventEmitter from 'events';
import * as AmCharts from "@amcharts/amcharts3-react";

interface RideChartProps {
  hrm: EventEmitter;
  fec: EventEmitter;
  bp: EventEmitter;
  bpAverager: any;
  averageSeconds: Number;
}

interface ChartEvent {
  timestamp: Number;
  heartRate: Number;
  watts: Number;
  targetWatts: Number;
  averageWatts: Number;
  servoPosition: Number;
}

interface RideChartState {
  events: ChartEvent[];
}

export default class RideChart extends React.Component<RideChartProps, RideChartState> {
  private current: ChartEvent;
  private timer: NodeJS.Timer;

  constructor(props) {
    super(props);

    this.state = { events: [] };

    this.current = {
      timestamp: 0,
      heartRate: 0,
      watts: 0,
      targetWatts: 0,
      averageWatts: 0,
      servoPosition: 0
    };

    this.onBikePower = this.onBikePower.bind(this);
    this.onHeartRate = this.onHeartRate.bind(this);
    this.onIrtExtraInfo = this.onIrtExtraInfo.bind(this);
    this.updateState = this.updateState.bind(this);
  }
  
  onBikePower(data, timestamp) {
    this.current.timestamp = timestamp;
    this.current.watts = data.instantPower;
    this.current.averageWatts = this.props.bpAverager.getAverage(this.props.averageSeconds);
  }

  onHeartRate(value, timestamp) {
    this.current.timestamp = timestamp;
    this.current.heartRate = value;
  }

  onIrtExtraInfo(data, timestamp) {
    this.current.timestamp = timestamp;
    this.current.servoPosition = data.servoPosition;
    this.current.targetWatts = data.target;
  }

  componentDidMount() {
    this.props.bp.on('standardPowerOnly', this.onBikePower);
    this.props.bp.on('ctfMainPage', this.onBikePower);
    this.props.hrm.on('heartRate', this.onHeartRate);
    this.props.fec.on('irtExtraInfo', this.onIrtExtraInfo);

    const TIMEOUT_MS = 1000;
    this.timer = setInterval(this.updateState, TIMEOUT_MS);
  }

  componentWillUnmount() {
    this.props.bp.removeListener('standardPowerOnly', this.onBikePower);
    this.props.bp.removeListener('ctfMainPage', this.onBikePower);
    this.props.hrm.removeListener('heartRate', this.onHeartRate);
    this.props.fec.removeListener('irtExtraInfo', this.onIrtExtraInfo);

    clearTimeout(this.timer);
  }

  updateState() {
    let events: ChartEvent[] = this.state.events.slice();
    events.push(this.current);
    this.setState( {
      events: events
    });
  }

  render() {
    const config = {
      "type": "serial",
      "theme": "light",
      "marginRight": 40,
      "marginLeft": 80,
      "autoMarginOffset": 20,
      "mouseWheelZoomEnabled": true,
      "valueAxes": [{
        "id": "watts",
        "axisAlpha": 0,
        "position": "left",
        "ignoreAxisWidth": true,
        "fontSize": 40
        },
        {
          "id": "heartRate",
          "position": "right",
          "fontSize": 20
        }
      ],
      "balloon": {
        "borderThickness": 1,
        "shadowAlpha": 0
      },
      "graphs": [
        {
        "id": "g1",
        "balloon":{
          "drop": true,
          "adjustBorderColor": false,
          "color":"#ffffff"
        },
        "bullet": "round",
        "bulletBorderAlpha": 1,
        "bulletColor": "#FFFFFF",
        "bulletSize": 5,
        "hideBulletsCount": 50,
        "lineThickness": 2,
        "title": "red line",
        "useLineColorForBulletBorder": true,
        "valueField": "watts",
        "valueAxis": "watts",
        "balloonText": "<span style='font-size:18px;'>[[watts]]</span>"
        },
        {
          "valueField": "averageWatts",
          "valueAxis": "watts"
        },
        {
          "valueField": "targetWatts",
          "fillAlphas": 0.2,
          "lineColor": "lightblue",
          "valueAxis": "watts"
        },
        {
          "valueAxis": "heartRate",
          "valueField": "heartRate"
        }
      ],
      "chartCursor": {
        "pan": true,
        "valueLineEnabled": true,
        "valueLineBalloonEnabled": true,
        "cursorAlpha":1,
        "cursorColor":"#258cbb",
        "limitToGraph":"g1",
        "valueLineAlpha":0.2,
        "valueZoomable": true
      },
      "valueScrollbar":{
        "oppositeAxis": false,
        "offset":50,
        "scrollbarHeight":10
      },
      "categoryField": "timestamp",
      "categoryAxis": {
        "parseDates": false,
        "dashLength": 1,
        "minorGridEnabled": true,
        "labelsEnabled": false
      },
      "dataProvider": this.state.events
    };

    return (
      <div className="rideChart">
        <AmCharts.React style={{ width: "100%", height: "500px" }} options={config} />
      </div>
    );
  }
}
