const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const request = require('request')

const url = 'mongodb://sdpygl:sdp_ygl@13.125.186.99:27017/admin';

const dbName = 'visualization';
let db, collection, geojson_total_document;

MongoClient.connect(url, async function(err, client) {
  assert.equal(null, err);
  console.log("Connected successfully to server");
 
  db = client.db(dbName);
  collection = db.collection('map')
  // Find some documents

  request.get('http://localhost:4000/apis/update-data')
});

const geojsonlize = ()=>{
    return new Promise((resolve, reject) =>{
        geojson_total_document =  collection.find({}).toArray(function(__, docs) {
        var geojson_feature_storage = []
        docs[0].Features.map( document =>{
          const geojson_feature = {
            "type":"Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [(document.geometry.coordinates[0]), (document.geometry.coordinates[1])],
            },
            "properties": document.properties
          }
          geojson_feature_storage.push(geojson_feature)
        })
        geojson_total_document = {
          "type": "FeatureCollection",
          "features": geojson_feature_storage
          }
          resolve( geojson_total_document)
      });
    })
        
}

module.exports = {
    geojson_total_document,
    geojsonlize
}