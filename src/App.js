import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import './App.css';
import Navigation from './Navigation';
import Map from './Map';
import Setting from './Setting';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <div className="App">
          <Navigation/>
          <Route exact path='/' component={Map}/>
          <Route path='/index.html' component={Map}/>
          <Route path='/setting' component={Setting}/>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
