import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import './App.css';
import Navigation from './Navigation';
import Map from './Map';
import Setting from './Setting';
import Search from './Search';

class App extends Component {

  constructor(props){
    super(props)
    this.state = {isSearchOpen: false}
  }

  render() {
    return (
      <BrowserRouter>
        <div className="App">
          <Navigation onSeachClick={(isSearchOpen)=>{this.setState({isSearchOpen: isSearchOpen})}}/>
          <Route exact path='/' render={props => <Map isSearchOpen={this.state.isSearchOpen}/>}/>
          <Route path='/index.html' component={Map}/>
          <Route path='/setting' component={Setting}/>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
