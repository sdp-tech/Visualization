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

const searchData = async (req) => {
  // project_name : "test"
  // ppi_status : "Delayed"
  // sector : "Energy"
  // subsector : "Electricitry"
  // income_group: "Low income"

  let data = ProjectData;
  if (data == null) {
    await getProjectData();
    data = ProjectData;
  }

  for (const [key, value] of Object.entries(req.query)) {
    data = data.filter((datum) => {
      if (key === 'name') {
        return datum.properties.project_name
          .toLowerCase()
          .includes(value.toLowerCase());
      } else {
        return datum.properties[key] === value;
      }
    });
  }

  return data;
};

module.exports = {
  getProjectData,
  searchData,
};
