import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import './App.css';
import Navigation from './Navigation';
import Map from './Map';
import Setting from './Setting';
import Search from './Search';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <div className="App">
          <Navigation/>
          {/* TODO : Search は検索・絞り込み選択させる時のみ表示 */}
          <Search />
          <Route exact path='/' component={Map}/>
          <Route path='/setting' component={Setting}/>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
