'use strict'

const fs = require('fs')
const path = require('path')
const readline = require('readline')
const parse = require('csv-parse')

const categories = [ '1101', '1102', '1106', '1107', '1109', '1110', '1201', '4101', '4103', '4105', '4106',
                        '4107', '4301', '4304', '4305', '4401', '4402', '4404' ]

const subcategories = [ '270' ]

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
                    if(parsedline[0][20] && categories.includes(parsedline[0][20].trim())) output.push(parsedline[0])
                    else if(parsedline[0][18] && subcategories.includes(parsedline[0][18].trim())) output.push(parsedline[0])
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