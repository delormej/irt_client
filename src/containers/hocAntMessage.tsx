//
// High Order Component based on this: https://dev.to/danhomola/react-higher-order-components-in-typescript-made-simple 
//
import * as React from 'react';
import * as EventEmitter from 'events';

// State of the HOC you need to compute the InjectedProps
interface State {
    data: any;
}

// Props you want the resulting component to take (besides the props of the wrapped component)
interface ExternalProps {
    ant: EventEmitter;
}

// Props the HOC adds to the wrapped component
export interface InjectedProps {
    data: any;
}

export const hocAntMessage = (message: string) =>
    <TOriginalProps extends {}>(
        Component: (React.ComponentClass<TOriginalProps & InjectedProps>
            | React.StatelessComponent<TOriginalProps & InjectedProps>)
    ) => {
        type ResultProps = TOriginalProps & ExternalProps;
        const result = class HocAntMessage extends React.Component<ResultProps, State> {
            // Define how HOC is shown in ReactDevTools
            static displayName = `hocAntMessage(${Component.displayName})`;

            constructor(props: ResultProps) {
                super(props);
                this.state = {
                    data: null
                };
                this.onMessage = this.onMessage.bind(this);
            }
        
            componentDidMount() {
                this.props.ant.on(message, this.onMessage);
            }
        
            componentWillUnmount() {
                this.props.ant.removeListener(message, this.onMessage);
            }    
        
            onMessage(data, timestamp) {
                this.setState( {
                    data: data
                });
            }

            render(): JSX.Element {
                return (
                    <Component {...this.props} {...this.state.data} />
                );
            }
        };

        return result;
    };
