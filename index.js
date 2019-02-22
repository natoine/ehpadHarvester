const port     = process.env.PORT || 8080

const express = require('express')
const app = express()

const morgan       = require('morgan')
app.use(morgan('dev')) // log every request to the console

app.set('view engine', 'ejs') // set up ejs for templating

// routes ======================================================================
require('./application/routes/mainroutes.js')(app, express)
require('./application/routes/finessroutes.js')(app, express)

// launch ======================================================================
app.listen(port)
console.log('The magic happens on port ' + port)
