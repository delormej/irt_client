import InputHelper from '../lib/ant/ts/inputHelpers';

export default class SetServo extends React.Component {
    constructor(props) {
        super(props);
        this.state = { servo: props.servo };
    }

    render() {
        return (
            <div>
                <div className="label">Servo Position</div>
                <input name="servo" type="textbox" 
                    value={this.state.servo} 
                    onChange={(event) => 
                        InputHelper.handleInputChange(this, event)}/>
                <button name="setServoBtn" 
                    onClick={() => this.props.onSetServo(this.state.servo)}>Set Servo</button>
            </div>
        );
    }
}