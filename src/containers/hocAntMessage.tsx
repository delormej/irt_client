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

// Options for the HOC factory that are not dependent on props values
interface Options {
    message: string;
}

export const hocAntMessage = (options: Options) =>
    <TOriginalProps extends {}>(
        Component: (React.ComponentClass<TOriginalProps & InjectedProps>
            | React.StatelessComponent<TOriginalProps & InjectedProps>)
    ) => {
        // Do something with the options here or some side effects

        type ResultProps = TOriginalProps & ExternalProps;
        const result = class HocAntMessage extends React.Component<ResultProps, State> {
            // Define how your HOC is shown in ReactDevTools
            static displayName = `hocAntMessage(${Component.displayName})`;

            constructor(props: ResultProps) {
                super(props);
                this.state = {
                    data: null
                };
                this.onMessage = this.onMessage.bind(this);
            }
        
            componentDidMount() {
                this.props.ant.on(options.message, this.onMessage);
            }
        
            componentWillUnmount() {
                this.props.ant.removeListener(options.message, this.onMessage);
            }    
        
            onMessage(data, timestamp) {
                this.setState( {
                    data: data
                });
            }
        
            // Implement other methods here

            render(): JSX.Element {
                // Render all your added markup
                return (
                    <Component {...this.props} {...this.state} />
                );
            }
        };

        return result;
    };
