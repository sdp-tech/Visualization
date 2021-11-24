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

/*
    ppi_status : "Delayed" // status
    sector : "Energy" // primary sector
    subsector : "Electricity" // sub sector
    income_group: "Low income" // income group
*/
const getSearchCriteria = async (req, res, next) => {
  let data = ProjectData;
  if (data == null) {
    await getProjectData();
    data = ProjectData;
  }

  let sector = {};
  let ppi_status = ['Delayed', 'Canceled'];
  let income_group = new Set();

  for (const data of ProjectData) {
    // ppi_status.add(data.properties.ppi_status);
    if (data.properties.sector in sector) {
      sector[data.properties.sector].add(data.properties.subsector);
    } else {
      sector[data.properties.sector] = new Set([data.properties.subsector]);
    }

    if (data.properties.income_group == null) {
      continue;
    }
    income_group.add(data.properties.income_group);
  }

  for (const [key, value] of Object.entries(sector)) {
    sector[key] = Array.from(value);
  }

  const criteria = {
    ppi_status,
    sector,
    income_group: Array.from(income_group),
  };

  res.locals.criteria = criteria;
  next();
};

const searchData = async (req) => {
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
      } else if (key === 'ppi_status') {
        if (value === 'Delayed') {
          return datum.properties.ppi_status.toLowerCase().includes('delay');
        } else if (value === 'Canceled') {
          return datum.properties.ppi_status.toLowerCase().includes('cancel');
        }
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
  getSearchCriteria,
};
