import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import {Feature, Map, View} from 'ol';
import {Circle as CircleStyle, Fill, Stroke, Style, Text} from 'ol/style';
import {Vector as VectorSource} from 'ol/source';
import {fromLonLat} from 'ol/proj';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';

/**
 * Tech Connect Project # 1
 * Restaurant Map Pathfinding
 */

//Vector Source containing features on map
const source = new VectorSource();



//Basic client to host JSON data
const client = new XMLHttpRequest();

/**
 * IMPORTANT! SET THIS TO YOUR LOCATION
 */
 const city = "buffalo" //Choose "buffalo" or "wilmington" based on your location
 client.open('GET', './data/buffalo_graph.json');
//  client.open('GET', './data/wilmington_graph.json');

// Creates features from JSON data
// Creates routes IN ORDER from JSON input
client.onload = function () {
    const json = JSON.parse(client.responseText)["nodes"];
    console.log(json)
    const features = [];
    const coordinatesList = []

    for (let location of json){
      let coords = [location["lon"],location["lat"]]
      let id = /[a-zA-Z]/.test(location["id"]) ? location["id"] : ""
      if(id === ""){
        
      }
      coordinatesList.push(coords)
      let feature = new Feature({
        geometry: new Point(fromLonLat(coords)),
      })

      //Styling configuration and text
      const style = new Style({
        image: new CircleStyle({
          radius: 2,
          fill: new Fill({
            color: '#0084ff',
          }),
          stroke: new Stroke({
            color: 'black',
            width: 1,
          }),
        }),
        text: new Text({
          font: '12px Calibri,sans-serif',
          text: id,
          textBaseline: 'bottom',
          fill: new Fill({
            color: 'rgba(0,0,0,1)'
          }),
          stroke: new Stroke({
            color: 'rgba(255,255,255,1)',
            width: 3
          })
        })
      });
      feature.setStyle(style)
      features.push(feature)
    }
    //Add the features to the Vector Source
    source.addFeatures(features);

    /**
     * TODO: Implement findShortestPath function to find the shortest path between the restaurants in list of coordinates
     */
    let shortestPath = findShortestPath(coordinatesList)

    // renderRoutes(shortestPath)
  };
  client.send();

/**
 * @param {array of coordinates} coordinatesList 
 * @returns list of coordinates sorted by shortest path
 */
function findShortestPath(coordinatesList){
  //IMPLEMENT ME
  return coordinatesList
}

//Layer containing the points rendered on top of the map
const vectorLayer = new VectorLayer({
  source: source,
});

//Layer with the actual map
const osmLayer = new TileLayer({
  source: new OSM(),
})

//View Object
let view
switch(city.toLowerCase()){
  case "buffalo":
    view = new View({
      center: fromLonLat([-78.8759022, 42.8795322]),
      zoom: 14,
    })
    break;
  case "wilmington":
    view = new View({
      center: fromLonLat([-75.549883, 39.749889]),
      zoom: 14,
    })
    break;
  default:
    view = new View({
      center: fromLonLat([0,0]),
      zoom: 1,
    })   
}

//Map Object
const map = new Map({
  target: 'map-container',
  layers: [ osmLayer, vectorLayer],
  view: view
});

// To allow the map to refresh itself
function animate() {
  map.render();
  window.requestAnimationFrame(animate);
}
animate();

// Renders routes between a list of coordinates in order
async function renderRoutes(pointsList){
  let line = new LineString(pointsList).transform('EPSG:4326', 'EPSG:3857')
  var feature = new Feature(line);
  let routeStyle = new Style({
      stroke: new Stroke({
      width: 3, 
      color: [10, 10, 10, 0.7]
      })
  })

  feature.setStyle(routeStyle);
  source.addFeature(feature)

}
