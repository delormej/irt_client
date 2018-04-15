
import * as React from 'react';
import * as AmCharts from "@amcharts/amcharts3-react";

interface RideChartProps {
  events: any[];
}

export default class RideChart extends React.Component<RideChartProps> {

  constructor(props) {
    super(props);
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
        "labelsEnabled": false
      },
      "dataProvider": this.props.events
    };

    return (
      <div className="rideChart">
        <AmCharts.React style={{ width: "100%", height: "500px" }} options={config} />
      </div>
    );
  }
}
