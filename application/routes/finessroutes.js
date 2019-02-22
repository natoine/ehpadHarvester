'use strict'

const fs = require('fs')
const path = require('path')
const readline = require('readline')
const stream = require('stream')
const parse = require('csv-parse')

// application/routes.js
module.exports = function(app, express) {

    // get an instance of the router for main routes
    const finessRoutes = express.Router()

    finessRoutes.get("/interestingetabs", function(req, res) {
        var instream = fs.createReadStream(path.join("ressources", "listeFinessJanvier2019.csv"))

        var rl = readline.createInterface({
            input: instream,
            terminal: false
        })

        var output = []

        rl.on('line', function(line) {
            parse(line, { delimiter: ';' }, function(err, parsedline){
                if(err) console.error("problem parsing line ", line, err)
                else 
                {
                    if(parsedline[0][20] && parsedline[0][20].trim() === "4404") output.push(parsedline[0])
                }
            })
        })

        rl.on('close', function() {
            console.log("end", output)
        })

    })

    // apply the routes to our application
    app.use('/finess', finessRoutes)
}