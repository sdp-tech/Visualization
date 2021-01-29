const express = require('express')
const pug = require('pug')

const app = express();
const PORT = 4000;

app.use('/assets',express.static('SDPmain/assets'))
app.set('view engine', 'pug')

app.get('/inner-page', (req, res)=>res.render('inner-page'))
app.get('/', (req, res)=>res.render('index'))

app.listen(PORT, ()=>console.log(`Listen On Port ${PORT}`))
