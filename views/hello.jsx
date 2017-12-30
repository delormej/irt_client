'use babel';

import React from 'react';

export default class Hello extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ant: props.ant,
            date: new Date()
        };
    }
  
    componentDidMount() {
        this.timerID = setInterval(
            () => this.tick(),
            1000
        );
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    tick() {
        this.setState( {
            date: new Date()
        });
    }

    overrideTick() {
        clearInterval(this.timerID);
        this.setState( {
            date: new Date(2015, 6)
        });        
    }

    render() {
        return (
            <div>
                <h1>Hello! {this.state.ant.antVersion()}</h1>
                <h2>It is: {this.state.date.toLocaleTimeString()}</h2>
            </div>      
        );
    }
}
