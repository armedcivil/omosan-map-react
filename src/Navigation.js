import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';

class Navigation extends Component {

  constructor (props) {
    super(props);
    this.back = this.back.bind(this)
    this.openSeach = this.openSeach.bind(this)
    this.state = {isSearchOpen: false}
  }

  back () {
    window.history.back();
  }

  openSeach(){
    this.state.isSearchOpen = !this.state.isSearchOpen
    this.props.onSeachClick(this.state.isSearchOpen)
  }

  render () {
    var navigation;
    if (window.location.pathname.match('^/(index.html){0,1}$')) {
      navigation = (
      <span>
        <a onClick={this.openSeach} style={{float: 'left', marginLeft: '20px'}}>絞り込み</a>
        <Link to="/setting" style={{float: 'right', marginRight: '20px'}}>設定</Link>
      </span>)
    } else {
      navigation = (<a onClick={this.back} style={{float: 'left', marginLeft: '20px'}}>戻る</a>)
    }
    return (
      <div className="Navigation">
        {navigation}
      </div>
    )
  }
}

export default Navigation