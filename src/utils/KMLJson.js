import { DOMParser } from 'xmldom'

class KMLJson {

  constructor(kmlString){
    this.styles = [];
    this.folders = [];
    this.parse(kmlString)
  }

  parse(kmlString){
    if(kmlString === null || kmlString === undefined || typeof(kmlString) !== "string"){
      return;
    }

    var kml = new DOMParser().parseFromString(kmlString)
    this.parseStyle(kml)
    this.parseFolder(kml)
  }

  parseStyle(kml){
    var styleNodeList = kml.getElementsByTagName("Style")
    for(var i = 0; i < styleNodeList.length; i++){
      var styleNode = styleNodeList[i]
      var iconStyleNode = styleNode.getElementsByTagName("IconStyle")[0]
      var iconStyleColorNode = iconStyleNode.getElementsByTagName("color")[0]
      var iconStyleScaleNode = iconStyleNode.getElementsByTagName("scale")[0]
      var iconStyleIconNode = iconStyleNode.getElementsByTagName("Icon")[0]
      var iconStyleHotSpotNode = iconStyleNode.getElementsByTagName("hotSpot")[0]
      var iconStyleIconHrefNode = iconStyleIconNode.getElementsByTagName("href")[0]

      var id = styleNode.getAttribute("id")
      var iconStyleScale = Number.parseFloat(iconStyleScaleNode.textContent)
      var iconStyleColor = null
      if(iconStyleColorNode) iconStyleColor = "#" + iconStyleColorNode.textContent.substring(2,iconStyleColorNode.textContent.length)
      var iconStyleIconHref = iconStyleIconHrefNode.textContent
      var iconStyleHotSpotX = null
      var iconStyleHotSpotXUnit = null
      var iconStyleHotSpotY = null
      var iconStyleHotSpotYUnit = null
      if(iconStyleHotSpotNode) {
        iconStyleHotSpotX = Number.parseFloat(iconStyleHotSpotNode.getAttribute("x"))
        iconStyleHotSpotXUnit = iconStyleHotSpotNode.getAttribute("xunits")
        iconStyleHotSpotY = Number.parseFloat(iconStyleHotSpotNode.getAttribute("y"))
        iconStyleHotSpotYUnit = iconStyleHotSpotNode.getAttribute("yunits")
      }

      var balloonStyleNode = styleNode.getElementsByTagName("BalloonStyle")[0]
      var balloonStyleTextNode = null
      var balloonStyleText = null
      if(balloonStyleNode){
        balloonStyleTextNode = balloonStyleNode.getElementsByTagName("text")[0]
        if(balloonStyleTextNode){
          balloonStyleText = balloonStyleTextNode.textContent
        }
      }
      
      this.styles.push({
        id: id, 
        icon: {
          scale: iconStyleScale,
          color: iconStyleColor,
          href: iconStyleIconHref,
          hotSpot: {
            x: iconStyleHotSpotX,
            xunit: iconStyleHotSpotXUnit,
            y: iconStyleHotSpotY,
            yunit: iconStyleHotSpotYUnit
          }
        },
        balloon: {
          text: balloonStyleText
        }
      })
    }
  }

  parseFolder(kml){
    var folderNodeList = kml.getElementsByTagName("Folder");
    for(var i = 0; i < folderNodeList.length; i++){
      var folderNode = folderNodeList[i]
      var folderNameNode = folderNode.getElementsByTagName("name")[0]
      var folderName = folderNameNode.textContent
      var folder = {
        name: folderName,
        placemarks: []
      }

      var placemarkNodeList = folderNode.getElementsByTagName("Placemark")
      for(var n = 0; n < placemarkNodeList.length; n++){
        var placemarkNode = placemarkNodeList[n]
        var placemarkNameNode = placemarkNode.getElementsByTagName("name")[0]
        var placemarkDescriptionNode = placemarkNode.getElementsByTagName("description")[0]
        var placemarkStyleUrlNode = placemarkNode.getElementsByTagName("styleUrl")[0]
        var placemarkPointNode = placemarkNode.getElementsByTagName("Point")[0]
        var placemarkPointCoordinatesNode = placemarkPointNode.getElementsByTagName("coordinates")[0]

        var placemarkName = placemarkNameNode.textContent
        var placemarkDescription = null
        if(placemarkDescriptionNode) placemarkDescription = placemarkDescriptionNode.textContent
        var placemarkStyleUrl = placemarkStyleUrlNode.textContent.substring(1, placemarkStyleUrlNode.textContent.length)
        var placemarkPointCoordinates = placemarkPointCoordinatesNode.textContent
        var placemarkPointCoordinatesSplit = placemarkPointCoordinates.split(",")
        var placemarkPointX = Number.parseFloat(placemarkPointCoordinatesSplit[0])
        var placemarkPointY = Number.parseFloat(placemarkPointCoordinatesSplit[1])
        var placemarkPointZ = Number.parseFloat(placemarkPointCoordinatesSplit[2])

        folder.placemarks.push({
          name: placemarkName,
          description: placemarkDescription,
          styleUrl: placemarkStyleUrl,
          point: {
            x: placemarkPointX,
            y: placemarkPointY,
            z: placemarkPointZ
          }
        })
      }

      this.folders.push(folder)
    }
  }

  findStyle(placemark){
    return this.styles.find((value) => {
      return value.id === placemark.styleUrl
    })
  }
}

export default KMLJson