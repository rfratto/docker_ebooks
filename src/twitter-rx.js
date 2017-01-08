// Twitter client extended with some extra rx functions
var Twitter = require('twitter')
var Rx = require('rx')

Twitter.prototype.getTweets = function(params) {
	var self = this

	return Rx.Observable.create(function(subscriber) {
		self.get('statuses/user_timeline', params, function(error, tweets) {
			if (error) {
				subscriber.onError(error)
			} else {
				tweets.forEach(subscriber.onNext.bind(subscriber))
				subscriber.onCompleted()
			}
		})
	})
}

Twitter.prototype.makeTweet = function(params) {
	var self = this

	return Rx.Observable.create(function(subscriber) {
		self.post('statuses/update', params, function(error, tweet) {
			if (error) {
				subscriber.onError(error)
			} else {
				subscriber.onNext(true)
				subscriber.onCompleted()
			}
		})
	})
}

Twitter.prototype.getUser = function(username) {
	var params = { screen_name: username }
	var self = this

	return Rx.Observable.create(function(subscriber) {
		self.get('users/show', params, function(error, user) {
			if (error) {
				subscriber.onError(error)
			} else {
				subscriber.onNext(user)
				subscriber.onCompleted()
			}
		})
	})
}

Twitter.prototype.getAllTweets = function(user, maxRetrievals, maxId) {
	var self = this

	var params = {
		screen_name: user,
		count: 200,
		max_id: maxId,
		include_rts: true,
		trim_user: true,
		exclude_replies: true
	}

	var obs = self.getTweets(params)
	.map(function(tweet) {
		return {
			id: tweet.id,
			text: tweet.text,
		}
	})
	.map(filter_tweet)
	.filter((tweet) => tweet.text.length > 0)
	.reduce(function(acc, val) { // reduce to list of tweets and maxId
		acc.tweets.push(val.text)
		acc.min_id = (val.id < acc.min_id) ? val.id : acc.min_id

		return acc
	}, { tweets: [], min_id: Number.POSITIVE_INFINITY })

	if (maxRetrievals > 0) {
		return obs.flatMap(function(data) {
			return self.getAllTweets(user, maxRetrievals - 1, data.min_id - 1)
			.map(function(newData) {
				data.tweets = data.tweets.concat(newData.tweets)
				data.min_id = (newData.min_id < data.min_id) ?
					newData.min_id : data.min_id
				return data
			})
		})
	} else {
		return obs
	}
}

var get_entity = function(str) {
	if (str.substring(0, 2) === '&#') {
		var strToConvert = ''

		if (str.substring(0, 3) === '&#x') {
			strToConvert = str.substring(3, str.length - 1)
		} else {
			strToConvert = str.substring(2, str.length - 1)
		}

		var parsed = parseInt(strToConvert, 16)
		return (parsed === NaN) ? '' : String.fromCharCode(parsed)
	} else {
		var guess = str.substring(1, str.length - 1)
		var numero = n2c[guess]

		return numero ? String.fromCharCode(numero) : ''
	}
}

var filter_tweet = function(tweet) {
	// Take out anything after RT or MT
	tweet.text = tweet.text.replace(/\b(RT|MT) .+/, '')

	// Take out URLs, hashtags, hts, etc.
	tweet.text = tweet.text.replace(/(\#|@|(h\/t)|(http))\S+/g, '')

	// Take out new lines.
	tweet.text = tweet.text.replace(/\n/g, ' ')

	// Take out quotes.
	tweet.text = tweet.text.replace(/\"|\(|\)/g, '')

	// Take out prefixed .
	tweet.text = tweet.text.replace(/^\./, '')

	var htmlsents = tweet.text.match(/'&\w+;/)
	htmlsents = htmlsents || []
	htmlsents.forEach(function(item) {
		tweet.text = tweet.text.replace(item, get_entity(item))
	})

	// Take out accented e
	tweet.text = tweet.text.replace(/\xe9/, 'e', tweet.text)

	// Trim text.
	tweet.text = tweet.text.trim()

	return tweet
}

module.exports = Twitter
