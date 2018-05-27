import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import './Screen.css'
import './Map.css'

const modalStyle = {
  content:{
    top: '40%', 
    left: '30%', 
    right: '30%', 
    bottom: '40%', 
    borderRadius: '15px',
    padding: '0',
    boxShadow: '0 0 15px 3px rgb(120, 120, 120)',
    background: 'rgba(190, 190, 190, 0.5)'
  }
}

const modalButtonStyle = {
  position: 'absolute',
  width: '100%',
  borderColor: '#aaaaaa',
  borderWidth: '1px 0 0 0',
  top: '80%',
  bottom: '0',
  fontSize: '1.2rem',
  color: 'rgb(0, 100, 255)',
  background: 'transparent',
}

const modalDivStyle = {
  padding: '20px 20px 0',
  background: 'transparent',
  textAlign: 'center'
}

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
      <div className="Map">
        <div ref="map" className="mapComponent"/>
        <Modal 
          isOpen={isOpenModal} 
          onRequestClose={this.closeModal} 
          ariaHideApp={false}
          style={modalStyle}>
            <div style={modalDivStyle}>
              ロードエラー
            </div>
            <button onClick={this.closeModal} style={modalButtonStyle}>閉じる</button>
        </Modal>
      </div>
    );
  }  
}

export default Map