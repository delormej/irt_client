import * as React from 'react';
import * as EventEmitter from 'events';
import * as antlib from '../lib/ant/antlib.js';
import * as AntFec from '../lib/ant/ant_fec.js';
import * as AntBikePower from '../lib/ant/ant_bp.js';
import HeartRateMonitor from '../lib/ant/ts/heartRateMonitor';
import * as PowerAverager from '../lib/ant/powerAverager.js';
import * as AntBackgroundScanner from '../lib/ant/ant_bg_scanner.js';
import Header from './header';
import Ride from './ride';
import Settings from './settings.jsx';
import * as ElectronSettings from 'electron-settings';

interface StatusMessage {
  type: string;
  message: string;
}

interface AntProfile extends EventEmitter {
  getChannelStatus(): number;
}

export interface AntObjects {
    bgScanner: EventEmitter;
    fec: AntProfile; 
    bp: AntProfile;
    bpAverager: Object;
    hrm: AntProfile;
}

interface MainProps {}

interface MainState {
  status: StatusMessage;
  currentPage: string;
  averageSeconds: number;
  ftp: number;
  maxHeartRateBpm: number;
}

export default class Main extends React.Component<MainProps, MainState> {
  private firstLoad: boolean = true;
  private ant: AntObjects;

  constructor(props) {
    super(props);
    this.initAnt();
    let page: string = this.getCurrentPage(this.ant.fec.getChannelStatus());
    
    this.state = {
      status: { "type": "info", "message": "" },
      currentPage: page,
      averageSeconds: ElectronSettings.get("averageSeconds", 10),
      ftp: ElectronSettings.get("ftp", undefined),
      maxHeartRateBpm: ElectronSettings.get("maxHeartRateBpm", undefined)
    }

    this.handleChange = this.handleChange.bind(this);
  }

  initAnt(): void {
    antlib.init();
    let bp: AntProfile = new AntBikePower();
    this.ant = {
      bgScanner: new AntBackgroundScanner(),
      fec: new AntFec(),
      bp: bp,
      bpAverager: new PowerAverager(bp),
      hrm: new HeartRateMonitor()
    };
  }

  getCurrentPage(channelStatus: number): string {
    let page: string;
    if (channelStatus == antlib.STATUS_TRACKING_CHANNEL)
      page = "ride";
    else 
      page = "settings";
    return page;  
  }

  componentDidMount() {
    this.ant.fec.on('channel_status', this.onChannelStatus.bind(this, 'fecDevice'));
    this.ant.bp.on('channel_status', this.onChannelStatus.bind(this, 'bpDevice'));
    this.ant.hrm.on('channel_status', this.onChannelStatus.bind(this, 'hrmDevice'));
  }

  componentWillUnmount() {
    this.ant.fec.removeAllListeners('channel_status');
    this.ant.bp.removeAllListeners('channel_status');
    this.ant.hrm.removeAllListeners('channel_status');
  }

  onChannelStatus(deviceKey, status, deviceId) {
    this.setState( {
      [deviceKey]: status
    })
  }

  handleChange(name, value) {
      this.setState({
        [name]: value
    });
  }

  navigate(page) {
    if (page != "ride" && page != "settings")
      throw new Error("Invalid page: " + page);
    this.setState( {
      currentPage: page
    });
  }

  getCurrentPageElement(): JSX.Element {
    if (this.state.currentPage === "ride") 
      return (
        <Ride ant={this.ant} 
          averageSeconds={this.state.averageSeconds}
          ftp={this.state.ftp}
          maxHeartRateBpm={this.state.maxHeartRateBpm} /> 
      );
    else 
      return (
        <Settings firstLoad={this.firstLoad} 
          fecConnected={this.ant.fec.getChannelStatus() == antlib.STATUS_TRACKING_CHANNEL}
          ftp={this.state.ftp}
          maxHeartRateBpm={this.state.maxHeartRateBpm}
          onChange={this.handleChange}
          ant={this.ant} />
      );
  }    

  render(): JSX.Element {
    let children = (
      <div>
        <Header page={this.state.currentPage} onClick={(page) => this.navigate(page)}
            fec={this.ant.fec}
            fecConnected={this.ant.fec.getChannelStatus() == antlib.STATUS_TRACKING_CHANNEL}
            bpConnected={this.ant.bp.getChannelStatus() == antlib.STATUS_TRACKING_CHANNEL}
            hrmConnected={this.ant.hrm.getChannelStatus() == antlib.STATUS_TRACKING_CHANNEL}
            status={this.state.status} />
        {this.getCurrentPageElement()}
      </div>
    );  
    this.firstLoad = false;
    return children;
  }
}
