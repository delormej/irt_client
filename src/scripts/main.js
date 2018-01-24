import React from 'react';
import ReactDOM from 'react-dom';
import Main from '../views/main.jsx';
import ErrorBoundry from '../views/errorBoundry.jsx';
const remote = require('electron').remote;

window.onload = function(){
  ReactDOM.render(<ErrorBoundry><Main /></ErrorBoundry>, 
    document.getElementById('app'));

    document.getElementById("closeBtn").addEventListener("click", function (e) {
      var window = remote.getCurrentWindow();
      window.close();
    }); 
}
