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

// Basic client to host JSON data
const client = new XMLHttpRequest();

/**
 * IMPORTANT! SET THIS TO YOUR LOCATION
 */
 const city = "buffalo" //Choose "buffalo" or "wilmington" based on your location

 /**
  * IMPORTANT! SET THIS TO YOUR LOCATION
  * Make sure you only have one dataset or the other, not both
  */
 client.open('GET', './data/buffalo_graph.json');
//  client.open('GET', './data/wilmington_graph.json');

// Creates features from JSON data
client.onload = function () {
    const json = JSON.parse(client.responseText);
    const nodeFeatures = []
    const restaurantFeatures = []
    const nodes = json["nodes"];
    const edges = json["edges"];

    for (let location of json["nodes"]){
      let coords = [location["lon"],location["lat"]]
      let feature = new Feature({
        geometry: new Point(fromLonLat(coords)),
      })
      // Checks if the ID doesn't contain any letters.
      if(!(/[a-zA-Z]/.test(location["id"]))){
        // Styling configuration 
        const style = new Style({
          image: new CircleStyle({
            radius: 1.5,
            fill: new Fill({
              color: '#0084ff',
            }),
            stroke: new Stroke({
              color: 'black',
              width: 1,
            }),
          })
        });

        feature.setStyle(style)
        nodeFeatures.push(feature)
      } else{
          // Styling configuration with text
          const style = new Style({
            image: new CircleStyle({
              radius: 3,
              fill: new Fill({
                color: '#FF10F0',
              }),
              stroke: new Stroke({
                color: 'black',
                width: 1,
              }),
            }),
            text: new Text({
              font: '12px Calibri,sans-serif',
              text: location["id"],
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
          restaurantFeatures.push(feature)
      }
    }
    // Add the node features to the Vector Source (You may choose to render this or not)
    source.addFeatures(nodeFeatures);
    // Add the restaurant features to Vector Source
    source.addFeatures(restaurantFeatures)

    /**
     * TODO: Implement findShortestPath function to find the shortest path between the restaurants in list of coordinates
     */
    let shortestPath = findShortestPath(nodes, edges)
    // Renders the route based on an array of coordinates e.g. [[lon, lat],[lon, lat]]
    renderRoutes(shortestPath)

  };
  client.send();

/**
 * @param nodes: Array of objects containing coordinate of street with ID, latitude and longitude
 * @param edges: Array of objects showing how each point should connect together
 * @returns Array of coordinates of route e.g. [[lon, lat],[lon, lat]]
 */
function findShortestPath(nodes, edges){
  // TODO: IMPLEMENT ME
  return []
}

// Layer containing the points rendered on top of the map
const vectorLayer = new VectorLayer({
  source: source,
});

// Layer with the actual map
const osmLayer = new TileLayer({
  source: new OSM(),
})

// View Object
let view
switch(city.toLowerCase()){
  case "buffalo":
    view = new View({
      center: fromLonLat([-78.8759022, 42.8926101]),
      zoom: 15,
    })
    break;
  case "wilmington":
    view = new View({
      center: fromLonLat([-75.549883, 39.749889]),
      zoom: 15,
    })
    break;
  default:
    view = new View({
      center: fromLonLat([0,0]),
      zoom: 1,
    })   
}

// Map Object
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
