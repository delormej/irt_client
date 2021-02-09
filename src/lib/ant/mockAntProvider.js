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
 
    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
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
            RealSpeed: this.getRandomInt(1, 10),
            Distance: this.getRandomInt(10, 1000)
        };
    }
}

class MockHeartRateSensor extends MockSensor {
    constructor() {
        super('hbData');
    }

    getData() {
        return {
            ComputedHeartRate: this.getRandomInt(70, 185)
        };
    }
}

class MockBicyclePowerSensor extends MockSensor {
    constructor() {
        super('powerData');
    }

    getData() {
        return {
            CalculatedPower: this.getRandomInt(180, 200)
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