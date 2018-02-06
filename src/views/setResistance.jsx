import InputHelper from '../lib/ant/ts/inputHelpers';

function ResistanceOptions(props) {
    let source = props.source;
    return (
        <div className="advancedTrainerSettings">
            <ResistanceOption name="servo" description="Servo Position" source={source} />
            <ResistanceOption name="target" description="Power Target" source={source} />
            <ResistanceOption name="resistance" description="% Resistance" source={source} />
            <ResistanceOption name="grade" description="% Grade" source={source} />
            <button name="setResistanceTypeBtn" onClick={source.handleClick}>Set</button>
        </div>
    );
}

function ResistanceOption(props) {
    const name = props.name;
    const description = props.description;
    const source = props.source;
    const selected = source.state.resistanceType;
    const value = source.state[name];
    return (
        <React.Fragment>
            <label>
                <input type="radio" name="resistanceType" value={name} 
                    checked={selected === name}
                    onChange={source.handleChange} />
                {description}
            </label>
            <input type="textbox" name={name} value={value} 
                onChange={source.handleChange} />
        </React.Fragment>
    );
}

export default class SetResistance extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            resistanceType: "servo",
            servo: props.servo,
            target: props.target,
            resistance: props.resistance,
            grade: props.grade
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    handleChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        this.setState({
            [name]: value
        });
    }

    handleClick(event) {
        const type = this.state.resistanceType; 
        const value = this.state[type];
        this.props.onSetResistance(type, value);
    }

    render() {
        return (
            <ResistanceOptions source={this} />
        );
    }
}
