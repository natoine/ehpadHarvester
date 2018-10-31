
const request = require('request')

// application/routes.js
module.exports = function(app, express) {

    // get an instance of the router for main routes
    const mainRoutes = express.Router()

    mainRoutes.get('/', function(req, res){
    	res.render('index')

    	//get the ?url= query tagid from request
        reqURL = req.query.url

        // https://www.pour-les-personnes-agees.gouv.fr/annuaire-ehpad-en-hebergement-permanent/13/0

        if(reqURL != null)
        {
        	console.log("url : " + reqURL)
        	request(reqURL, function(error, response, html){

		  		//console.log('body:', html);
		  		console.log('statusCode:', response && response.statusCode) // Print the response status code if a response was received

				if(!error)
				{

				}
				else console.log('error:', error)
			})

        }
        else console.log("url is null :(")
    })

	// apply the routes to our application
    app.use('/', mainRoutes)

}
