'use babel';

import React from 'react';

function fromAntMessage(WrappedComponent, message) {
    return class extends React.Component {
        constructor(props) {
            super(props);
            this.state = { message: null };
            this.fec = props.fec;
            this.onMessage = this.onMessage.bind(this);
        }

        componentDidMount() {
            this.fec.on(message, this.onMessage);
        }
    
        componentWillUnmount() {
            this.fec.removeListener(message, this.onMessage);
        }    
    
        onMessage(data, timestamp) {
            this.setState( {
                data: data
            });
        }

        render() {
            return (
                <WrappedComponent data={this.state.data} {...this.props} /> 
            );
        }
    }
}

export default fromAntMessage;
