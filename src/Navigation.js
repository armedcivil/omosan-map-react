import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';

class Navigation extends Component {

  constructor (props) {
    super(props);
    this.back = this.back.bind(this);
  }

  back () {
    window.history.back();
  }

  render () {
    var navigation;
    if (window.location.pathname.match('^/(index.html){0,1}$')) {
      navigation = (<Link to="/setting" style={{float: 'right', marginRight: '20px'}}>設定</Link>)
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