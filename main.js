import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import {Feature, Map, View} from 'ol';
import {Circle as CircleStyle, Fill, Stroke, Style, Text} from 'ol/style';
import {Vector as VectorSource} from 'ol/source';
import {fromLonLat} from 'ol/proj';
import Point from 'ol/geom/Point';

//Vector Source containing features on map
const source = new VectorSource();

//Basic client to host JSON data
const client = new XMLHttpRequest();
client.open('GET', './data/test_data.json');

client.onload = function () {
    const json = JSON.parse(client.responseText);
    const features = [];

    for (let location of json){
      let feature = new Feature({
        geometry: new Point(fromLonLat([location["lon"],location["lat"]])),
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

    //Add the features to the Vector Source
    source.addFeatures(features);
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

// This is so the map refreshes itself
function animate() {
  map.render();
  window.requestAnimationFrame(animate);
}
animate();
