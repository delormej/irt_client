/*
  Top level component which contains global state including the ANT+ sensors and 
  controls navigation by loading either the "Settings" or "Ride" components.
*/
import * as React from 'react';
import { EventEmitter } from 'events';
import PowerAverager from '../lib/ant/ts/powerAverager';
import Header from './header';
import Ride from './ride';
import Settings from './settings.jsx';
import * as ElectronSettings from 'electron-settings';
import { GarminStick3, BicyclePowerSensor, HeartRateSensor, FitnessEquipmentSensor } from 'ant-plus';

interface StatusMessage {
  type: string;
  message: string;
}

interface AntProfile extends EventEmitter {
  getChannelStatus(): number;
}

export interface AntObjects {
    fec: FitnessEquipmentSensor; 
    bp: BicyclePowerSensor;
    bpAverager: Object;
    hrm: HeartRateSensor;
}

interface MainProps {}

interface MainState {
  status: StatusMessage;
  currentPage: string;
  averageSeconds: number;
  ftp: number;
  maxHeartRateBpm: number;
  antInitialized: boolean;
}

export default class Main extends React.Component<MainProps, MainState> {
  private firstLoad: boolean = true;
  private stick: GarminStick3;
  private ant: AntObjects;

  constructor(props) {
    super(props);
    
    let page: string = this.getCurrentPage(0 /*this.ant.fec.getChannelStatus()*/);
    
    this.state = {
      status: { "type": "info", "message": "" },
      currentPage: page,
      averageSeconds: ElectronSettings.get("averageSeconds", 10),
      ftp: ElectronSettings.get("ftp", undefined),
      maxHeartRateBpm: ElectronSettings.get("maxHeartRateBpm", undefined),
      antInitialized: false
    }

    this.handleChange = this.handleChange.bind(this);
    this.onStartup = this.onStartup.bind(this);

    this.initAnt();
  }

  onStartup(): void {
    console.log("stick startup");

    this.ant = {
      fec: new FitnessEquipmentSensor(this.stick),
      bp: new BicyclePowerSensor(this.stick),
      bpAverager: null, //new PowerAverager(bp),
      hrm: new HeartRateSensor(this.stick)
    };

    this.setState( {
      antInitialized: true
    });
  }

  initAnt(): void {
    this.stick = new GarminStick3();
    
    this.stick.on('startup', this.onStartup);
    this.stick.on('read', (data) => { 
      console.log("data", data) } 
    );

    this.stick.openAsync( (err) => {
      if (err) {
        console.log("Error trying to open Garmin stick:", err);
        return;
      }

      console.log("stick open");
    });
  }

  getCurrentPage(channelStatus: number): string {
    let page: string;
    // if (channelStatus == antlib.STATUS_TRACKING_CHANNEL)
    //   page = "ride";
    // else 
      page = "settings";
    return page;  
  }

  componentDidMount() {
    // this.ant.fec.on('channel_status', this.onChannelStatus.bind(this, 'fecDevice'));
    // this.ant.bp.on('channel_status', this.onChannelStatus.bind(this, 'bpDevice'));
    // this.ant.hrm.on('channel_status', this.onChannelStatus.bind(this, 'hrmDevice'));
  }

  componentWillUnmount() {
    // this.ant.fec.removeAllListeners('channel_status');
    // this.ant.bp.removeAllListeners('channel_status');
    // this.ant.hrm.removeAllListeners('channel_status');
    this.stick.close();
  }

  onChannelStatus(deviceKey, status, deviceId) {
    this.setState( {
      [deviceKey]: status
    } as any)
  }

  handleChange(name, value) {
      this.setState({
        [name]: value
    } as any);
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
          fecConnected={false /*this.ant.fec.getChannelStatus() == antlib.STATUS_TRACKING_CHANNEL*/}
          ftp={this.state.ftp}
          maxHeartRateBpm={this.state.maxHeartRateBpm}
          onChange={this.handleChange}
          ant={this.ant}
          stick={this.stick} />
      );
  }    

  render(): JSX.Element {
    if (!this.state.antInitialized) {
      return <div>Initializing ANT...</div>;
    } 
    else {
      let children = (
        <div>
          <Header page={this.state.currentPage} onClick={(page) => this.navigate(page)}
              fec={this.ant.fec}
              fecConnected={false /*this.ant.fec.getChannelStatus() == antlib.STATUS_TRACKING_CHANNEL*/}
              bpConnected={false /*this.ant.bp.getChannelStatus() == antlib.STATUS_TRACKING_CHANNEL*/}
              hrmConnected={false /*this.ant.hrm.getChannelStatus() == antlib.STATUS_TRACKING_CHANNEL*/}
              status={this.state.status} />
          { this.getCurrentPageElement() }
        </div>
      );  
      this.firstLoad = false;
      return children;
    }
  }
}
