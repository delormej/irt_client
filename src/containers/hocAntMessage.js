import * as React from 'react';

export function hocAntMessage(WrappedComponent, message) {
    class HocAntMessage extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                message: message
            };
            this.onData = this.onData.bind(this);
        }

        onData(data) {
            this.setState( {...data} );
        }

        componentDidMount() {
            this.props.ant.on(this.state.message, this.onData);
        }

        componentWillUnmount() {
            this.props.ant.removeListener(this.state.message, this.onData);
        }

        render() {
            const { ant, ...passThroughProps } = this.props;
            return (
                <WrappedComponent {...passThroughProps} {...this.state} />
            );
        }
    }

    HocAntMessage.displayName = `hocAntMessage(${WrappedComponent.name})`;
    
    return HocAntMessage;
}
