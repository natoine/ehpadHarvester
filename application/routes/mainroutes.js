
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

				if(!error)
				{
					$ = cheerio.load(html)
					results = $('.cnsa_results-item-inside') 
					results.map(function(i, el){
						etabname = $(el).children('.row').first().children('div').first().children('h3').first().text().trim()
						etabadress = $(el).children('.row').first().children('.cnsa_results-infoscol')
  							.first().children('.cnsa_results-infos').first().children('.result-addr1').first().text().trim()
						etabphone = $(el).children('.row').first().children('.cnsa_results-infoscol')
  							.first().children('.cnsa_results-phone').first().text().trim()

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
  						for(i = 1; i < iteratorlength ; i++) 
  						{
  							etabcity = etabcity + " " + etabpcctab[i].trim()
  						} 
  						etabcity = etabcity.trim()
  						
  						console.log("etab " + i + " : ")
  						console.log("etab name : " + etabname )
  						console.log("etab adress : " + etabadress  )
  						console.log("etab postalcodecity : " +  etabpostalcodecity )
  						console.log("etab postalcode : " + etabpostalcode )
  						console.log("etab city : " + etabcity )
  						console.log("etab BP : " + etabBP )
						console.log("etab phone : " +  etabphone )
						//console.log(i + " etab type : " +  $(el).children('.row').first().children('div').first().children('h3').first().text() )
						//console.log(i + " etab coût : " +  $(el).children('.row').first().children('div').first().children('h3').first().text() )
  					})
					console.log("nbResults : " + results.length)

					res.render('index', {statuscode: statuscode ,
											error: "no error"})
				}
				else 
				{
					console.log('error: ', error)
					res.render('index', {statuscode: 0 , 
											error: error})
				}
			})

        }
        else
        {
        	res.render('index', {statuscode: 0 ,
        							error: "no url specified"})
        } 
    })

	// apply the routes to our application
    app.use('/', mainRoutes)

}
