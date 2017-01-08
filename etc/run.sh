#!/bin/sh
SECONDS_PER_MINUTE=60

MINUTES=60 # How many minutes to generate a tweet

DELAY=$(expr $SECONDS_PER_MINUTE \* $MINUTES)

echo "Generating tweets every $DELAY seconds."

while true; do
	echo "Generating tweet..."
	node src/ebooks.js || exit 1 
	sleep $DELAY
done
