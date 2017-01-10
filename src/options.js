var options = {
	CONSUMER_KEY: process.env.CONSUMER_KEY,
	CONSUMER_SECRET: process.env.CONSUMER_SECRET,
	ACCESS_TOKEN_KEY: process.env.ACCESS_TOKEN_KEY,
	ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
	TWITTER_NAME: process.env.TWITTER_NAME,
	ORDER: parseInt(process.env.ORDER) || 2,

	// Does not post actual tweets when true
	DEBUG: (process.env.DEBUG === "true") || false,
}

Object.keys(options).forEach(function(option) {
	if (options[option] === undefined) {
		console.error(`[ERR ] Missing option ${option}`)
		process.exit(1)
	}
})

module.exports = options
