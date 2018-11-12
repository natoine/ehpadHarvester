# ehpadHarvester
* works on https://ehpadharvester.herokuapp.com/
* harvest data from https://www.pour-les-personnes-agees.gouv.fr/annuaire-ehpad-en-hebergement-permanent
for examples how to get EHPAD in personnes-agees.gouv.fr :
* https://www.pour-les-personnes-agees.gouv.fr/annuaire-ehpad-en-hebergement-permanent/75/0 get you all the ehpad from the 7 pages of result
* https://www.pour-les-personnes-agees.gouv.fr/annuaire-ehpad-en-hebergement-permanent/34830/1 get you all the ehpad from the page of result

In EHPAD Havrevester you have two routes :
* GET /:countycode sends you all the EHPAD of a county. 
* GET /:postalcode/:km sends you all the EHPAD in a perimeter of km around the city identified by postalcode

with content negotiation :
** You can get JSon ('accept' : 'application/json')
** You can get CSV ('accept' : 'text/csv')