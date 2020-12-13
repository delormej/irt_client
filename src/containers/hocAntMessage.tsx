//
// High Order Component based on this: https://dev.to/danhomola/react-higher-order-components-in-typescript-made-simple 
//
import * as React from 'react';
import * as EventEmitter from 'events';

// State of the HOC you need to compute the InjectedProps
interface State {
    message: string;
    data: any;
}

// Props you want the resulting component to take (besides the props of the wrapped component)
interface ExternalProps {
    ant: EventEmitter;
}


export const hocAntMessage = (messages: string[]) =>
    <TOriginalProps extends {}>(
        Component: (React.ComponentClass<TOriginalProps>
            | React.StatelessComponent<TOriginalProps>)
    ) => {
        type ResultProps = TOriginalProps & ExternalProps;
        const result = class HocAntMessage extends React.Component<ResultProps, State> {
            // Define how HOC is shown in ReactDevTools
            static displayName = `hocAntMessage(${Component.displayName})`;

            constructor(props: ResultProps) {
                super(props);
                this.state = {
                    message: null,
                    data: null
                };
                if (!Array.isArray(messages))  
                    messages = [messages];
            }
        
            componentDidMount() {
                messages.forEach(message => {
                    this.props.ant.on(message, 
                        this.onMessage.bind(this, message));    
                });
                
            }
        
            componentWillUnmount() {
                messages.forEach(message => {
                    this.props.ant.removeAllListeners(message);    
                });
            }    
        
            onMessage(message, data, timestamp) {
                this.setState( {
                    message: message,
                    data: data
                });
            }

            render(): JSX.Element {
                return (
                    <Component {...this.props} message={this.state.message} {...this.state.data} />
                );
            }
        };

        return result;
    };
