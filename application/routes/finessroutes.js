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
        var ids = []

        rl.on('line', function(line) {
            parse(line, { delimiter: ';' }, function(err, [parsedline]){
                if(err) console.error("problem parsing line ", line, err)
                else 
                {
                    if((parsedline[20] && categories.includes(parsedline[20].trim())) || 
                    (parsedline[18] && subcategories.includes(parsedline[18].trim())))
                    {
                        var adresse = parsedline[7] + " " + parsedline[8] + " " + parsedline[9] + " " + parsedline[10] + " " + parsedline[11]
                        var [postCode, ...rest] = parsedline[15].split(' ');
                        var etablissement = {
                            id : parsedline[1],
                            raisonsociale : parsedline[3],
                            raisonsoscialeetendue : parsedline[4],
                            adresse :  adresse.trim(),
                            codecommune : parsedline[12],
                            codedepartement : parsedline[13],
                            departement : parsedline[14],
                            codepostal : postCode,
                            ville : rest.join(' '),
                            phone : parsedline[16],
                            categorycode : parsedline[18],
                            category : parsedline[19],
                            agregatcategorycode : parsedline[20],
                            agregatcategory : parsedline[21],
                            siret : parsedline[22],
                            codemft : parsedline[24],
                            mft : parsedline[25],
                            codesph : parsedline[26],
                            sph : parsedline[27] 
                        }
                        output.push(etablissement)
                        ids.push(parsedline[1])
                    }
                    else if(parsedline[0] === "geolocalisation")
                    {
                        var id = parsedline[1]
                        if(ids.includes(id))
                        {
                            output[ids.indexOf(id)].x = parsedline[2]
                            output[ids.indexOf(id)].y = parsedline[3]
                        }
                    }
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