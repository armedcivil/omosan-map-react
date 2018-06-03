import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import KMLJson from './utils/KMLJson'
import './Screen.css'
import './Map.css'

var Unzip = require('../node_modules/zlibjs/bin/unzip.min').Zlib.Unzip

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
    this.closeModal = this.closeModal.bind(this)
    this.state = {map: null, kmlJson: null, markers: [], infoWindows: [], unzip: null}
  }

  closeModal(){
    this.setState({isOpenModal: false})
    window.location.assign('/setting')
  }

  requestKmz(url, end){
    console.log(url)
    if(url === null || url === undefined || typeof(url) !== "string") {
      end(null);
      return;
    }
    var self = this;
    self.end = end;
    fetch(url.replace("/d/u/0/","/d/"), {redirect: "manual"}).then(res => {
      var reader = res.body.getReader()
      var result = [];
      function push(){
        reader.read().then(({done, value}) => {
          if(done){
            var sumLength = 0;
            for(var i = 0; i < result.length; i++){
              sumLength += result[i].byteLength
            }
            
            var whole = new Uint8Array(sumLength)
            var pos = 0
            for(var b = 0; b < result.length; b++){
              whole.set(result[b], pos)
              pos += result[b].byteLength
            }

            end(whole)
            return
          }
          result.push(value)
          push()
        })
      }
      push()
    })
    .catch(err => {
      console.log(err);
    })
  }

  updateKmzUrl(kmzUrl){

    this.requestKmz(kmzUrl, (bufferArray) => {
      if (!bufferArray) {
        this.setState({isOpenModal: true})
        return;
      }
      localStorage.setItem("zip_data", String.fromCharCode.apply("", bufferArray))
      this.updateMap(this.state.map)
    })
  }

  updateMap(map){
    if(!localStorage.getItem("zip_data")){
      this.setState({isOpenModal: true})
      return;
    }
    var unzip = new Unzip((new Uint8Array([].map.call(localStorage.getItem("zip_data"), (c) => {
      return c.charCodeAt(0)
    }))))
    var fileNames = unzip.getFilenames();
    var kmlDoc = (new TextDecoder("utf-8")).decode(unzip.decompress("doc.kml"));
    var kmlJson = new KMLJson(kmlDoc)
    this.setState({kmlJson: kmlJson})
    this.setState({unzip: unzip})
    for(var i = 0; i < kmlJson.folders.length; i++){
      var folder = kmlJson.folders[i]
      for(var n = 0; n < folder.placemarks.length; n++){
        var placemark = folder.placemarks[n]
        var detectedStyle = kmlJson.findStyle(placemark)
        var iconUrl = undefined;
        var marker = new window.google.maps.Marker({
          position: new window.google.maps.LatLng(placemark.point.y, placemark.point.x),
          title: placemark.name,
          map: map
        })
        this.state.markers.push(marker)
        if(detectedStyle.icon.href && !detectedStyle.icon.href.startsWith("http")){
          var splitStrings = detectedStyle.icon.href.split('.')
          var extension = splitStrings[splitStrings.length - 1];
          iconUrl = "data:image/" + extension + ";base64," + (new Buffer(unzip.decompress(detectedStyle.icon.href))).toString("base64")
          marker.setIcon({url: iconUrl, scaledSize: new window.google.maps.Size(32, 32, "px", "px")})
        }
        var description = placemark.description
        var name = placemark.name
        if(detectedStyle.balloon.text && detectedStyle.balloon.text.match(/\$\[name\]/)){
          name = detectedStyle.balloon.text.replace("$[name]", placemark.name)
        }
        var content = name + (description == null ? "" : ("<br>" + description))
        var infoWindow = new window.google.maps.InfoWindow({
          content: content,
          position: new window.google.maps.LatLng(placemark.point.y, placemark.point.x),
          maxWidth: 350
        })
        this.state.infoWindows.push(infoWindow)
      }
    }
    var infoWindows = this.state.infoWindows
    this.state.markers.forEach((marker, index) => {
      var infoWindow = infoWindows[index]
      marker.addListener("click", () => {
        infoWindow.open(map)
      })
      this.state.infoWindows
    })
  }

  componentDidMount() {
    const map = new window.google.maps.Map(
      ReactDOM.findDOMNode(this.refs["map"]),
      {
        center: new window.google.maps.LatLng(35.6665369,139.7083624),
        zoom: 15
      }
    )
    this.setState({map: map})
    if(navigator.onLine){
      this.updateKmzUrl(localStorage.getItem('kmz_url'), map)
    } else {
      this.updateMap(map)
    }
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