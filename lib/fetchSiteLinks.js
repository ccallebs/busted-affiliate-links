const cheerio = require('cheerio')

let fetchSiteLinks = (html, siteUrl) => {
	var $ = cheerio.load(html)

	let isFromUrl = (url) => {
		return (i, el) => {
			dest = $(el).attr('href')
			return (dest != undefined && dest.indexOf(url) == 0)
		}
	}

	let isNotImage = (url) => {
		return (i, el) => {
			dest = $(el).attr('href')
			return (url.match(/\.(jpeg|jpg|gif|png)$/) == null)
		}
	}
	
	var allLinks = $('a').filter(isFromUrl(siteUrl)).filter(isNotImage(siteUrl)).map( (i, el) => {
		return $(el).attr('href')
	}).get()

	var links = allLinks.map( (el) => {
		return el.split("#")[0]
	}).map(function(el) { 
		let lastChar = el.slice(-1)

		if (lastChar == '/') {
			return el.slice(0, el.length - 1)
		} else {
			return el
		}
	}).unique()

	return links
}

module.exports = fetchSiteLinks