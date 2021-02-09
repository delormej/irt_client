import { EventEmitter } from "events";
import React from "react";
import { AntContext, AntProvider } from "./antProvider";

class MockSensor extends EventEmitter {
    constructor(event) {
        super();
        
        this.getData = this.getData.bind(this);
        setInterval(() => 
            this.emit(event, this.getData()), 
            1000
        );
    }
    
    getData() {
        return { };
    }
}

class MockFitnessEquipmentSensor extends MockSensor {
    constructor() {
        super('fitnessData');
    }

    getData() {
        return {
            RealSpeed: 3,
            Distance: 10
        };
    }
}

class MockHeartRateSensor extends MockSensor {
    constructor() {
        super('hbData');
    }

    getData() {
        return {
            ComputedHeartRate: 103
        };
    }
}

class MockBicyclePowerSensor extends MockSensor {
    constructor() {
        super('powerData');
    }

    getData() {
        return {
            CalculatedPower: 234
        };
    }
}

export class MockAntProvider extends AntProvider {
    constructor(props) {
        super(props);
    
        this.ant = {
            fec: new MockFitnessEquipmentSensor(),
            bp: new MockBicyclePowerSensor(),
            hrm: new MockHeartRateSensor()         
        }
    }    

    onStartup() {
        console.log('startup override');
    }
    
    render() {
        return (
            <AntContext.Provider
              value={{
                ant: this.ant, 
                antInitialized: true,
                fecConnected: true,
                bpConnected: true,
                hrmConnected: true,
                connectAll: () => {},
                connectDevice: () => {},
                disconnectDevice: () => {},
                fecDevicesAvailable: [],
                bpDevicesAvailable: [],
                hrmDevicesAvailable: []              
              }}
            >
              {this.props.children}
            </AntContext.Provider> 
        );       
    }
}