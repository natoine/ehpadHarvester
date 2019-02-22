'use strict'

const fs = require('fs')
const path = require('path')
const readline = require('readline')
const parse = require('csv-parse')

const Json2csvparser = require('json2csv').Parser
var json2csvParser = new Json2csvparser()

const categories = [ '1101', '1102', '1106', '1107', '1109', '1110', '1201', '4101', '4103', '4105', '4106',
                        '4107', '4301', '4304', '4305', '4401', '4402', '4404' ]

const subcategories = [ '270' ]

// application/routes.js
module.exports = function(app, express) {

    // get an instance of the router for main routes
    const finessRoutes = express.Router()

    function extractinterestingetablissements( inputcodeDepartement, inputcodePostal , res, process )
    {
        var instream = fs.createReadStream(path.join("ressources", "listeFinessJanvier2019.csv"))

        var rl = readline.createInterface({
            input: instream,
            terminal: false
        })

        var output = []
        var ids = []

        if(inputcodeDepartement && inputcodeDepartement!==0) console.log("department :", inputcodeDepartement)
        if(inputcodePostal && inputcodePostal!==0) console.log("postal :", inputcodePostal)

        rl.on('line', function(line) {
            parse(line, { delimiter: ';' }, function(err, [parsedline]){
                console.log("still working")
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
                            ville : rest.join(' '),
                            codedepartement : parsedline[13],
                            departement : parsedline[14],
                            codepostal : postCode,
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
            process(output, res)
        })

    }

    function tocsv( listeetablissements, res )
    {
        console.log("tocsv")
        var csv = json2csvParser.parse(listeetablissements, function(err){ 
            console.error(err)
        })
        res.setHeader('Content-disposition', 'attachment; filename=etablissements.csv')
        res.set('Content-Type', 'text/csv')
        res.status(200).send(csv)
    }

    function tojson( listeetablissements, res )
    {
        console.log("tojson")
        res.send(listeetablissements)
    }

    finessRoutes.get("/postalcode/:codepostal", function(req, res) {
        var postal = req.params.codepostal
        res.format({'application/json': function(){
            console.log("asked some json")
            extractinterestingetablissements( 0, postal, res, tojson)
          },
          'text/csv': function(){
            console.log("asked some csv")
            extractinterestingetablissements( 0, postal, res, tocsv)
          },'default': function(){
            res.status(406).send('Not Acceptable')
          }
        })
        
    })

    finessRoutes.get("/departement/:codedepartement", function(req, res) {
        var departement = req.params.codedepartement
        extractinterestingetablissements( departement, res, tocsv)
    })

    // apply the routes to our application
    app.use('/finess', finessRoutes)
}