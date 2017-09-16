//
// Dependencies
//
const request = require('request')
const Queue = require('bee-queue')
const queue = new Queue('busted')

//
// Models
//
const Site = require('./models/Site')
const Page = require('./models/Page')

//
// Libraries
//
Array.prototype.unique = function() {
  return this.filter(function (value, index, self) { 
    return self.indexOf(value) === index
  })
}

const fetchSiteLinks = require('./lib/fetchSiteLinks')

//
// Application
//
var siteUrl = process.argv.slice(2)[0]

request(siteUrl, (error, response, html) => {
    if (error || response.statusCode != 200) return 
        
    let findOrCreateSite = (url, andThen) => {
        let query = { baseUrl: siteUrl },
            update = { baseUrl: siteUrl, pagesLastScraped: Date.now() },
            options = { upsert: true, new: true, setDefaultsOnInsert: true }

        Site.findOneAndUpdate(query, update, options, andThen)
    }

    findOrCreateSite(siteUrl, (error, result) => {
        let links = fetchSiteLinks(html, siteUrl)

        links.forEach( (link) => {
            result.update( { '$addToSet': {
                "pages": { "url": link }
            } }, function (err, list) { })
        })
        
        result.save( (err) => {
            if (err) return

            result.pages.forEach( (page) => {
                affiliateLinks = queue.createJob({ type: 'findAffiliateLinks', siteId: result.id, page: page })
                morePages = queue.createJob({ type: 'findMorePages', siteId: result.id, page: page })

                affiliateLinks.save()
                morePages.save()
            })
        })
    })
})

queue.process(async (job, done) =>  {
    let findAffiliateLinks = (siteId, page) => {
        request(page.url, (error, response, html) => {
            Site.findOne({ _id: siteId }, (err, site) => {
                // fetch and update affiliate links
            })
        })
    }

    let findMorePages = (siteId, page) => {
        request(page, (error, response, html) => {
            Site.findOne({ _id: siteId }, (err, site) => {
                let links = fetchSiteLinks(html, site.baseUrl)

                links.forEach( (link) => {
                    site.update( { '$addToSet': {
                        "pages": { "url": link }
                    } }, function (err, list) { })
                })
            })
        })
    }

    if (job.data.type == 'findAffiliateLinks') {
        await findAffiliateLinks(job.data.siteId, job.data.page)
    } else if (job.data.type == 'findMorePages') {
        await findMorePages(job.data.siteId, job.data.page)
    }
})