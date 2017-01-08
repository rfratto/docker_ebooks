var Twitter = require('./twitter-rx'),
    Rx = require('rx'),
	fs = require('fs'),
	MarkovChainer = require('./markov'),
	n2c = require('./name2codepoint.js'),
	options = require('./options.js')

var client = new Twitter({
	consumer_key: options.CONSUMER_KEY,
	consumer_secret: options.CONSUMER_SECRET,
	access_token_key: options.ACCESS_TOKEN_KEY,
	access_token_secret: options.ACCESS_TOKEN_SECRET
})

var twitterUser = null

if (process.env.FILE_NAME !== undefined) {
	// Return a mock user
	twitterUser = Rx.Observable.just({ statuses_count: 1 })
} else {
	twitterUser = client.getUser(options.TWITTER_NAME)
}

twitterUser
.map((user) => user.statuses_count)
.map(function(statuses) {
	return (statuses < 3200) ? (statuses / 200) + 1 : 17
})
.flatMap(function(numOfRetrievals) {
	if (process.env.FILE_NAME !== undefined) {
		return Rx.Observable.just({
			tweets: fs.readFileSync(process.env.FILE_NAME, { encoding: 'UTF-8' }).split("\n")
		})
	}

	return client.getAllTweets(options.TWITTER_NAME, numOfRetrievals, undefined)
})
.tap((data) => console.log(`[INFO] Receieved ${data.tweets.length} tweets from ${options.TWITTER_NAME}.`))
.map((data) => data.tweets)
.map(function(tweets) {
	var mine = new MarkovChainer(options.ORDER)

	tweets.forEach(function(tweet) {
		if (tweet.search(/([\.\!\?\"\']$)/) === -1) tweet += "."

		mine.addText(tweet)
	})

	var sentence = mine.generateSentence()
	if (sentence === null) return sentence

	// Randomly drop the last word, as Horse_ebooks appears to do.
	var wordsToRemove = /(in|to|from|for|with|by|our|of|your|around|under|beyond)\s\w+$/

	if (Math.floor(Math.random() * 5) == 0 && sentence.search(wordsToRemove) !== -1) {
		console.log("[INFO] Dropping last word.")
		sentence = sentence.replace(/\s\w+.$/, '')
	}

	// If a tweet is very short, this will randomly add a second sentence
	// to it.
	if (sentence.length < 40) {
		var random = Math.floor(Math.random() * 11)
		if (random == 0 || random == 7) {
			console.log("[INFO] Short tweet. Adding another sentence randomly.")
			var newer_tweet = mine.generateSentence()
			if (newer_tweet !== null) {
				sentence += " " + newer_tweet
			}
		} else if (random == 1) {
			// Say something crazy/prophetic in all caps
			sentence = sentence.toUpperCase()
		}
	}

	// Throw out tweets
	if (sentence.length < 110) {
		for (let i = 0; i < tweets.length; i++) {
			var tweet = tweets[i]

			if (tweet.search(/([\.\!\?\"\']$)/) === -1) tweet += "."

			if (tweet.toUpperCase().replace(/ /g,'') == sentence.replace(/ /g,'').toUpperCase()) {
				console.log("[INFO] TOO SIMILAR: " + sentence)
				return null
			}
		}

		return sentence
	} else {
		console.log("[INFO] TOO LONG: " + sentence)
		return null
	}
})
.tap(function(tweet) {
	if (tweet == null) throw new Error("[INFO] Did not generate tweet.")
})
.flatMap(function(tweet) {
	console.log(`[INFO] Generated tweet: ${tweet}`)

	if (options.DEBUG) {
		return Rx.Observable.just(true)
	} else {
		return client.makeTweet({ status: tweet })
	}
})
.subscribe(function(){},function(err) {
	console.log(err.message || err)
}, function(){})
