/*
  Top level component which contains global state including the ANT+ sensors and 
  controls navigation by loading either the "Settings" or "Ride" components.
*/
import * as React from 'react';
import PowerAverager from '../lib/ant/ts/powerAverager';
import Header from './header';
import Ride from './ride';
import Settings from './settings.jsx';
import * as ElectronSettings from 'electron-settings';
import { AntContext, DeviceType, DeviceInfo } from '../lib/ant/ts/ant';

interface StatusMessage {
  type: string;
  message: string;
}

interface MainProps {}

interface MainState {
  status: StatusMessage;
  currentPage: string;
  averageSeconds: number;
  ftp: number;
  maxHeartRateBpm: number;
  antInitialized: boolean;
  fecConnected: boolean;
  bpConnected: boolean;
  hrmConnected: boolean;
}

export default class Main extends React.Component<MainProps, MainState> {
  private firstLoad: boolean = true;
  private ant: AntContext;

  constructor(props) {
    super(props);
    console.log('main.tsx ctor called');
    
    let page: string = this.getCurrentPage(0 /*this.ant.fec.getChannelStatus()*/);
    
    this.state = {
      status: { "type": "info", "message": "" },
      currentPage: page,
      averageSeconds: ElectronSettings.get("averageSeconds", 10),
      ftp: ElectronSettings.get("ftp", undefined),
      maxHeartRateBpm: ElectronSettings.get("maxHeartRateBpm", undefined),
      antInitialized: false,
      fecConnected: false,
      bpConnected: false,
      hrmConnected: false      
    }

    this.handleChange = this.handleChange.bind(this);
    this.onStartup = this.onStartup.bind(this);
    this.onDeviceConnected =this.onDeviceConnected.bind(this);
    this.onDeviceDisconnected =this.onDeviceDisconnected.bind(this);

    this.ant = new AntContext();
  }

  onStartup(): void {
    console.log("stick startup");

    this.setState( {
      antInitialized: true
    });
  }

  onDeviceConnected(deviceType): void {
    if (deviceType === DeviceType.HEART_RATE_DEVICE_TYPE) {
      this.setState( {
        hrmConnected: true
      });
      console.log('hrm connected to main.tsx');
    }
  }

  onDeviceDisconnected(deviceType): void {
    if (deviceType === DeviceType.HEART_RATE_DEVICE_TYPE) {
      this.setState( {
        hrmConnected: false
      });
      console.log('hrm disconnected from main.tsx');
    }
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
    this.ant.on('initialized', this.onStartup);
    this.ant.on('deviceConnected', this.onDeviceConnected);
    this.ant.on('deviceDisconnected', this.onDeviceDisconnected);
  }

  componentWillUnmount() {
    this.ant.removeAllListeners('initialized');
    this.ant.removeAllListeners('deviceConnected');
    this.ant.removeAllListeners('deviceDisconnected'); 
    
    this.ant.stick.close();
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
        <Settings {...this.state}
          firstLoad={this.firstLoad} 
          ftp={this.state.ftp}
          maxHeartRateBpm={this.state.maxHeartRateBpm}
          onChange={this.handleChange}
          ant={this.ant} />
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
              {...this.state}
              fec={this.ant.fec}
              status={this.state.status} />
          { this.getCurrentPageElement() }
        </div>
      );  
      this.firstLoad = false;
      return children;
    }
  }
}
