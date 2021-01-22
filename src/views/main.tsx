/*
  Top level component which contains global state including the ANT+ sensors and 
  controls navigation by loading either the "Settings" or "Ride" components.
*/
import * as React from 'react';
import Header from './header';
import Ride from './ride';
import Settings from './settings.jsx';
import * as ElectronSettings from 'electron-settings';
import { AntProvider, AntContext } from '../lib/ant/antProvider';

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
}

export default class Main extends React.Component<MainProps, MainState> {
  private firstLoad: boolean = true;
  // context!: React.ContextType<typeof AntProvider>;
  static contextType = AntContext;

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
    }

    this.handleChange = this.handleChange.bind(this);
  }

  getCurrentPage(channelStatus: number): string {
    let page: string;
      page = "settings";
    return page;  
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
        <div>Ride</div>
        // <Ride ant={this.ant} 
        //   averageSeconds={this.state.averageSeconds}
        //   ftp={this.state.ftp}
        //   maxHeartRateBpm={this.state.maxHeartRateBpm} /> 
      );
    else 
      return (
        <div>empty</div>
        // <Settings {...this.state}
        //   firstLoad={this.firstLoad} 
        //   ftp={this.state.ftp}
        //   maxHeartRateBpm={this.state.maxHeartRateBpm}
        //   onChange={this.handleChange} />
      );
  }    

  render(): JSX.Element {
    if (!this.context.antInitialized) {
      return (<div>Initializing ANT...</div>);
    }
    else {
      return (
        <div>
          <Header page={this.state.currentPage} onClick={(page) => this.navigate(page)}
              {...this.state}
              status={this.state.status} 
              // TODO: these can be fetched from context, REMOVE from here.
              fec={this.context.ant.fec}
              fecConnected={this.context.fecConnected}
              bpConnected={this.context.bpConnected}
              hrmConnected={this.context.hrmConnected}        
          />
          { this.getCurrentPageElement() }
        </div>
      );  
    }
  }
}
