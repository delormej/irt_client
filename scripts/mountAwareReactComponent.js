'use babel';
import React from 'react';

/*
    Base class that wraps state for whether a component is mounted or not.
 */
export default class MountAwareReactComponent extends React.Component {
    constructor(props) {
        super(props);
        this.mounted = false;
    }

    componentDidMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }    
}
