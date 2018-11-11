
const request = require('request')
const cheerio = require('cheerio')
const fs = require('fs')
const Json2csvparser = require('json2csv').Parser

// application/routes.js
module.exports = function(app, express) {

    // get an instance of the router for main routes
    const mainRoutes = express.Router()

    function parseonepagecontentfrompersonnesageesgouvfr(html, etablissements)
    {
    	$ = cheerio.load(html)
    	results = $('.cnsa_results-item-inside')

    	results.map(function(nodeiterator, el)
    	{
			var etablissement = {}
			etablissement.officialname = $(el).children('.row').first().children('div').first().children('h3').first().text().trim()
			etablissement.address = $(el).children('.row').first().children('.cnsa_results-infoscol')
  				.first().children('.cnsa_results-infos').first().children('.result-addr1').first().text().trim()
			etablissement.phone = $(el).children('.row').first().children('.cnsa_results-infoscol')
  				.first().children('.cnsa_results-phone').first().text().trim()
  			etablissement.typeehpad = $(el).children('.row').first().children('.cnsa_results-tags2').first().text().trim()

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
  			else	etabpostalcodecity = $(etabpostalcodecitynodes).first().text().trim()

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

  			etablissements.push(etablissement)
  		})
  		return etablissements
    }

    function recursiveparsehtmlfrompersonnesageesgouvfr(cptpages, data, maxcptpages, process)
    {
    	//console.log("recursiveparsehtmlfrompersonnesageesgouvfr cptpages : " + cptpages)
    	if(cptpages > maxcptpages)
    	{
    		process(data)
    	}
    	else
    	{
    		//construct new url
    		url = data.url + "?page=" + cptpages
    		//console.log("recursiv call new url : " + url)
    		request( url, function(error, response, html)
    			{
    				if(!error)
    				{
    					etablissements = parseonepagecontentfrompersonnesageesgouvfr(html, etablissements)
    					recursiveparsehtmlfrompersonnesageesgouvfr(cptpages + 1, data, maxcptpages, process)
    				}
    				else
    				{
    					console.log("recursiv call cptpages : " + error)
   						process(data)
    				}
    			})
    	}
    }

    function parsehtmlfrompersonnesageesgouvfr(error, response, html, url, postal, process) 
    {
    	statuscode = response && response.statusCode
    	jsonresult = {}
    	jsonresult.etablissements = []
  		etablissements = jsonresult.etablissements

  		if(!error)
  		{
  			$ = cheerio.load(html)
  			maxcptpages = 0
  			try{
  				maxcptpages = $('#cnsa_results-pager').children('div').first().children('ul').first().children('.last').first().children('a').first().attr('href').split('?page=')[1]	
  			}
  			catch(error)
  			{
  				console.log("parsehtmlfrompersonnesageesgouvfr try maxcptpages error : " + error)
  			}
			
			//parse the first page
			etablissements = parseonepagecontentfrompersonnesageesgouvfr(html, etablissements)

  			data = {
          postal: postal,
  				url : url,
  				nbpages : maxcptpages ,
  				statuscode: statuscode ,
					error: "no error" , 
					json: jsonresult
				}
			
  			if(maxcptpages)
  			{
  				//recursiv call for other pages
  				recursiveparsehtmlfrompersonnesageesgouvfr(1, data, maxcptpages, process)
  			}
  			else
  			{
  				process(data)
  			}
		  }
  		else 
  		{
  			data = {
  					postal: postal,
            url : "",
  					nbpages : 0 ,
  					statuscode: 0 , 
  					error: error ,
  					json: jsonresult
  				}
  			process(data)
  		}
    }

    mainRoutes.get('/', function(req, res) {
    	jsonresult = {}
    	jsonresult.etablissements = []
        data = {
              postal: "",
              url : "",
        			nbpages : 0 ,
        			statuscode: 0 ,
        			error: "no url specified" ,
        			json: jsonresult}
    	res.render('index', data)
    })

    mainRoutes.get('/:codepostal/:km', function(req, res){
      postal = req.params.codepostal
      km = req.params.km
      reqURL = `https://www.pour-les-personnes-agees.gouv.fr/annuaire-ehpad-en-hebergement-permanent/${postal}/${km}`
      jsonresult = {}
      jsonresult.etablissements = []

      data = {
              postal : postal,
              url : reqURL,
              nbpages : 0 ,
              statuscode: 0 ,
              error: "no url specified" ,
              json: jsonresult
            }
      if(postal != null)
      {
          res.format({
              'application/json': function(){
                request(reqURL, function(error, response, html){ parsehtmlfrompersonnesageesgouvfr(error, response, html, reqURL, postal, function(data) { 
                  res.send(data)} 
                )} )
              },
              'text/csv': function(){
                request(reqURL, function(error, response, html){ parsehtmlfrompersonnesageesgouvfr(error, response, html, reqURL, postal, function(data) {
                  fields = [ 'officialname', 'address', 'phone', 'typeehpad', 'bp', 'postalcode', 'city', 'coutsingle', 'coutdouble' ]
                  
                  json2csvParser = new Json2csvparser({ fields })
                  if(data.json.etablissements.length > 0 )
                  {
                    csv = json2csvParser.parse(data.json.etablissements, function(err){ res.redirect('/')})
                    res.setHeader('Content-disposition', 'attachment; filename=ehpad.csv')
                    res.set('Content-Type', 'text/csv')
                    res.status(200).send(csv)
                  }
                })} )
              },
              'text/html': function(){
                request(reqURL, function(error, response, html){ parsehtmlfrompersonnesageesgouvfr(error, response, html, reqURL, postal, function(data) { 
                  res.render('index', data)} 
                )} )
              },
              'default': function(){
                res.status(406).send('Not Acceptable')
              }
            })
      }
      else res.render('index', data)
    })

    mainRoutes.get('/:countycode', function(req, res){
      postal = req.params.countycode
      reqURL = `https://www.pour-les-personnes-agees.gouv.fr/annuaire-ehpad-en-hebergement-permanent/${postal}/0`
      jsonresult = {}
      jsonresult.etablissements = []

      data = {
              postal : postal,
              url : reqURL,
              nbpages : 0 ,
              statuscode: 0 ,
              error: "no url specified" ,
              json: jsonresult
            }

      if(postal != null)
        {
          request(reqURL, function(error, response, html){ parsehtmlfrompersonnesageesgouvfr(error, response, html, reqURL, postal, function(data) { 
            res.render('index', data)} 
            )} )
        }
        else res.render('index', data)
    })    

	// apply the routes to our application
    app.use('/', mainRoutes)

}
