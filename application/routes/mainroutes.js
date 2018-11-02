
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
					console.log($)
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
