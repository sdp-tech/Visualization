const mongodb = require('./database')
const express = require('express')
const cors = require('cors')
const middlewares = require('./middlewares')

const app = express()
const PORT = 4000
var projectInfos = Object()

app.use(cors())
app.use('/', express.static(__dirname+ '/node_modules/'));
app.use('/assets', express.static(__dirname+'/assets'));
app.set('views', __dirname + '/views');
app.set('view engine', 'pug')

app.get('/', middlewares.counter)
app.get('/index', middlewares.counter)
app.get('/inner-page', (__, res)=>res.render('inner-page'))
app.get('/m-inner-page', (__, res)=>res.render('m-inner-page'))
app.get('/terms', (__, res)=>res.render('terms'))

app.get('/apis/update-data', (__, res) => {
  mongodb.getProjectData().then(data=>{projectInfos = data});
  return res.redirect('/inner-page')
})

app.get('/apis/data', (__, res)=> res.json({"body":projectInfos}))

app.listen(PORT, ()=>console.log(`listen on ${PORT}`))
