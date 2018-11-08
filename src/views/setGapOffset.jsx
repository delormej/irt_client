
export default class SetGapOffset extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            gapOffset: props.gapOffset
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
        const value = this.state.gapOffset;
        this.props.onSetGapOffset(value);
    }

    render() {
        return (
            <div className="setGapOffset">
                <div className="label">Gap Offset</div>
                <input name="gapOffset" type="textbox" 
                    value={this.state.gapOffset} 
                    onChange={this.handleChange} />
                <button name="setGapOffsetBtn" onClick={this.handleClick}>Set</button>
            </div>
        );
    }
}
