import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import './Screen.css'

class Map extends Component {

  constructor (props) {
    super(props)
    this.updateKmzUrl = this.updateKmzUrl.bind(this)
    this.closeModal = this.closeModal.bind(this)
    this.state = {}
  }

  closeModal(){
    this.setState({isOpenModal: false})
    window.location.assign('/setting')
  }

  updateKmzUrl(kmzUrl, map){
    if (!kmzUrl) {
      // 引数が null の場合、KMLLayer でエラー検知のため適当な URL を設定
      kmzUrl = 'https://hogehoge.jp/kmz'
    }
    console.log(kmzUrl);
    var layer = new window.google.maps.KmlLayer({
      url: kmzUrl,
      map: map
    })

    window.google.maps.event.addListener(layer, 'status_changed', ()=>{
      const status = layer.getStatus();
      console.log("status : " + status);
      if(!status.match('OK')){
        this.setState({isOpenModal: true})
      }
    });
  }

  componentDidMount() {
    const map = new window.google.maps.Map(
      ReactDOM.findDOMNode(this.refs["map"]),
      {
        center: new window.google.maps.LatLng(35.6665369,139.7083624),
        zoom: 15
      }
    )
    this.updateKmzUrl(localStorage.getItem('kmz_url'), map)
  }

  render(){
    const isOpenModal = this.state.isOpenModal;
    return (
      <div className="Screen">
        <div ref="map" className="Screen"/>
        <Modal isOpen={isOpenModal} onRequestClose={this.closeModal} ariaHideApp={false}>ロードエラー<button onClick={this.closeModal}>閉じる</button></Modal>
      </div>
    );
  }  
}

export default Map