# docker_ebooks

This is a Javascript port of [tommeagher's](https://github.com/tommeagher) [heroku_ebooks](https://github.com/tommeagher/heroku_ebooks) script (which is a port of [@harrisj's](https://twitter.com/harrisj) [iron_ebooks](https://github.com/harrisj/iron_ebooks/) Ruby script.) This port is meant to be used as part of a docker image, and will post to an _ebooks Twitter account at pseudorandom intervals.

## Usage

Run the docker container with:

```
$ docker run --name docker_ebooks \
    -e "CONSUMER_KEY=<Consumer API Key>" \
	-e "CONSUMER_SECRET=<Consumer API Secret>" \
	-e "ACCESS_TOKEN_KEY=<User API Access Token>" \
	-e "ACCESS_TOKEN_SECRET=<User API Access Token Secret>" \
	-e "TWITTER_NAME=<Twitter user to source tweets from>" \
	-e "ORDER=<Optional, defaults to 2. Higher numbers are less silly>"
	-e "GENERATE_FREQUENCY=<Optional, defaults to 60. How many minutes between each tweet attempt.>" \
	-e "MIN_GENERATE_FREQUENCY=<Optional, defaults to GENERATE_FREQUENCY if omitted. Minimum number of minutes between each attempt.>" \
	-e "MAX_GENERATE_FREQUENCY=<Optional, defaults to GENERATE_FREQUENCY if omitted. Maximum number of minutes between each attempt.>" \
	rfratto/docker_ebooks
```
