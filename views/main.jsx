'use babel';

import React from 'react';
import antlib from '../lib/ant/antlib.js';
import AntFec from '../lib/ant/ant_fec.js';
import AntBikePower from '../lib/ant/ant_bp.js';
import HeartRateMonitor from '../lib/ant/antDeviceProfile.js';
import PowerAverager from '../lib/ant/powerAverager.js';
import AntBackgroundScanner from '../lib/ant/ant_bg_scanner.js';
import Header from '../views/header.jsx';
import Ride from '../views/ride.jsx';
import Settings from '../views/settings.jsx';
import ElectronSettings from 'electron-settings';

const ANT_BG_CHANNEL_ID = 0;
const ANT_FEC_CHANNEL_ID = 1;
const ANT_BP_CHANNEL_ID = 2;
const ANT_HRM_CHANNEL_ID = 3;

export default class Main extends React.Component {
  constructor(props) {
    super(props);
    let ant = this.initAnt();
    let page = this.getCurrentPage(ant.fec);
    this.state = {
      status: { "type": "info", "message": "" },
      currentPage: page,
      ant: ant,
      bpDevice: { deviceId: 0, status: 0 },
      fecDevice: { deviceId: 0, status: 0 },
      hrmDevice: { deviceId: 0, status: 0 }
    }    
    this.onFecChannelStatus = this.onFecChannelStatus.bind(this);
    this.onBpChannelStatus = this.onBpChannelStatus.bind(this);
  }

  initAnt() {
    antlib.init();
    let bp = new AntBikePower();
    let fec = new AntFec();
    let bpAverager = new PowerAverager(bp);
    let hrm = new HeartRateMonitor();
    hrm.openChannel(ANT_HRM_CHANNEL_ID);
    let ant = {
      bgScanner: new AntBackgroundScanner(),
      fec: fec,
      bp: bp,
      bpAverager: bpAverager,
      hrm: hrm
    }
    return ant;
  }

  getCurrentPage(fec) {
    let page;
    if (fec.getChannelStatus() == antlib.STATUS_TRACKING_CHANNEL)
      page = "ride";
    else 
      page = "settings";
    return page;  
  }

  componentDidMount() {
    this.state.ant.fec.on('channel_status', this.onFecChannelStatus);
    this.state.ant.bp.on('channel_status', this.onBpChannelStatus);
  }

  componentWillUnmount() {
    this.state.ant.fec.removeListener('channel_status', this.onFecChannelStatus);
    this.state.ant.bp.removeListener('channel_status', this.onBpChannelStatus);
  }

  getDeviceKey(deviceType) {
    let key;
    switch (deviceType) {
      case antlib.BIKE_POWER_DEVICE_TYPE:
        key = "bpDevice";
        break;
      case antlib.FEC_DEVICE_TYPE:
        key = "fecDevice";
        break;
      case antlib.HEART_RATE_DEVICE_TYPE:
        key = "hrmDevice";
        break;
      default:
        key = null;
        break;
    }
    return key;
  }

  onBpChannelStatus(status, deviceId) {
    this.onChannelStatus(antlib.BIKE_POWER_DEVICE_TYPE, status, deviceId);
  }

  onFecChannelStatus(status, deviceId) {
    this.onChannelStatus(antlib.FEC_DEVICE_TYPE, status, deviceId);
  }

  onChannelStatus(deviceType, status, deviceId) {
    const deviceKey = this.getDeviceKey(deviceType);
    if (deviceKey == null)
      return;
    this.setState( {
      [deviceKey]: { "deviceId": deviceId, "status": status }
    });
    if (status == antlib.STATUS_TRACKING_CHANNEL) {
      ElectronSettings.set(deviceKey+'Id', deviceId);
    }    
  }

  navigate(page) {
    if (page != "ride" && page != "settings")
      throw new Error("Invalid page: " + page);
    this.setState( {
      currentPage: page
    });
  }

  render() {
    return (
      <div>
        <Header page={this.state.currentPage} onClick={(page) => this.navigate(page)}
            fecConnected={this.state.fecDevice.status == antlib.STATUS_TRACKING_CHANNEL}
            status={this.state.status} />
        { (this.state.currentPage === "ride") ? 
            <Ride ant={this.state.ant} /> :
            <Settings ant={this.state.ant} 
              bpDevice={this.state.bpDevice}
              fecDevice={this.state.fecDevice}
              hrmDevice={this.state.hrmDevice} />
        }
      </div>
    );  
  }
}
