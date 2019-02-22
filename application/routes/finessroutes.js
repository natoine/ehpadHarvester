'use strict'

// application/routes.js
module.exports = function(app, express) {

    // get an instance of the router for main routes
    const finessRoutes = express.Router()

    // apply the routes to our application
    app.use('/finess', finessRoutes)
}