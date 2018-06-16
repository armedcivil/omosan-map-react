import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import KMLJson from './utils/KMLJson'
import './Screen.css'
import './Map.css'
import Search from './Search';

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
    this.state = {
      map: null, 
      kmlJson: null, 
      markers: [], 
      infoWindows: [], 
      unzip: null, 
      searchNames: [],
      alreadySetSearchNames: false,
      isOpenSearch: false,
    }
  }

  closeModal(){
    this.setState({isOpenModal: false})
    window.location.assign('/setting')
  }

  requestKmz(url, end){
    if(url === null || url === undefined || typeof(url) !== "string") {
      end(null);
      return;
    }
    var self = this;
    self.end = end;
    var newUrl = url.replace(/\/d\/u\/\d{1,}\//,"/d/")

    var ua = navigator.userAgent.toLowerCase();

    if (ua.indexOf("firefox") != -1) {
      fetch(newUrl, {redirect: "manual"}).then(res => {
        return res.blob();
      })
      .then(b => {
        var fr = new FileReader();
        fr.onload = data => {
          self.end(new Uint8Array(fr.result))
        }
        fr.readAsArrayBuffer(b)
      })
      .catch(err => {
        console.log(err);
      })
    } else {
      fetch(newUrl, {redirect: "manual"}).then(res => {
        var reader = res.body.getReader()
        var result = [];
        function push(){
          reader.read().then(({done, value}) => {
            if(done){
              self.end(self.concatUint8Array(result))
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

  }

  concatUint8Array(array){
    var sumLength = 0;
    for(var i = 0; i < array.length; i++){
      sumLength += array[i].byteLength
    }
    
    var whole = new Uint8Array(sumLength)
    var pos = 0
    for(var b = 0; b < array.length; b++){
      whole.set(array[b], pos)
      pos += array[b].byteLength
    }

    return whole;
  }

  updateKmzUrl(kmzUrl){

    this.requestKmz(kmzUrl, (bufferArray) => {
      console.log(bufferArray)
      if (!bufferArray) {
        console.log("bufferArray is null")
        this.setState({isOpenModal: true})
        return;
      }
      var myString = "";
      for (var i=0; i<bufferArray.byteLength; i++) {
        myString += String.fromCharCode(bufferArray[i])
      }
      localStorage.setItem("zip_data", myString)
      this.updateMap(this.state.map)
    })
  }

  updateMap(map, searchNames){
    this.state.markers.forEach((marker) => {marker.setMap(null)})
    this.state.infoWindows.forEach((info) => {info.setMap(null)})
    this.state.markers.splice(0, this.state.markers.length)
    this.state.infoWindows.splice(0, this.state.infoWindows.length)
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
      if(searchNames && searchNames.indexOf(folder.name) === -1){
        continue;
      }
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
        zoom: 17
      }
    )
    this.setState({map: map})
    if(navigator.onLine){
      this.updateKmzUrl(localStorage.getItem('kmz_url'), map)
    } else {
      this.updateMap(map)
    }
    if(navigator.geolocation){
      var markerHeading = new window.google.maps.Marker({map:map})
      var markerCircle = new window.google.maps.Marker({map:map})
      navigator.geolocation.watchPosition(
        (position)=>{
          var latLng = new window.google.maps.LatLng(position.coords.latitude, position.coords.longitude);
          markerCircle.setPosition(latLng)
          markerHeading.setPosition(latLng)
          markerCircle.setIcon({
            path: "M16.5,31.5 C8.768,31.5 2.5,25.232 2.5,17.5 C2.5,9.768 8.768,3.5 16.5,3.5 C24.232,3.5 30.5,9.768 30.5,17.5 C30.5,25.232 24.232,31.5 16.5,31.5 z", 
            rotation: position.coords.heading, 
            scaledSize: new window.google.maps.Size(32, 32),
            strokeColor: "white",
            strokeWidth: 12,
            fillOpacity: 1,
            fillColor: "#2995FF",
            anchor: new window.google.maps.Point(16, 16)
          })
          markerHeading.setIcon({
            path: "M10,5.408 L13,2.704 L16,0 L19,2.704 L22,5.408 L16,5.408 z", 
            rotation: position.coords.heading, 
            scaledSize: new window.google.maps.Size(32, 32),
            strokeColor: "transparent",
            fillOpacity: 1,
            fillColor: "#2995FF",
            anchor: new window.google.maps.Point(16, 16)
          })
        },
        (error)=>{alert(error.message)},
      {enableHighAccuracy: true})
    }
  }

  render(){
    const isOpenModal = this.state.isOpenModal;
    const map = this.state.map;
    var folderNames = [];
    if(this.state.kmlJson){
      folderNames = this.state.kmlJson.folders.map((value) => {return value.name})
      if(!this.state.alreadySetSearchNames){
        this.state.alreadySetSearchNames = true
        this.state.searchNames = folderNames
      }
    }
    var searchWindow = null
    if(this.props.isSearchOpen){
      searchWindow = (
      <Search 
        ref="search" 
        folders={folderNames} 
        searchNames={this.state.searchNames} 
        onSeachListChange={(searchNames)=>{this.updateMap(map, this.state.searchNames)}}
        onClose={this.props.onSearchClose}/>)
    }
    return (
      <div className="Map">
        {searchWindow}
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
