const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const url = 'mongodb://sdpygl:sdp_ygl@3.36.175.233:27017/admin';

const dbName = 'visualization';
let ProjectData = null,
  db;

const client = new MongoClient(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect(async (err, client) => {
  assert.strictEqual(null, err);
  console.log('Connected successfully to server');
  db = client.db(dbName);
});

const getProjectData = async (req, res) => {
  //not cached yet
  if (ProjectData === null) {
    try {
      ProjectData = await db.collection('projects').find({}).toArray();
    } catch (error) {
      console.log('fetching data from MongoDB Failed');
      console.err(error);
      //throw error;
    }
  }

  return ProjectData;
};

module.exports = {
  getProjectData,
};
