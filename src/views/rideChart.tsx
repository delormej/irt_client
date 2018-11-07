
import * as React from 'react';
import * as EventEmitter from 'events';
import * as AmCharts from "@amcharts/amcharts3-react";

interface RideChartProps {
  hrm: EventEmitter;
  fec: EventEmitter;
  bp: EventEmitter;
  bpAverager: any;
  averageSeconds: number;
}

interface ChartEvent {
  timestamp: number;
  heartRate: number;
  watts: number;
  targetWatts: number;
  averageWatts: number;
  servoPosition: number;
}

interface RideChartState {
  events: ChartEvent[];
}

export default class RideChart extends React.Component<RideChartProps, RideChartState> {
  private current: ChartEvent;
  private timer: NodeJS.Timer;
  private filterGeneration: number = 0;
  private getting: boolean = false;

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

    this.startStateUpdates();
  }

  componentWillUnmount() {
    this.props.bp.removeListener('standardPowerOnly', this.onBikePower);
    this.props.bp.removeListener('ctfMainPage', this.onBikePower);
    this.props.hrm.removeListener('heartRate', this.onHeartRate);
    this.props.fec.removeListener('irtExtraInfo', this.onIrtExtraInfo);

    clearTimeout(this.timer);
  }

  filterEvents(element: any, index: number, array: Array<ChartEvent>): boolean{
    const BATCH_SIZE: number = 250;
    let start: number = (BATCH_SIZE / 2) * this.filterGeneration;
    let end: number = start + BATCH_SIZE;
    let filter: boolean;
    if (index > start && index <= end) {
      filter = (index % 2 == 0);
    }
    else
      filter = true;

    if (!filter)
      console.log("filtered out:", index, array[index].timestamp, start, end, this.filterGeneration);
    
    return filter;
  }

  sortByTimestamp(eventA: ChartEvent, eventB: ChartEvent) {
    if (eventA.timestamp > eventB.timestamp) return 1;
    if (eventA.timestamp == eventB.timestamp) return 0;
    if (eventA.timestamp < eventB.timestamp) return -1;
  }

  // DEBUG ONLY
  generateEvents(): ChartEvent[] {
    let events: ChartEvent[] = new Array<ChartEvent>();
    let event: ChartEvent = {
      timestamp: 0,
      heartRate: 0,
      watts: 0,
      targetWatts: 0,
      averageWatts: 0,
      servoPosition: 0
    };    

    for (let i = 0; i < 2240; i++) {
      let newEvent: ChartEvent = JSON.parse(JSON.stringify(event));
      newEvent.timestamp = i * 0.001;
      newEvent.heartRate = 82;
      newEvent.watts = i % 512;
      events.push(newEvent);
    }

    return events;
  }

  getEvents(): ChartEvent[] {
    this.getting = true;
    const MAX_EVENTS: number = 2250;
    const ITERATIONS: number = 16;
    let events: ChartEvent[] = this.state.events.slice();
    events.push(this.current);
    // DEBUG ONLY
    // if (this.state.events == null || this.state.events.length == 0)
    //   return this.generateEvents();
    // END DEBUG
    if (this.state.events.length > MAX_EVENTS)  {
      events = events.filter(this.filterEvents, this);
      this.filterGeneration = (this.filterGeneration + 1) % ITERATIONS;
      //console.log(JSON.stringify(events));
    } 
    return events;
  }

  pauseStateUpdates() : void {
    clearInterval(this.timer);
  }

  startStateUpdates() : void {
    const TIMEOUT_MS = 1000;
    this.timer = setInterval(this.updateState, TIMEOUT_MS);
  }

  updateState() {  
    if (this.getting)
      return;
    this.setState( {
      events: this.getEvents()
    });
    console.log("Event len: ", this.state.events.length);
    this.getting = false;
  }

  labelFunction(valueText, serialDataItem, categoryAxis) {
    var seconds = serialDataItem.dataContext.timestamp;
    var minutes = (seconds / 60).toFixed(0);
    return minutes;
  }

  render() {
    const config = {
      "type": "serial",
      "theme": "light",
      "marginRight": 40,
      "marginLeft": 80,
      "autoMarginOffset": 20,
      "mouseWheelZoomEnabled": false,
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
      "graphs": [
        {
        "id": "g1",
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
      "valueScrollbar":{
        "oppositeAxis": false,
        "offset":50,
        "scrollbarHeight":10
      },
      "categoryField": "timestamp",
      "categoryAxis": {
        "parseDates": false,
        "dashLength": 1,
        "minorGridEnabled": false,
        "labelsEnabled": true,
        "autoGridCount": true,
        "labelFunction": this.labelFunction
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
