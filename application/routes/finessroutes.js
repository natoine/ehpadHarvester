'use strict'

const fs = require('fs')
const path = require('path')
const readline = require('readline')
const parse = require('csv-parse')

const Json2csvparser = require('json2csv').Parser
var json2csvParser = new Json2csvparser()

const categories = ['1101', '1102', '1106', '1107', '1109', '1110', '1201', '4101', '4103', '4105', '4106',
    '4107', '4301', '4304', '4305', '4401', '4402', '4404']

const subcategories = ['270']

// application/routes.js
module.exports = function (app, express) {

    // get an instance of the router for main routes
    const finessRoutes = express.Router()

    function linetojson(parsedline) {
        if ((parsedline[20] && categories.includes(parsedline[20].trim())) ||
            (parsedline[18] && subcategories.includes(parsedline[18].trim()))) {
            var adresse = parsedline[7] + " " + parsedline[8] + " " + parsedline[9] + " " + parsedline[10] + " " + parsedline[11]
            var [postCode, ...rest] = parsedline[15].split(' ')
            var etablissement = {
                id: parsedline[1],
                raisonsociale: parsedline[3],
                raisonsoscialeetendue: parsedline[4],
                adresse: adresse.trim(),
                codecommune: parsedline[12],
                ville: rest.join(' '),
                codedepartement: parsedline[13],
                departement: parsedline[14],
                codepostal: postCode,
                phone: parsedline[16],
                categorycode: parsedline[18],
                category: parsedline[19],
                agregatcategorycode: parsedline[20],
                agregatcategory: parsedline[21],
                siret: parsedline[22],
                codemft: parsedline[24],
                mft: parsedline[25],
                codesph: parsedline[26],
                sph: parsedline[27]
            }
            return etablissement
        }
    }

    function extractinterestingetablissements(inputcodeDepartement, inputcodePostal, res, process) {
        var instream = fs.createReadStream(path.join("ressources", "listeFinessJanvier2019.csv"))

        var rl = readline.createInterface({
            input: instream,
            terminal: false
        })

        var output = []
        var ids = []

        rl.on('line', function (line) {
            parse(line, { delimiter: ';' }, function (err, [parsedline]) {
                if (err) console.error("problem parsing line ", line, err)
                else {
                    if (parsedline[0] === "geolocalisation") {
                        var id = parsedline[1]
                        if (ids.includes(id)) {
                            output[ids.indexOf(id)].x = parsedline[2]
                            output[ids.indexOf(id)].y = parsedline[3]
                        }
                    }
                    else {
                        if (inputcodeDepartement && inputcodeDepartement !== 0 && parsedline[13] === inputcodeDepartement) {
                            var etablissement = linetojson(parsedline)
                            if (etablissement) {
                                output.push(etablissement)
                                ids.push(parsedline[1])
                            }
                        }
                        else if(parsedline[15])
                        {
                            if (inputcodePostal && inputcodePostal !== 0 && parsedline[15].split(' ')[0] === inputcodePostal) {
                                var etablissement = linetojson(parsedline)
                                if (etablissement) {
                                    output.push(etablissement)
                                    ids.push(parsedline[1])
                                }
                            }
                        }  
                    }
                }
            })
        })

        rl.on('close', function () {
            process(output, res)
        })

    }

    function tocsv(listeetablissements, res) {
        if(listeetablissements.length > 0 )
        {
            var csv = json2csvParser.parse(listeetablissements, function (err) {
                console.error(err)
            })
            res.setHeader('Content-disposition', 'attachment; filename=etablissements.csv')
            res.set('Content-Type', 'text/csv')
            res.status(200).send(csv)
        }
        else
        {
            console.log("pas d'établissements")
            res.end()
        }
    }

    function tojson(listeetablissements, res) {
        res.send(listeetablissements)
    }

    finessRoutes.get("/postalcode/:codepostal", function (req, res) {
        var postal = req.params.codepostal
        res.format({
            'application/json': function () {
                extractinterestingetablissements(0, postal, res, tojson)
            },
            'text/csv': function () {
                extractinterestingetablissements(0, postal, res, tocsv)
            }, 'default': function () {
                res.status(406).send('Not Acceptable')
            }
        })
    })

    finessRoutes.get("/departement/:codedepartement", function (req, res) {
        var departement = req.params.codedepartement
        res.format({
            'application/json': function () {
                extractinterestingetablissements(departement, 0, res, tojson)
            },
            'text/csv': function () {
                extractinterestingetablissements(departement, 0, res, tocsv)
            }, 'default': function () {
                res.status(406).send('Not Acceptable')
            }
        })
    })

    // apply the routes to our application
    app.use('/finess', finessRoutes)
}