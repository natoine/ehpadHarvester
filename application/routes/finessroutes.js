'use strict'

const fs = require('fs')
const path = require('path')
const readline = require('readline')
const stream = require('stream')

// application/routes.js
module.exports = function(app, express) {

    // get an instance of the router for main routes
    const finessRoutes = express.Router()

    finessRoutes.get("/interestingetabs", function(req, res) {
        var instream = fs.createReadStream(path.join("ressources", "listeFinessJanvier2019.csv"))
        var outstream = new stream
        outstream.readable = true
        outstream.writable = true

        var rl = readline.createInterface({
            input: instream,
            output: outstream,
            terminal: false
        })

        rl.on('line', function(line) {
            console.log(line)
            //Do your stuff ...
            //Then write to outstream
        })
    })

    // apply the routes to our application
    app.use('/finess', finessRoutes)
}