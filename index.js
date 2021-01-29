const express = require('express')

const app = express()
const PORT = 4000

app.use('/assets', express.static('SDPmain/assets/'))
app.set('view engine', 'pug')

app.get('/', (req, res)=>res.render('index'))
app.get('/inner-page', (req, res)=>res.render('inner-page'))
app.get('/test', (req, res)=>{

})

app.listen(PORT, ()=>console.log(`listen on ${PORT}`))