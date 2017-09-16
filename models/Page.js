let mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/busted_affiliates')

let Page = new mongoose.Schema({
    url: { type: String, unique: true },
    affiliateLinks: [{ url: String, quantity: Number }],
    lastScraped: Date
})

module.exports = Page