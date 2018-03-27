const request = require('request')
const http = require('http')
const qs = require('querystring')

module.exports = class KufarParser {
    constructor() {
        this.kufarPreSearchUrl = 'https://www.kufar.by/presearch.json'
        this.searchQueries = ['плеер', 'аудиоплеер']
        this.previousResults = {};
        this.targetCategoryIds = ['5020', '4030']
    }

    search(url, callback) {
        let that = this;
        return request(url, function(err, resp, body) {
            that.compareSearch(url, JSON.parse(body), callback);
        })
    }

    searchAll(clb) {
        for (let query of this.searchQueries) {
            this.search(this.kufarPreSearchUrl + '?q=' + qs.escape(query), clb)
        }
    }

    compareSearch(url, result, callback) {
        if (typeof this.previousResults[url] === 'undefined') {
            console.log('Initial search')
            this.previousResults[url] = result;
        }

        for (var category of result.categories) {
            if (this.targetCategoryIds.includes(category.id)) {
                var previous = this.previousResults[url].categories.find(function(value) {
                    return (value.id === category.id && value.count !== category.count)
                });
                if (typeof previous !== 'undefined') {
                    var msg = JSON.stringify(result.suggest)
                    callback(`${msg} ${category.name}::${category.count}::${previous.count}`)
                }
            }
        }

        this.previousResults[url] = result
        return;
    }
}