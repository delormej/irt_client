'use babel';

import React, { Component } from 'react';
import AmCharts from "@amcharts/amcharts3-react";

// Component which contains the dynamic state for the chart
export default class RideChart extends Component {
  constructor(props) {
    super(props);
    this.bp = this.props.bp;
    this.hrm = this.props.hrm;
    this.onBikePower = this.onBikePower.bind(this);
    this.onHeartRate = this.onHeartRate.bind(this);
    this.state = {
        instantPowerEvents: [],
        instantCadenceEvents: [],
        heartRateEvents: []
    };
  }
  
  onBikePower(data, timestamp) {
    let power = this.state.instantPowerEvents.slice();
    let cadence = this.state.instantCadenceEvents.slice();
    
    power.push({"timestamp": timestamp, "value": data.instantPower});
    cadence.push({"timestamp": timestamp, "value": data.instantCadence});
    
    this.setState( {
        instantPowerEvents: power,
        instantCadenceEvents: cadence
    });
  }

  onHeartRate(value, timestamp) {
    let hrm = this.state.heartRateEvents.slice();

    hrm.push({"timestamp": timestamp, "value": value});
    this.setState({
      heartRateEvents: hrm
    });
  }

  componentDidMount() {
    this.bp.on('standardPowerOnly', this.onBikePower);
    this.bp.on('ctfMainPage', this.onBikePower);
    this.hrm.on('heartRate', this.onHeartRate);
  }

  componentWillUnmount() {
    this.bp.removeListener('standardPowerOnly', this.onBikePower);
    this.bp.removeListener('ctfMainPage', this.onBikePower);
    this.hrm.removeListener('heartRate', this.onHeartRate);
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
        "id": "v1",
        "axisAlpha": 0,
        "position": "left",
        "ignoreAxisWidth": true,
        "fontSize": 40
      }],
      "balloon": {
        "borderThickness": 1,
        "shadowAlpha": 0
      },
      "graphs": [{
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
        "valueField": "value",
        "balloonText": "<span style='font-size:18px;'>[[value]]</span>"
      }],
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
      "dataProvider": this.state.instantPowerEvents
    };

    return (
      <div className="rideChart">
        <AmCharts.React style={{ width: "100%", height: "500px" }} options={config} />
      </div>
    );
  }
}
