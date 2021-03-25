const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const request = require('request')

const url = 'mongodb://sdpygl:sdp_ygl@3.36.175.233:27017/admin';

const dbName = 'visualization';
let db, mapCollection;

MongoClient.connect(url, async function(err, client) {
  assert.equal(null, err);
  console.log("Connected successfully to server");
 
  db = client.db(dbName);
  mapCollection = db.collection('map')
  wbCollection = db.collection('wbcountry')
  // Find some documents

  getWBAPI();
  request.get('http://localhost:4000/apis/update-data')
});


function getWBAPI(){
  try {
    wbCollection.find({}).forEach(element => {
      var query = {"properties.country":element.name};
      var newvalues = { $set: {income_group: element.incomeLevel.value , geographical: element.region.value } };
      mapCollection.updateMany(query, newvalues, function(err, res) {
        if (err) throw err;
        console.log(res.result.nModified + " document(s) updated");
      });
    });

  } catch(e) {
    print(e);
  }

}

const getData = () => {
    return new Promise((resolve, __) => {
      mapCollection.find({}).toArray(function(__, features){
        return resolve(features);
      })
  });
}

module.exports = {
  getData
}