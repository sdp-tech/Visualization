const mongodb = require('./database')
const express = require('express')
const cors = require('cors')

const app = express()
const PORT = 4000
var cached_json = ""

app.use(cors())
app.use('/', express.static(__dirname+ '/node_modules/'));
app.use('/assets', express.static(__dirname+'/assets'));
app.set('view engine', 'pug')

app.get('/', (__, res)=>res.render('index'))
app.get('/index', (__, res)=>res.render('index'))
app.get('/inner-page', (__, res)=>res.render('inner-page'))
app.get('/m-inner-page', (__, res)=>res.render('m-inner-page'))
app.get('/apis/update-data', (__, res) => {
  mongodb.getData().then(data=>{cached_json = data});
  return res.redirect('/inner-page')
})

app.get('/apis/data', (__, res)=> res.json({"body":cached_json}))

app.listen(PORT, ()=>console.log(`listen on ${PORT}`))
