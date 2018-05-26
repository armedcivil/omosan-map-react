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
    var link;
    if (window.location.pathname.match('^/$')) {
      link = (<Link to="/setting">設定</Link>)
    } else {
      link = (<a onClick={this.back}>戻る</a>)
    }
    return (
      <div className="Navigation">
        {link}
      </div>
    )
  }
}

export default Navigation