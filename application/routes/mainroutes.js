
const request = require('request')

// application/routes.js
module.exports = function(app, express) {

    // get an instance of the router for main routes
    const mainRoutes = express.Router()

    mainRoutes.get('/', function(req, res){
    	res.render('index')
    })

	mainRoutes.get('/scrape', function(req, res){

		console.log("gonna scrape")

		url = 'https://www.pour-les-personnes-agees.gouv.fr/annuaire-ehpad-en-hebergement-permanent/13/0'

		request(url, function(error, response, html){

	  		console.log('body:', html);
	  		console.log('error:', error); // Print the error if one occurred
	  		console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received

			if(!error)
			{

			}
		})
	})


	// apply the routes to our application
    app.use('/', mainRoutes)

}
