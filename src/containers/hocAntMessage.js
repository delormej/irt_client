import * as React from 'react';

export function hocAntMessage(WrappedComponent, message) {
    class HocAntMessage extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                message: message
            };
            this.onData = this.onData.bind(this);
            this._isMounted = false;
        }

        onData(data) {
            // While this is generally an anti-pattern, it's required here if a event
            // gets fired from Ant while the component is unmounting.
            if (this._isMounted) {
                this.setState( {...data} );
            }
        }

        componentDidMount() {
            this._isMounted = true;
            this.props.ant.on(this.state.message, this.onData);
        }

        componentWillUnmount() {
            this._isMounted = false;
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
