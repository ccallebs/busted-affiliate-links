let Page = require('./Page')

let mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/busted_affiliates')

let Site = mongoose.model('Site', {
    baseUrl: String,
    pagesLastScraped: Date,
    pages: [Page]
})

module.exports = Site
