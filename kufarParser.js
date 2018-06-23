const request = require('request')
const qs = require('querystring')
const urlParser = require('url')

class KufarParser {
    constructor(searchUrl, catIds, queryValues) {
        this.kufarPreSearchUrl = searchUrl
        this.searchQueries = queryValues
        this.previousResults = {}
        this.targetCategoryIds = catIds
    }

    search(url, callback) {
        let that = this
        return request(url, function(err, resp, body) {
            that.compareSearch(url, JSON.parse(body), callback)
        })
    }

    searchAll(clb) {
        for (let query of this.searchQueries) {
            this.search(this.kufarPreSearchUrl + '?q=' + qs.escape(query), clb)
        }
    }

    compareSearch(url, result, callback) {
        var url_parts = urlParser.parse(url, true)
        var query = url_parts.query
        if (typeof this.previousResults[url] === 'undefined') {
            /*eslint no-console: ["error", { allow: ["warn", "error"] }] */
            console.warn('Initial search was performed for', query)
            this.previousResults[url] = result
        }

        if (result.categories.length !== 0) {
            for (var category of result.categories) {
                if (this.targetCategoryIds.includes(category.id)) {
                    var previous = this.previousResults[url].categories.find(function(value) {
                        return (value.id === category.id && value.count < category.count)
                    })
                    if (typeof previous !== 'undefined') {
                        callback(`${JSON.stringify(query)} ${category.name}:${category.count}[${previous.count}]`)
                    }
                }
            }
        }

        this.previousResults[url] = result
        return
    }
}

module.exports = KufarParser