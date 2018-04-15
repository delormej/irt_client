//
// High Order Component based on this: https://dev.to/danhomola/react-higher-order-components-in-typescript-made-simple 
//
import * as React from 'react';
import * as EventEmitter from 'events';
import PowerAverager from '../lib/ant/ts/PowerAverager';

interface ChartEvent {
    timestamp: number;
    heartRate: number;
    watts: number;
    targetWatts: number;
    averageWatts: number;
    servoPosition: number;
  }

// State of the HOC you need to compute the InjectedProps
interface State {
    events: ChartEvent[];
}

// Props you want the resulting component to take (besides the props of the wrapped component)
interface ExternalProps {
    bp: EventEmitter;
    hrm: EventEmitter;
    fec: EventEmitter;
    bpAverager: PowerAverager;
    averageSeconds: number;
}

export const hocChartEvents = () =>
    <TOriginalProps extends {}>(
        Component: (React.ComponentClass<TOriginalProps>
            | React.StatelessComponent<TOriginalProps>)
    ) => {
        type ResultProps = TOriginalProps & ExternalProps;
        const result = class HocChartEvent extends React.Component<ResultProps, State> {
            // Define how HOC is shown in ReactDevTools
            static displayName = `hocChartEvents(${Component.displayName})`;
            private current: ChartEvent;
            private timer: NodeJS.Timer;
            private filterGeneration: number = 0;                      

            constructor(props: ResultProps) {
                super(props);
                
                this.current = {
                    timestamp: 0,
                    heartRate: 0,
                    watts: 0,
                    targetWatts: 0,
                    averageWatts: 0,
                    servoPosition: 0
                };           
                
                this.onBikePower = this.onBikePower.bind(this);
                this.onHeartRate = this.onHeartRate.bind(this);
                this.onIrtExtraInfo = this.onIrtExtraInfo.bind(this);
                this.updateState = this.updateState.bind(this);

                this.state = {
                    events: null,
                };
            }
        
            componentDidMount() {
                this.props.bp.on('standardPowerOnly', this.onBikePower);
                this.props.bp.on('ctfMainPage', this.onBikePower);
                this.props.hrm.on('heartRate', this.onHeartRate);
                this.props.fec.on('irtExtraInfo', this.onIrtExtraInfo);
            
                this.startStateUpdates();
            }
                    
            componentWillUnmount() {
                this.props.bp.removeListener('standardPowerOnly', this.onBikePower);
                this.props.bp.removeListener('ctfMainPage', this.onBikePower);
                this.props.hrm.removeListener('heartRate', this.onHeartRate);
                this.props.fec.removeListener('irtExtraInfo', this.onIrtExtraInfo);
            
                clearTimeout(this.timer);
            }

            onBikePower(data, timestamp) {
                this.current.timestamp = timestamp;
                this.current.watts = data.instantPower;
                this.current.averageWatts = Number.parseInt(this.props.bpAverager.getAverage(this.props.averageSeconds));
            }
        
            onHeartRate(value, timestamp) {
                this.current.timestamp = timestamp;
                this.current.heartRate = value;
            }
        
            onIrtExtraInfo(data, timestamp) {
                this.current.timestamp = timestamp;
                this.current.servoPosition = data.servoPosition;
                this.current.targetWatts = data.target;
            }

            filterEvents(element: any, index: number, array: Array<any>): boolean{
                const BATCH_SIZE: number = 250;
                let start: number = (BATCH_SIZE / 2) * this.filterGeneration;
                let end: number = start + BATCH_SIZE;
                console.log("filtering:", start, end, this.filterGeneration);
            
                if (index > start && index <= end)
                  return (index % 2 == 0);
                else
                  return true;
            }
            
            // DEBUG ONLY
            generateEvents(): ChartEvent[] {
                let events: ChartEvent[] = new Array<ChartEvent>();
                let event: ChartEvent = {
                    timestamp: 0,
                    heartRate: 0,
                    watts: 0,
                    targetWatts: 0,
                    averageWatts: 0,
                    servoPosition: 0
                };    
            
                for (let i = 0; i < 1990; i++) {
                  let newEvent: ChartEvent = JSON.parse(JSON.stringify(event));
                  newEvent.timestamp++;
                  newEvent.heartRate = 82;
                  events.push(newEvent);
                }
            
                return events;
            }
            
            getEvents(): ChartEvent[] {
                const MAX_EVENTS: number = 2250;
                const ITERATIONS: number = 16;
            
                let events: ChartEvent[] = this.state.events.slice();
                if (events.length == 0)
                  return this.generateEvents();
                if (events.length > MAX_EVENTS)  {
                  this.pauseStateUpdates();
                  events = events.filter(this.filterEvents, this);
                  this.filterGeneration = (this.filterGeneration + 1) % ITERATIONS;
                  this.startStateUpdates();
                }
                events.push(this.current);
                return events;
            }
            
            pauseStateUpdates() : void {
                clearInterval(this.timer);
            }
            
            startStateUpdates() : void {
                const TIMEOUT_MS = 1000;
                this.timer = setInterval(this.updateState, TIMEOUT_MS);
            }
            
            updateState() {  
                this.setState( {
                  events: this.getEvents()
                });
            }
            
            render(): JSX.Element {
                return (
                    <Component {...this.props} {...this.state} />
                );
            }
        };

        return result;
    };
