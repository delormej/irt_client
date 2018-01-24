'use babel';

import React from 'react';
import Header from '../views/header.jsx';

export default class ErrorBoundry extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        status: { "type": "info", "message": "" } 
      };
    }  

    componentDidCatch(error, info) {
        console.log("ERROR! ", error, info);
        this.setState( {
            status: { "type": "error", "message": error.message } 
        });
    }

    render() {
        if (this.state.status.type === "error")
            return (<Header status={this.state.status} />);
        else
            return this.props.children;
    }
}
