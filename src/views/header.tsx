import * as React from 'react';
import VersionInfo from './versionInfo.jsx';
import AntDevicesConnectedStatus from './deviceConnectedStatus';
import TargetPowerStatus from './targetPowerStatus';
import { EventEmitter } from 'events';
import { hocAntMessage } from '../containers/hocAntMessage';
import { AntContext } from '../lib/ant/antProvider';

const DevicesConnectedFromAnt = hocAntMessage(['specificTrainerData', 'irtExtraInfo'])(AntDevicesConnectedStatus);
const TargetPowerStatusFromAnt = hocAntMessage(['specificTrainerData'])(TargetPowerStatus);

function Menu(props): JSX.Element {
    let navigatePage;
    let linkLabel;
    if (props.page === "settings") {
      navigatePage = "ride";
      linkLabel = "RIDE";
    }
    else if (props.page === "ride") {
      navigatePage = "settings";
      linkLabel = "SETUP";
    }
    else 
      return null; // don't try to show menu in an error condition.
    return (
      <div className="menu">
        <a href="#" className="menuLink" onClick={() => props.onClick(navigatePage)}>{linkLabel}</a>
        <DevicesConnectedFromAnt ant={props.ant} />
      </div>
    );
}

function Status(props): JSX.Element {
  let className = "status";
  if (props.type === "error")
    className += " error";

  return (
    <div className={className}>
      <span>{props.message}</span>
    </div>
  );
}

interface HeaderProps {
  status: {message: string, type: string};
  page: string;
  onClick: { (page: string): void };
}

export default class Header extends React.Component<HeaderProps> {
  static contextType = AntContext;
  constructor(props) {
    super(props);
  }    
  
  render(): JSX.Element {
    return (
        <div className="header">
            <img className="logo" src="./images/logo.png" />
            <VersionInfo />
            <Status type={this.props.status.type} message={this.props.status.message} />
            <TargetPowerStatusFromAnt ant={this.context.ant.fec} targetPowerLimits={0} />
            <Menu page={this.props.page} onClick={this.props.onClick} ant={this.context.ant.fec} />;
        </div>
    );
  }
}
