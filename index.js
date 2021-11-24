const express = require('express');
const cors = require('cors');
const { getProjectData, searchData, getSearchCriteria } = require('./database');
const { counter } = require('./middlewares/middlewares');
const morgan = require('morgan');

const app = express();
const PORT = 4000;

app.use(morgan('dev'));
app.use(cors());
app.use('/', express.static(__dirname + '/node_modules/'));
app.use('/assets', express.static(__dirname + '/assets'));
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

//counter middleware returns values in res.locals
app.get('/', counter, (__, res) => res.render('index', res.locals));
app.get('/index', counter, (__, res) => res.render('index', res.locals));
app.get('/inner-page', (__, res) => res.render('inner-page'));
app.get('/m-inner-page', (__, res) => res.render('m-inner-page'));
app.get('/terms', (__, res) => res.render('terms'));
app.get('/compare', getSearchCriteria, (__, res) => res.render('compare'));

app.get('/apis/data', async (req, res) => {
  const body = await getProjectData();
  res.json({ body: body });
});

app.get('/apis/criteria', getSearchCriteria, (req, res) => {
  res.json(res.locals.criteria);
});

/*
  search example.

  GET /apis/search?name=test&&ppi_status=Delayed&&sector=Energy&&subsector=Electricity&&income_group=Low income
    name : "test" // project name
    ppi_status : "Delayed" // status
    sector : "Energy" // primary sector
    subsector : "Electricity" // sub sector
    income_group: "Low income" // income group
*/
app.get('/apis/search', async (req, res) => {
  const data = await searchData(req);
  res.json(data);
});

app.listen(PORT, () => console.log(`listen on ${PORT}`));
