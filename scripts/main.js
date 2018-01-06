import React from 'react';
import ReactDOM from 'react-dom';
import Main from '../views/main.jsx';
import ErrorBoundry from '../views/errorBoundry.jsx';

window.onload = function(){
  ReactDOM.render(<ErrorBoundry><Main /></ErrorBoundry>, 
    document.getElementById('app'));
}
