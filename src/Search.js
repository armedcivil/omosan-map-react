import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import './Search.css';
class Search extends Component {

  constructor(props){
    super(props)
    this.updateSearchList = this.updateSearchList.bind(this);
  }

  updateSearchList(e){
    const target = e.target
    if(target.checked){
      this.props.searchNames.push(target.name)
    } else {
      const index = this.props.searchNames.indexOf(target.name)
      this.props.searchNames.splice(index, 1)
    }
    this.props.onSeachListChange();
  }

  render () {
    const folderNameList = this.props.folders.map((folderName) => {
      return (
      <div key={folderName}>
        <label >
          <div style={{width: "100%", height: "30px"}} className="listItem">
            <span style={{verticalAlign: "middle", marginLeft: "5px"}}>{folderName}</span>
            <input type="checkbox" name={folderName} className="checkbox" onChange={this.updateSearchList} defaultChecked={this.props.searchNames.indexOf(folderName) !== -1}/>
            <div className="right">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path d="M0 0h24v24H0z" fill="none"/>
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
          </div>
        </label>
      </div>)
    })
    return (
      <div className="Search">
        <div style={{height: "35px"}}>
          <div style={{fill: "#4088dd", marginTop: "10px", marginLeft: "10px"}} onClick={this.props.onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              <path d="M0 0h24v24H0z" fill="none"/>
            </svg>
          </div>
        </div>
        <div style={{left: '0px', width: '100%', height: '90%', backgroundColor: '#ffffff', overflowY: 'scroll'}}>
          <div>
            {folderNameList}
          </div>
        </div>
        <div style={{height: "35px"}}></div>
      </div>
    )
  }
}

export default Search