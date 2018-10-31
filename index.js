var express = require('express')
var app = express()

const morgan       = require('morgan')
app.use(morgan('dev')) // log every request to the console

var request = require('request')

app.get('/scrape', function(req, res){

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

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})