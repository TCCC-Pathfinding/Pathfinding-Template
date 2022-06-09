import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import {Feature, Map, View} from 'ol';
import {Circle as CircleStyle, Fill, Stroke, Style, Text} from 'ol/style';
import Polyline from 'ol/format/Polyline';
import {Vector as VectorSource} from 'ol/source';
import {fromLonLat} from 'ol/proj';
import Point from 'ol/geom/Point';

/**
 * Tech Connect Project # 1
 * Restaurant Map Pathfinding
 */

//Vector Source containing features on map
const source = new VectorSource();
const coordinatesList = []

//Basic client to host JSON data
const client = new XMLHttpRequest();
client.open('GET', './data/test_data.json');


// Creates features from JSON data
// Creates routes IN ORDER from JSON input
client.onload = function () {
    const json = JSON.parse(client.responseText);
    const features = [];

    for (let location of json){
      let coords = [location["lon"],location["lat"]]
      coordinatesList.push(coords)
      let feature = new Feature({
        geometry: new Point(fromLonLat(coords)),
      })

      //Styling configuration and text
      const style = new Style({
        image: new CircleStyle({
          radius: 4,
          fill: new Fill({
            color: '#0084ff',
          }),
          stroke: new Stroke({
            color: 'black',
            width: 2,
          }),
        }),
        text: new Text({
          font: '12px Calibri,sans-serif',
          text: location["location"],
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
    console.log(features)
    //Add the features to the Vector Source
    source.addFeatures(features);
    renderRoutes(coordinatesList)
  };
  client.send();

//Layer containing the points rendered on top of the map
const vectorLayer = new VectorLayer({
  source: source,
});

//Layer with the actual map
const osmLayer = new TileLayer({
  source: new OSM(),
})

//View Object
const view = new View({
  center: fromLonLat([-78.8759022, 42.8795322]),
  zoom: 14,

})

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
  for (let i = 0; i < pointsList.length; i++){
    let loc1 = pointsList[i].toString()
    let loc2 = pointsList[i + 1].toString()
    renderRoute(loc1, loc2)
    if((i + 1) == pointsList.length - 1){
      break;
    }

  }
}

// Adds a route by creating a Polyline Feature from API call
async function renderRoute(loc1, loc2){
  const url_osrm_route = '//router.project-osrm.org/route/v1/driving/';
  let res = await fetch(url_osrm_route + loc1+ ";" + loc2)
  let json = await res.json()
  let feat = createRouteFeature(json.routes[0].geometry)
  source.addFeature(feat)
}

// Polyline Feature Object and Style
function createRouteFeature(polyline){
  var route = new Polyline({
      factor: 1e5
      }).readGeometry(polyline, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857'
      });
  
      var feature = new Feature({
  type: 'route',
  geometry: route
  });

  let routeStyle = new Style({
      stroke: new Stroke({
      width: 6, color: [10, 10, 10, 0.7]
      })
  })

  feature.setStyle(routeStyle);
  return feature
}
