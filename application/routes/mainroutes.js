
const request = require('request')
const cheerio = require('cheerio')
const fs = require('fs')

// application/routes.js
module.exports = function(app, express) {

    // get an instance of the router for main routes
    const mainRoutes = express.Router()

    mainRoutes.get('/json', function(req, res){

    	//get the ?url= query tagid from request
        reqURL = req.query.url
        jsonresult = {}
        
        // https://www.pour-les-personnes-agees.gouv.fr/annuaire-ehpad-en-hebergement-permanent/13/0

        if(reqURL != null)
        {
        	request(reqURL, function(error, response, html){

		  		statuscode = response && response.statusCode
		  		jsonresult.etablissements = []

				if(!error)
				{
					$ = cheerio.load(html)
					results = $('.cnsa_results-item-inside')
					results.map(function(nodeiterator, el){
						var etablissement = {}
						etablissement.officialname = $(el).children('.row').first().children('div').first().children('h3').first().text().trim()
						etablissement.address = $(el).children('.row').first().children('.cnsa_results-infoscol')
  							.first().children('.cnsa_results-infos').first().children('.result-addr1').first().text().trim()
						etablissement.phone = $(el).children('.row').first().children('.cnsa_results-infoscol')
  							.first().children('.cnsa_results-phone').first().text().trim()
  						etablissement.typeehpad = $(el).children('.row').first().children('.cnsa_results-tags2')
  							.first().text().trim()

  						//can be multiple .result-addr2 ( if more than one, the first is BP, the second is postal + city)
  						etabpostalcodecitynodes = $(el).children('.row').first().children('.cnsa_results-infoscol')
  							.first().children('.cnsa_results-infos').first().children('.result-addr2')

  						etablissement.bp = ""
  						if(etabpostalcodecitynodes.length > 1)
  						{
  							firstnode = $(etabpostalcodecitynodes).first()
  							etablissement.bp = firstnode.text().trim()
  							etabpostalcodecity = firstnode.next().text().trim()
  						}
  						else
  						{
  							etabpostalcodecity = $(etabpostalcodecitynodes).first().text().trim()
  						}

  						etabpcctab = etabpostalcodecity.split(' ')
  						etablissement.postalcode = etabpcctab[0]
  						etablissement.city = ""
  						iteratorlength = etabpcctab.length
  						for(iteratoretabcity = 1; iteratoretabcity < iteratorlength ; iteratoretabcity++) 
  						{
  							etablissement.city = etablissement.city + " " + etabpcctab[iteratoretabcity].trim()
  						} 
  						etablissement.city = etablissement.city.trim()

  						//can show single room and double room ( first is single, if exists second is double)
  						etabcoutnodes = $(el).children('.row').first().children('.cnsa_result-compare')
  							.first().children('.cnsa_result-compare-text').first().children('.clearfix')
  						etablissement.coutsingle = "unknown"
  						etablissement.coutdouble = "unknown"
  						if(etabcoutnodes.length > 0)
  						{
  							etablissement.coutsingle = $(etabcoutnodes).first().children('.prix').first().text().trim()
  							if(etabcoutnodes.length > 1) etablissement.coutdouble = $(etabcoutnodes).first().next().children('.prix').first().text().trim()
  						}

  						jsonresult.etablissements.push(etablissement)
  					})
					res.render('index', {statuscode: statuscode ,
											error: "no error" , 
											json: jsonresult})
					/*const file = fs.createWriteStream('./result.file')
					file.write(JSON.stringify(jsonresult))
					file.end()
					const src = fs.createReadStream('./result.file')
  					src.pipe(res)*/
				}
				else 
				{
					res.render('index', {statuscode: 0 , 
											error: error ,
											json: jsonresult})
				}
			})

        }
        else
        {
        	res.render('index', {statuscode: 0 ,
        							error: "no url specified" ,
        							json: jsonresult})
        } 
    })

	// apply the routes to our application
    app.use('/', mainRoutes)

}
