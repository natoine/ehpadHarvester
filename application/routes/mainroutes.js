
const request = require('request')
const cheerio = require('cheerio')

// application/routes.js
module.exports = function(app, express) {

    // get an instance of the router for main routes
    const mainRoutes = express.Router()

    mainRoutes.get('/', function(req, res){

    	//get the ?url= query tagid from request
        reqURL = req.query.url

        // https://www.pour-les-personnes-agees.gouv.fr/annuaire-ehpad-en-hebergement-permanent/13/0

        if(reqURL != null)
        {
        	console.log("url : " + reqURL)
        	request(reqURL, function(error, response, html){

		  		//console.log('body:', html);
		  		statuscode = response && response.statusCode
		  		console.log('statuscode: ', statuscode) // Print the response status code if a response was received
		  		jsonresult = {}

				if(!error)
				{
					$ = cheerio.load(html)
					results = $('.cnsa_results-item-inside')
					results.map(function(nodeiterator, el){
						etabname = $(el).children('.row').first().children('div').first().children('h3').first().text().trim()
						etabadress = $(el).children('.row').first().children('.cnsa_results-infoscol')
  							.first().children('.cnsa_results-infos').first().children('.result-addr1').first().text().trim()
						etabphone = $(el).children('.row').first().children('.cnsa_results-infoscol')
  							.first().children('.cnsa_results-phone').first().text().trim()
  						etabtype = $(el).children('.row').first().children('.cnsa_results-tags2')
  							.first().text().trim()

  						//can be multiple .result-addr2 ( if more than one, the first is BP, the second is postal + city)
  						etabpostalcodecitynodes = $(el).children('.row').first().children('.cnsa_results-infoscol')
  							.first().children('.cnsa_results-infos').first().children('.result-addr2')

  						etabBP = ""
  						if(etabpostalcodecitynodes.length > 1)
  						{
  							firstnode = $(etabpostalcodecitynodes).first()
  							etabBP = firstnode.text().trim()
  							etabpostalcodecity = firstnode.next().text().trim()
  						}
  						else
  						{
  							etabpostalcodecity = $(etabpostalcodecitynodes).first().text().trim()
  						}

  						etabpcctab = etabpostalcodecity.split(' ')
  						etabpostalcode = etabpcctab[0]
  						etabcity = ""
  						iteratorlength = etabpcctab.length
  						for(iteratoretabcity = 1; iteratoretabcity < iteratorlength ; iteratoretabcity++) 
  						{
  							etabcity = etabcity + " " + etabpcctab[iteratoretabcity].trim()
  						} 
  						etabcity = etabcity.trim()

  						//can show single room and double room ( first is single, if exists second is double)
  						etabcoutnodes = $(el).children('.row').first().children('.cnsa_result-compare')
  							.first().children('.cnsa_result-compare-text').first().children('.clearfix')
  						etabcoutsingle = "unknown"
  						etabcoutdouble = "unknown"
  						if(etabcoutnodes.length > 0)
  						{
  							etabcoutsingle = $(etabcoutnodes).first().children('.prix').first().text().trim()
  							if(etabcoutnodes.length > 1) etabcoutdouble = $(etabcoutnodes).first().next().children('.prix').first().text().trim()
  						}

  						
  						console.log("etab " + nodeiterator + " : ")
  						console.log("etab name : " + etabname )
  						console.log("etab adress : " + etabadress  )
  						//console.log("etab postalcodecity : " +  etabpostalcodecity )
  						console.log("etab postalcode : " + etabpostalcode )
  						console.log("etab city : " + etabcity )
  						console.log("etab BP : " + etabBP )
						console.log("etab phone : " +  etabphone )
						console.log("etab type : " +  etabtype )
						console.log("etab coût single : " +  etabcoutsingle )
						console.log("etab coût double : " +  etabcoutdouble )
  					})
					console.log("nbResults : " + results.length)

					res.render('index', {statuscode: statuscode ,
											error: "no error" , 
											json: jsonresult})
				}
				else 
				{
					console.log('error: ', error)
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
