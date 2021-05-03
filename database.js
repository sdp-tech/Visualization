const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const request = require('request')

const url = 'mongodb://sdpygl:sdp_ygl@3.36.175.233:27017/admin';
const dbName = 'visualization';
let db, wbCollection, mapCollection;

// http://api.worldbank.org/v2/country/all/?format=json&page=2
const setIncomeGeograph = () => {
  try {
    wbCollection.find({}).forEach(async (element) => {
      const query = {
        "properties.country": element.name
      }, newvalues = {
        $set: {
          "properties.income_group": element.incomeLevel.value,
          "properties.geographical": element.region.value
        }
      };

      await mapCollection.updateMany(query, newvalues, function (err, res) {
        if (err) throw err;
      });
    });
  } catch (e) {
    print(e);
  }
}

const getProjectData = async () => {
  const prj_data = await mapCollection.find({}).toArray()
  return prj_data
}

MongoClient.connect(url, async function (err, client) {
  assert.equal(null, err);
  console.log("Connected successfully to server");

  db = client.db(dbName);
  mapCollection = db.collection('map')
  wbCollection = db.collection('wbcountry')
  
  request.get("http://localhost:4000/apis/update-data")
});

module.exports = {
  getProjectData
}