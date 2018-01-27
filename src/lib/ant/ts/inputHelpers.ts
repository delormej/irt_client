export default class InputChange {
    static handleInputChange(object, event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        object.setState({
            [name]: value
        });    
    }
}
