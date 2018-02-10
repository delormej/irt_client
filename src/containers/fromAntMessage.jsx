'use babel';

import React from 'react';

function fromAntMessage(WrappedComponent, message) {
    return class extends React.Component {
        constructor(props) {
            super(props);
            this.state = { message: null };
            this.ant = props.ant;
            this.onMessage = this.onMessage.bind(this);
        }

        componentDidMount() {
            this.ant.on(message, this.onMessage);
        }
    
        componentWillUnmount() {
            this.ant.removeListener(message, this.onMessage);
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
