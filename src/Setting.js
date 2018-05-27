import React, { Component } from 'react';
import './Screen.css';

class Setting extends Component {
  constructor (props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    const kmzUrl = localStorage.getItem('kmz_url')
    this.state = {kmzUrl: kmzUrl ? kmzUrl : ''}
  }

  handleChange(e){
    this.setState({kmzUrl: e.target.value})
    localStorage.setItem('kmz_url', e.target.value)
  }

  render(){
    const kmzUrl = this.state.kmzUrl
    return (
      <form className="Screen">
        <input value={kmzUrl} onChange={this.handleChange} style={{fontSize: '1.2em', marginTop: '80px', marginLeft: '10px', width: '80%'}}/>
      </form>
    )
  }
}

export default Setting