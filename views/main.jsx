'use babel';

import React from 'react';
import antlib from '../lib/ant/antlib.js';
import AntFec from '../lib/ant/ant_fec.js';
import AntBikePower from '../lib/ant/ant_bp.js';
import AntBackgroundScanner from '../lib/ant/ant_bg_scanner.js';
import Ride from '../views/ride.jsx';
import Settings from '../views/settings.jsx';
//import Hello from '../views/hello.jsx';

function Menu(props) {
  let navigatePage;
  if (props.page === "settings") {
    navigatePage = "ride";
  }
  else {
    navigatePage = "settings";
  }
  return (
    <div>
      <a href="#" onClick={() => props.onClick(navigatePage)}>Menu</a>
    </div>
    );
}

export default class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: "settings",
      ant: this.initAnt()
    }    
  }

  initAnt() {
    antlib.init();
    let ant = {
      bgScanner: new AntBackgroundScanner(),
      fec: new AntFec(),
      bp: new AntBikePower()
    }
    return ant;
  }

  navigate(page) {
    if (page != "ride" && page != "settings")
      throw new Error("Invalid page: " + page);

    this.setState( {
      currentPage: page
    });
  }

  componentDidCatch(error, info) {
    console.log("ERROR! ", error, info);
  }

  render() {
    if (this.state.currentPage === "ride") {
      return (
        <div>
          <Menu page={this.state.currentPage} onClick={(page) => this.navigate(page)} />
          <Ride ant={this.state.ant} />
        </div>
      );  
    }
    else if (this.state.currentPage === "settings") {
      return (
        <div>
          <Menu page={this.state.currentPage} onClick={(page) => this.navigate(page)} />
          <Settings ant={this.state.ant} />
        </div>
      )
    }
  }
}
