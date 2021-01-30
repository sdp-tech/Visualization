const mongodb = require('./database')
const express = require('express')
const cors = require('cors')

const app = express()
const PORT = 4000
var cached_json = ""

app.use(cors())
app.use('/assets', express.static('SDPmain/assets/'))
app.set('view engine', 'pug')

app.get('/', (__, res)=>res.render('index'))
app.get('/inner-page', (__, res)=>res.render('inner-page'))
app.get('/inner-page.html', (__, res)=>res.render('inner-page'))
app.get('/apis/update-data', (__, res) => {
  mongodb.geojsonlize().then(data=>{cached_json = data});
  return res.redirect('/inner-page')
})

app.get('/apis/data', (__, res)=> res.json({"body":cached_json}))

app.listen(PORT, ()=>console.log(`listen on ${PORT}`))