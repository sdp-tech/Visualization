const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const request = require('request')

const url = 'mongodb://sdpygl:sdp_ygl@13.125.186.99:27017/admin';

const dbName = 'visualization';
let db, collection;

MongoClient.connect(url, async function(err, client) {
  assert.equal(null, err);
  console.log("Connected successfully to server");
 
  db = client.db(dbName);
  collection = db.collection('map')
  // Find some documents

  request.get('http://localhost:4000/apis/update-data')
});

const getData = () => {
    return new Promise((resolve, __) => {
      collection.find({}).toArray(function(__, features){
        return resolve(features);
      })
  });
}

module.exports = {
  getData
}